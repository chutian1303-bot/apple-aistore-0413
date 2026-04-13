#!/usr/bin/env node

import { writeFile } from 'node:fs/promises';
import path from 'node:path';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';

const BUY_PAGE_URLS = [
  'https://www.apple.com/cn/shop/buy-iphone',
  'https://www.apple.com/cn/shop/buy-mac',
  'https://www.apple.com/cn/shop/buy-ipad',
  'https://www.apple.com/cn/shop/buy-watch'
];

const PRODUCT_SELECTION_URLS = [
  'https://www.apple.com/cn/shop/buy-airpods/airpods-pro-3',
  'https://www.apple.com/cn/shop/buy-airpods/airpods-4',
  'https://www.apple.com/cn/shop/buy-airpods/airpods-max',
  'https://www.apple.com/cn/shop/buy-homepod/homepod-mini',
  'https://www.apple.com/cn/shop/buy-airtag/airtag'
];

const BASE_URL = 'https://www.apple.com/cn';
const OUTPUT_PATH = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../products.json');
const RETRY_LIMIT = 3;
const REQUEST_DELAY_MS = 350;

function sleep(ms) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

async function fetchText(url) {
  const response = await fetch(url);
  return response.text();
}

function extractBalanced(text, startIndex) {
  const startChar = text[startIndex];
  const pairMap = { '{': '}', '[': ']' };
  const endChar = pairMap[startChar];
  if (!endChar) {
    return null;
  }

  let depth = 0;
  let inString = false;
  let escaped = false;
  let quoteChar = '';

  for (let index = startIndex; index < text.length; index += 1) {
    const char = text[index];

    if (inString) {
      if (escaped) {
        escaped = false;
      } else if (char === '\\') {
        escaped = true;
      } else if (char === quoteChar) {
        inString = false;
      }
      continue;
    }

    if (char === '"' || char === '\'' || char === '`') {
      inString = true;
      quoteChar = char;
      continue;
    }

    if (char === startChar) {
      depth += 1;
      continue;
    }

    if (char === endChar) {
      depth -= 1;
      if (depth === 0) {
        return text.slice(startIndex, index + 1);
      }
    }
  }

  return null;
}

function extractJsonObject(text, startIndex) {
  return extractBalanced(text, startIndex);
}

function normalizeText(value) {
  return String(value || '').replace(/\u00A0/g, ' ').replace(/\s+/g, ' ').trim();
}

function parsePriceText(value) {
  if (!value) {
    return null;
  }

  const plainText = String(value).replace(/<[^>]*>/g, ' ');
  const matched = plainText.match(/RMB\s*([\d,]+)/i) || plainText.match(/¥\s*([\d,]+)/i) || plainText.match(/([\d,]{3,})/);
  if (!matched) {
    return null;
  }

  return Number(matched[1].replace(/,/g, ''));
}

function parsePriceToken(value) {
  if (!value) {
    return null;
  }

  const normalized = String(value).replace(/_/g, '.');
  const parsed = Number(normalized);
  if (!Number.isFinite(parsed) || parsed <= 0) {
    return null;
  }

  return Math.round(parsed * 100) / 100;
}

function cleanImageUrl(srcSet) {
  if (!srcSet) {
    return '';
  }

  const decoded = String(srcSet).replace(/&amp;/g, '&');
  const firstSet = decoded.split(',')[0].trim();
  return firstSet.split(/\s+/)[0];
}

function normalizeLink(url) {
  if (!url) {
    return '';
  }

  const normalizedDomain = String(url).replace('https://www.apple.com.cn', BASE_URL);

  try {
    const parsed = new URL(normalizedDomain, BASE_URL);
    if (parsed.hostname === 'www.apple.com' && parsed.pathname.startsWith('/shop/')) {
      parsed.pathname = `/cn${parsed.pathname}`;
    }
    return parsed.toString();
  } catch {
    return '';
  }
}

function createSlug(value) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function toProductRecord(rawItem) {
  const name = normalizeText(rawItem.name);
  const link = normalizeLink(rawItem.link);
  const image = cleanImageUrl(rawItem.image);
  const price = Number(rawItem.price);
  const partNumber = normalizeText(rawItem.partNumber).toUpperCase();

  if (!name || !link || !image || !Number.isFinite(price) || price <= 0) {
    return null;
  }

  return {
    name,
    link,
    image,
    price,
    partNumber,
    source: rawItem.source
  };
}

function parseModelNameFromTitle(html) {
  const titleRaw = (html.match(/<title>(.*?)<\/title>/i) || [])[1] || '';
  const title = normalizeText(titleRaw);
  const matched = title.match(/^购买\s+(.+?)\s*-\s*Apple/i) || title.match(/^Buy\s+(.+?)\s*-\s*Apple/i);
  return matched ? normalizeText(matched[1]) : title;
}

function buildVariantName(baseName, variant) {
  const cleanBase = normalizeText(baseName);
  const cleanVariant = normalizeText(variant).replace(/-/g, ' ');
  if (!cleanVariant) {
    return cleanBase;
  }

  if (cleanBase.includes(cleanVariant)) {
    return cleanBase;
  }

  return `${cleanBase} - ${cleanVariant}`;
}

function extractAssignmentObject(html, marker) {
  const markerIndex = html.indexOf(marker);
  if (markerIndex < 0) {
    return null;
  }

  const objectStart = html.indexOf('{', markerIndex + marker.length);
  if (objectStart < 0) {
    return null;
  }

  const objectText = extractBalanced(html, objectStart);
  if (!objectText) {
    return null;
  }

  try {
    return vm.runInNewContext(`(${objectText})`);
  } catch {
    return null;
  }
}

function isChinaPartNumber(partNumber) {
  return /(CH\/A|FE\/A)$/i.test(partNumber);
}

async function fetchBuyPageProducts(pageUrl) {
  let html = '';
  for (let attempt = 1; attempt <= RETRY_LIMIT; attempt += 1) {
    html = await fetchText(pageUrl);
    if (html.includes('"heroStoreCard":{')) {
      break;
    }
    if (attempt < RETRY_LIMIT) {
      await sleep(REQUEST_DELAY_MS * attempt);
    }
  }

  const records = [];
  let cursor = 0;

  while (true) {
    cursor = html.indexOf('"heroStoreCard":{', cursor);
    if (cursor < 0) {
      break;
    }

    const objectStart = html.indexOf('{', cursor);
    cursor = objectStart + 1;

    const objectText = extractJsonObject(html, objectStart);
    if (!objectText) {
      continue;
    }

    let card;
    try {
      card = JSON.parse(objectText);
    } catch {
      continue;
    }

    const record = toProductRecord({
      name: card?.title?.link?.text,
      link: card?.title?.link?.url,
      image: card?.cardImage?.sources?.[0]?.srcSet || card?.cardImage?.defaultSource,
      price: parsePriceText(card?.productPrice?.priceData?.fullPrice?.raw?.price)
        || parsePriceText(card?.productPrice?.priceData?.fullPrice?.priceString)
        || parsePriceText(card?.offerPrice?.priceData?.fullPrice?.raw?.price)
        || parsePriceText(card?.offerPrice?.priceData?.fullPrice?.priceString),
      partNumber: card?.title?.link?.omnitureData?.partNumber || '',
      source: pageUrl
    });

    if (record) {
      records.push(record);
    }
  }

  return records;
}

async function fetchProductSelectionProducts(pageUrl) {
  let html = '';
  for (let attempt = 1; attempt <= RETRY_LIMIT; attempt += 1) {
    html = await fetchText(pageUrl);
    if (html.includes('window.PRODUCT_SELECTION_BOOTSTRAP =')) {
      break;
    }
    if (attempt < RETRY_LIMIT) {
      await sleep(REQUEST_DELAY_MS * attempt);
    }
  }

  const modelName = parseModelNameFromTitle(html);
  const bootstrap = extractAssignmentObject(html, 'window.PRODUCT_SELECTION_BOOTSTRAP = ');
  const productData = bootstrap?.productSelectionData;
  if (!productData) {
    return [];
  }

  const imageDictionary = productData.imageDictionary || {};
  const products = Array.isArray(productData.products) ? productData.products : [];
  const records = [];

  for (const product of products) {
    const partNumber = normalizeText(product.partNumber).toUpperCase();
    if (!partNumber || !isChinaPartNumber(partNumber)) {
      continue;
    }

    const image = imageDictionary[product.imageKey]?.sources?.[0]?.srcSet || '';
    const name = buildVariantName(modelName, product.seoUrlToken);
    const price = parsePriceToken(product.price);

    const record = toProductRecord({
      name,
      link: pageUrl,
      image,
      price,
      partNumber,
      source: pageUrl
    });

    if (record) {
      records.push(record);
    }
  }

  return records;
}

function dedupeRecords(records) {
  const seen = new Set();
  const deduped = [];

  for (const record of records) {
    const key = record.partNumber || `${record.name}|${record.link}`;
    if (seen.has(key)) {
      continue;
    }
    seen.add(key);
    deduped.push(record);
  }

  return deduped;
}

function assignIds(records) {
  const idCounter = new Map();

  return records.map((record, index) => {
    const fromPart = createSlug(record.partNumber.replace('/', '-'));
    const fromName = createSlug(record.name);
    const baseId = fromPart || fromName || `apple-product-${index + 1}`;

    const seen = idCounter.get(baseId) || 0;
    idCounter.set(baseId, seen + 1);

    const id = seen ? `${baseId}-${seen + 1}` : baseId;

    return {
      id,
      name: record.name,
      price: record.price,
      image: record.image,
      link: record.link
    };
  });
}

async function main() {
  const coreProducts = [];
  for (const pageUrl of BUY_PAGE_URLS) {
    const items = await fetchBuyPageProducts(pageUrl);
    coreProducts.push(...items);
    await sleep(REQUEST_DELAY_MS);
  }

  const accessoryProducts = [];
  for (const pageUrl of PRODUCT_SELECTION_URLS) {
    const items = await fetchProductSelectionProducts(pageUrl);
    accessoryProducts.push(...items);
    await sleep(REQUEST_DELAY_MS);
  }

  const combined = dedupeRecords([...coreProducts, ...accessoryProducts]);
  const products = assignIds(combined);

  await writeFile(OUTPUT_PATH, `${JSON.stringify(products, null, 2)}\n`, 'utf8');

  console.log(`core products: ${coreProducts.length}`);
  console.log(`selection products: ${accessoryProducts.length}`);
  console.log(`written products: ${products.length}`);
  console.log(`output: ${OUTPUT_PATH}`);
}

main().catch((error) => {
  console.error('[sync-apple-products] failed:', error);
  process.exitCode = 1;
});
