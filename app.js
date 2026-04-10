const HOME_TAGS = ['→ 和你风格匹配', '', '→ 近期热销', '', '', '', '', '', '', '', '', ''];
const HOME_REPLY_TEXT = 'anna 已为你整理好了 28 款新品';

const FALLBACK_PRODUCTS = [
  {
    id: '873666070231',
    name: 'JNBY/江南布衣春秋休闲伞兵裤高支亚麻舒适长裤设计感5P3E10530',
    price: 978.85,
    image: 'https://img.alicdn.com/bao/uploaded/i4/412129187/O1CN01NnHtgj2Hjhn0mjPVw_!!412129187.jpg',
    link: 'https://detail.tmall.com/item.htm?id=873666070231'
  },
  {
    id: '1025961930122',
    name: '【商场同款】JNBY/江南布衣26夏新品衬衫棉丝蓝色条纹女5Q521004H',
    price: 1395,
    image: 'https://img.alicdn.com/bao/uploaded/i1/412129187/O1CN01jnvOmP2Hjhn2MQgKH_!!412129187.jpg',
    link: 'https://detail.tmall.com/item.htm?id=1025961930122'
  },
  {
    id: '1020045694318',
    name: '【商场同款】JNBY/江南布衣26夏新品马甲简约V领含亚麻5Q4510540',
    price: 1395,
    image: 'https://img.alicdn.com/bao/uploaded/i2/412129187/O1CN01IXD0zc2Hjhn166jWr_!!412129187.jpg',
    link: 'https://detail.tmall.com/item.htm?id=1020045694318'
  },
  {
    id: '809802427931',
    name: 'JNBY/江南布衣春秋西服外套H型扭扭乐极简风设计感日常5O7715770',
    price: 1198.9,
    image: 'https://img.alicdn.com/bao/uploaded/i3/412129187/O1CN01M6MRaI2Hjhn10IMYN_!!412129187.jpg',
    link: 'https://detail.tmall.com/item.htm?id=809802427931'
  }
];

const state = {
  products: [],
  feedIds: [],
  mode: 'home',
  detailOpen: false,
  panelType: null,
  activeProductId: null,
  viewed: [],
  messages: [],
  pinnedMessageId: null,
  chromeHidden: false,
  lastHomeY: 0,
  hideTimer: null,
  prefilledAfterView: false
};

const dom = {
  sbar: document.getElementById('sbar'),
  bbar: document.getElementById('bbar'),
  compactBar: document.getElementById('compactBar'),
  statusTime: document.getElementById('statusTime'),
  replySub: document.getElementById('replySub'),
  homeScroll: document.getElementById('homeScroll'),
  canvas: document.getElementById('canvas'),
  feedGrid: document.getElementById('feedGrid'),
  chipsRow: document.getElementById('chipsRow'),
  bottomBar: document.getElementById('bottomBar'),
  intentInput: document.getElementById('intentInput'),
  sendBtn: document.getElementById('sendBtn'),
  scrim: document.getElementById('scrim'),
  detailOverlay: document.getElementById('detailOverlay'),
  detailCloseBtn: document.getElementById('detailCloseBtn'),
  detailTryBtn: document.getElementById('detailTryBtn'),
  detailImage: document.getElementById('detailImage'),
  detailName: document.getElementById('detailName'),
  detailMeta: document.getElementById('detailMeta'),
  detailInsight: document.getElementById('detailInsight'),
  outfitRow: document.getElementById('outfitRow'),
  buyPriceMain: document.getElementById('buyPriceMain'),
  buyPriceOld: document.getElementById('buyPriceOld'),
  panelBackdrop: document.getElementById('panelBackdrop'),
  panelRegion: document.getElementById('panelRegion'),
  panelTitle: document.getElementById('panelTitle'),
  panelCloseBtn: document.getElementById('panelCloseBtn'),
  panelList: document.getElementById('panelList')
};

function updateStatusTime() {
  const now = new Date();
  const hh = String(now.getHours()).padStart(2, '0');
  const mm = String(now.getMinutes()).padStart(2, '0');
  dom.statusTime.textContent = `${hh}:${mm}`;
}

function money(price) {
  return `¥${Number(price).toLocaleString('zh-CN', {
    minimumFractionDigits: Number(price) % 1 === 0 ? 0 : 2,
    maximumFractionDigits: 2
  })}`;
}

function shortName(name) {
  return name
    .replace(/【[^】]*】/g, '')
    .replace(/^JNBY\/江南布衣/, '')
    .replace(/^\//, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function escapeHtml(text) {
  return String(text)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

function nowLabel() {
  const now = new Date();
  return `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
}

function getProduct(id) {
  return state.products.find((item) => item.id === id) || null;
}

function isViewed(id) {
  return state.viewed.some((item) => item.id === id);
}

function resolveBadge(product, index) {
  if (product.name.includes('预售')) {
    return 'presale';
  }
  if (index < 8 || product.name.includes('新品')) {
    return 'new';
  }
  return '';
}

function renderFeedCard(product, options = {}) {
  const viewedMark = options.viewed ? '<div class="viewed-mark">已看过</div>' : '';
  const tag = options.tag ? `<div class="fi-tag">${escapeHtml(options.tag)}</div>` : '<div class="fi-tag"></div>';
  const badgeType = options.badge || '';
  const badge = badgeType === 'new'
    ? '<div class="new-badge">NEW</div>'
    : badgeType === 'presale'
      ? '<div class="presale-badge">预售</div>'
      : '';

  return `
    <article class="fi" data-open="${product.id}">
      <div class="fi-img">
        <img src="${product.image}" alt="${escapeHtml(shortName(product.name))}" loading="lazy">
        ${badge}
        ${viewedMark}
      </div>
      <div class="fi-body">
        ${tag}
        <div class="fi-name">${escapeHtml(shortName(product.name))}</div>
        <div class="fi-price">${money(product.price)}</div>
      </div>
    </article>
  `;
}

function renderHomeFeed() {
  dom.feedGrid.innerHTML = state.feedIds
    .map((id, index) => {
      const product = getProduct(id);
      if (!product) {
        return '';
      }
      return renderFeedCard(product, {
        tag: HOME_TAGS[index] || '',
        badge: resolveBadge(product, index),
        viewed: isViewed(product.id)
      });
    })
    .join('');
}

function pickByKeywords(keywords, limit) {
  const matched = state.products.filter((item) => keywords.some((word) => item.name.includes(word)));
  if (matched.length >= limit) {
    return matched.slice(0, limit);
  }

  const ids = new Set(matched.map((item) => item.id));
  for (const item of state.products) {
    if (!ids.has(item.id)) {
      matched.push(item);
      ids.add(item.id);
    }
    if (matched.length >= limit) {
      break;
    }
  }
  return matched.slice(0, limit);
}

function buildAnswer(query) {
  const text = query.trim();
  const lower = text.toLowerCase();
  const activeProduct = getProduct(state.activeProductId);

  if (state.detailOpen && activeProduct) {
    if (text.includes('尺码')) {
      return {
        summary: '尺码推荐已更新',
        answer: `这件 ${shortName(activeProduct.name)} 建议优先试 S 码；如果喜欢更宽松，可以试 M 码。`,
        picks: [activeProduct]
      };
    }

    if (text.includes('试衣') || lower.includes('ai')) {
      return {
        summary: 'AI试衣建议已更新',
        answer: `已为你生成 ${shortName(activeProduct.name)} 的 AI 试衣建议：浅色内搭 + 直筒裤更利落，通勤和周末都能穿。`,
        picks: [activeProduct]
      };
    }

    if (text.includes('优惠') || text.includes('便宜') || text.includes('券')) {
      const discounted = Math.round(activeProduct.price * 0.88 * 100) / 100;
      return {
        summary: '优惠信息已更新',
        answer: `这件支持店铺券叠加，到手约 ${money(discounted)}，再加购同系列下装可享套装减免。`,
        picks: [activeProduct]
      };
    }

    return {
      summary: '商品问答已更新',
      answer: `关于 ${shortName(activeProduct.name)}，你可以继续问我尺码、AI试衣、搭配方案或优惠方式。`,
      picks: [activeProduct]
    };
  }

  if (text.includes('风衣') || text.includes('外套') || text.includes('夹克')) {
    const picks = pickByKeywords(['风衣', '外套', '夹克', '西服'], 5);
    return {
      summary: `同风格的风衣 ${picks.length}款`,
      answer: `给你找到了 ${picks.length} 件同风格外套，版型偏利落，和你最近看的款式风格一致。`,
      picks
    };
  }

  if (text.includes('优惠') || text.includes('券') || text.includes('便宜')) {
    const picks = [...state.products].sort((a, b) => a.price - b.price).slice(0, 5);
    return {
      summary: `优惠款 ${picks.length}款`,
      answer: '我先按到手价给你排了更划算的商品，你可以直接点开详情继续问搭配和尺码。',
      picks
    };
  }

  if (text.includes('新品') || text.includes('上新')) {
    const picks = state.products.slice(0, 5);
    return {
      summary: `新品推荐 ${picks.length}款`,
      answer: '结合你的进店意图，我先把新品里匹配度更高的几款放在这里。',
      picks
    };
  }

  const picks = state.products.slice(2, 7);
  return {
    summary: `推荐结果 ${picks.length}款`,
    answer: '收到你的意图，我先给你一组高匹配结果。你也可以继续限定预算、颜色或场景。',
    picks
  };
}

function renderMessageFeed(products) {
  const tags = ['→ 最接近你看的款', '→ 同系列', '', '', ''];
  return products
    .map((item, index) =>
      renderFeedCard(item, {
        tag: tags[index] || '',
        badge: resolveBadge(item, index)
      })
    )
    .join('');
}

function renderCanvas() {
  if (!state.messages.length) {
    dom.canvas.innerHTML = '<div class="empty-text">你可以直接提问，比如：给我推荐同款风衣。</div>';
    return;
  }

  dom.canvas.innerHTML = state.messages
    .map((message, index) => {
      const pinned = state.pinnedMessageId === message.id ? 'pinned' : '';
      const collapsed = index === 0 && dom.canvas.scrollTop > 40 ? 'collapsed' : '';
      return `
        <section class="msg-block ${pinned}" id="msg-${message.id}">
          <div class="user-row"><div class="user-bubble">${escapeHtml(message.query)}</div></div>
          <div class="ar-text ${collapsed}" data-latest="${index === 0 ? '1' : '0'}">${escapeHtml(message.answer)}</div>
          <div class="feed-grid" style="padding:0 0 8px;">
            ${renderMessageFeed(message.picks)}
          </div>
        </section>
      `;
    })
    .join('');
}

function showReplySub(text) {
  if (!text) {
    dom.replySub.classList.remove('visible');
    dom.replySub.textContent = '';
    return;
  }

  dom.replySub.textContent = text;
  dom.replySub.classList.add('visible');
}

function showHomeMode() {
  state.mode = 'home';
  dom.homeScroll.classList.remove('hidden');
  dom.canvas.classList.add('hidden');
  state.pinnedMessageId = null;
}

function showCanvasMode() {
  state.mode = 'canvas';
  dom.homeScroll.classList.add('hidden');
  dom.canvas.classList.remove('hidden');
  dom.homeScroll.scrollTop = 0;
  showChrome();
}

function hideChrome() {
  if (state.chromeHidden || state.mode !== 'home' || state.detailOpen || state.panelType) {
    return;
  }

  state.chromeHidden = true;
  dom.sbar.classList.add('hidden');
  dom.bbar.classList.add('hidden');
  dom.bottomBar.classList.add('hidden');
  dom.compactBar.classList.add('visible');
}

function showChrome() {
  if (!state.chromeHidden) {
    return;
  }

  state.chromeHidden = false;
  dom.sbar.classList.remove('hidden');
  dom.bbar.classList.remove('hidden');
  dom.bottomBar.classList.remove('hidden');
  dom.compactBar.classList.remove('visible');
}

function openDetail(productId) {
  const product = getProduct(productId);
  if (!product) {
    return;
  }

  state.activeProductId = product.id;
  state.detailOpen = true;
  closePanel();
  showChrome();

  dom.detailImage.src = product.image;
  dom.detailImage.alt = shortName(product.name);
  dom.detailName.textContent = shortName(product.name);
  dom.detailMeta.textContent = '100%棉 · 日常通勤 · 可叠搭';
  dom.detailInsight.innerHTML = `你近期更偏好 <span class="ac-hi">利落廓形</span>，这件 <span class="ac-hi">${escapeHtml(shortName(product.name))}</span> 在版型和颜色上都更匹配。`;
  dom.buyPriceMain.textContent = money(product.price);
  dom.buyPriceOld.textContent = money(Math.round(product.price * 1.26));

  const related = [product, ...state.products.filter((item) => item.id !== product.id).slice(0, 2)];
  dom.outfitRow.innerHTML = related
    .map(
      (item, index) => `
        <div class="oi" data-open="${item.id}">
          <div class="oi-img">
            <img src="${item.image}" alt="${escapeHtml(shortName(item.name))}">
            ${index === 0 ? '<div class="oi-this">本款</div>' : ''}
          </div>
          <div class="oi-nm">${escapeHtml(shortName(item.name))}</div>
          <div class="oi-pr">${money(item.price)}</div>
        </div>
      `
    )
    .join('');

  dom.scrim.classList.remove('hidden');
  dom.detailOverlay.classList.remove('hidden');
  dom.detailOverlay.setAttribute('aria-hidden', 'false');
  dom.intentInput.placeholder = '继续问这件商品：尺码、试衣、优惠、搭配';

  renderChips();
}

function recordViewed(productId) {
  const product = getProduct(productId);
  if (!product) {
    return;
  }

  const now = nowLabel();
  const existingIndex = state.viewed.findIndex((item) => item.id === productId);
  const next = { id: product.id, time: now };

  if (existingIndex >= 0) {
    state.viewed.splice(existingIndex, 1);
  }

  state.viewed.unshift(next);
  if (state.viewed.length > 20) {
    state.viewed.pop();
  }
}

function closeDetail() {
  if (!state.detailOpen) {
    return;
  }

  const closedId = state.activeProductId;
  state.detailOpen = false;
  state.activeProductId = null;

  dom.scrim.classList.add('hidden');
  dom.detailOverlay.classList.add('hidden');
  dom.detailOverlay.setAttribute('aria-hidden', 'true');
  dom.intentInput.placeholder = 'anna 在线，可以问我任何问题';

  if (closedId) {
    recordViewed(closedId);
  }

  renderHomeFeed();
  renderChips();

  if (state.mode === 'home') {
    showReplySub(HOME_REPLY_TEXT);

    if (!state.prefilledAfterView) {
      dom.intentInput.value = '找下同风格的外套';
      state.prefilledAfterView = true;
    }
  }
}

function formatHistoryTag(message) {
  if (message.picks.length) {
    return `<span class="hl-tag result">推荐了 ${message.picks.length} 个商品</span>`;
  }
  return '<span class="hl-tag">anna 已回复</span>';
}

function renderPanelList() {
  if (state.panelType === 'footprint') {
    dom.panelTitle.textContent = state.viewed.length ? `店内足迹 · 最近浏览 ${state.viewed.length} 件` : '店内足迹';

    if (!state.viewed.length) {
      dom.panelList.innerHTML = '<div class="empty-text">还没有浏览足迹，先点开一件商品看看吧。</div>';
      return;
    }

    dom.panelList.innerHTML = state.viewed
      .map((record) => {
        const product = getProduct(record.id);
        if (!product) {
          return '';
        }

        return `
          <button class="fp-item" type="button" data-open="${product.id}">
            <div class="fp-thumb"><img src="${product.image}" alt="${escapeHtml(shortName(product.name))}"></div>
            <div class="fp-info">
              <div class="fp-name">${escapeHtml(shortName(product.name))}</div>
              <div class="fp-price">${money(product.price)}</div>
              <div class="fp-time">${record.time} 浏览</div>
            </div>
            <div class="hl-arrow">›</div>
          </button>
        `;
      })
      .join('');
    return;
  }

  dom.panelTitle.textContent = `历史消息 · 共 ${state.messages.length} 条`;

  if (!state.messages.length) {
    dom.panelList.innerHTML = '<div class="empty-text">还没有历史消息，你可以先在底部提问。</div>';
    return;
  }

  dom.panelList.innerHTML = state.messages
    .map(
      (message) => `
        <button class="hl-item" type="button" data-msg="${message.id}">
          <div class="hl-left">
            <div class="hl-q">${escapeHtml(message.query)}</div>
            <div class="hl-meta">
              <span class="hl-time">${message.time}</span>
              ${formatHistoryTag(message)}
            </div>
          </div>
          <div class="hl-arrow">›</div>
        </button>
      `
    )
    .join('');
}

function openPanel(type) {
  state.panelType = type;
  renderPanelList();
  dom.panelBackdrop.classList.remove('hidden');
  dom.panelRegion.classList.remove('hidden');
  dom.panelRegion.setAttribute('aria-hidden', 'false');
}

function closePanel() {
  if (!state.panelType) {
    return;
  }

  state.panelType = null;
  dom.panelBackdrop.classList.add('hidden');
  dom.panelRegion.classList.add('hidden');
  dom.panelRegion.setAttribute('aria-hidden', 'true');
}

function renderChips() {
  const badge = state.viewed.length ? `<span class="foot-badge">${state.viewed.length}</span>` : '';
  const base = state.detailOpen
    ? ['尺码推荐', '搭配建议', 'AI 试衣', '怎么买便宜']
    : ['找优惠券', '穿搭推荐', 'AI 试衣'];

  const chips = [
    { key: 'footprint', label: `👣 店内足迹${badge}`, cls: 'foot' },
    { key: 'history', label: '💬 历史消息', cls: 'msg' },
    ...base.map((item) => ({ key: item, label: item, cls: '' }))
  ];

  dom.chipsRow.innerHTML = chips
    .map((chip) => `<button class="chip ${chip.cls}" type="button" data-chip="${chip.key}">${chip.label}</button>`)
    .join('');
}

function runChipAction(key) {
  if (key === 'footprint') {
    openPanel('footprint');
    return;
  }

  if (key === 'history') {
    openPanel('history');
    return;
  }

  if (key === 'AI 试衣') {
    dom.intentInput.value = state.detailOpen ? '帮我生成这件的AI试衣建议' : '给我推荐同款风衣';
  } else if (key === '搭配建议') {
    dom.intentInput.value = '帮我搭一套同风格穿搭';
  } else if (key === '尺码推荐') {
    dom.intentInput.value = '这件夹克推荐什么尺码';
  } else if (key === '怎么买便宜') {
    dom.intentInput.value = '这件怎么买更便宜';
  } else {
    dom.intentInput.value = key;
  }

  dom.intentInput.focus();
}

function findMessageById(id) {
  return state.messages.find((item) => item.id === id) || null;
}

function pinMessage(messageId) {
  const message = findMessageById(messageId);
  if (!message) {
    return;
  }

  showCanvasMode();
  state.pinnedMessageId = messageId;
  renderCanvas();
  showReplySub('');

  const target = document.getElementById(`msg-${messageId}`);
  if (target) {
    target.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
}

function toggleCanvasSummary() {
  if (state.mode !== 'canvas' || !state.messages.length) {
    return;
  }

  const latest = state.messages[0];
  const latestText = dom.canvas.querySelector('[data-latest="1"]');
  const collapsed = dom.canvas.scrollTop > 40;

  if (latestText) {
    latestText.classList.toggle('collapsed', collapsed);
  }

  if (collapsed) {
    showReplySub(latest.summary);
  } else {
    showReplySub('');
  }
}

function sendQuery() {
  const query = dom.intentInput.value.trim();
  if (!query) {
    return;
  }

  closePanel();

  const result = buildAnswer(query);
  const message = {
    id: `m${Date.now()}`,
    query,
    answer: result.answer,
    summary: result.summary,
    picks: result.picks,
    time: nowLabel()
  };

  state.messages.unshift(message);
  state.pinnedMessageId = null;

  if (state.detailOpen) {
    dom.detailInsight.textContent = result.answer;
    dom.intentInput.value = '';
    renderChips();
    return;
  }

  showCanvasMode();
  renderCanvas();
  renderChips();
  dom.intentInput.value = '';
  dom.canvas.scrollTop = 0;
  showReplySub('');
}

function onHomeScroll() {
  if (state.mode !== 'home' || state.detailOpen || state.panelType) {
    return;
  }

  const current = dom.homeScroll.scrollTop;
  if (current <= 30) {
    showChrome();
    state.lastHomeY = current;
    return;
  }

  if (Math.abs(current - state.lastHomeY) > 3) {
    hideChrome();
  }

  state.lastHomeY = current;
  clearTimeout(state.hideTimer);
  state.hideTimer = setTimeout(() => {
    showChrome();
  }, 900);
}

function bindEvents() {
  dom.feedGrid.addEventListener('click', (event) => {
    const target = event.target.closest('[data-open]');
    if (!target) {
      return;
    }

    openDetail(target.dataset.open);
  });

  dom.canvas.addEventListener('click', (event) => {
    const openTarget = event.target.closest('[data-open]');
    if (openTarget) {
      openDetail(openTarget.dataset.open);
    }
  });

  dom.outfitRow.addEventListener('click', (event) => {
    const target = event.target.closest('[data-open]');
    if (!target) {
      return;
    }

    openDetail(target.dataset.open);
  });

  dom.chipsRow.addEventListener('click', (event) => {
    const target = event.target.closest('[data-chip]');
    if (!target) {
      return;
    }

    runChipAction(target.dataset.chip);
  });

  dom.panelList.addEventListener('click', (event) => {
    const openTarget = event.target.closest('[data-open]');
    if (openTarget) {
      closePanel();
      openDetail(openTarget.dataset.open);
      return;
    }

    const msgTarget = event.target.closest('[data-msg]');
    if (msgTarget) {
      closePanel();
      pinMessage(msgTarget.dataset.msg);
    }
  });

  dom.sendBtn.addEventListener('click', sendQuery);

  dom.intentInput.addEventListener('keydown', (event) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      sendQuery();
    }
  });

  dom.detailCloseBtn.addEventListener('click', closeDetail);
  dom.detailTryBtn.addEventListener('click', () => {
    dom.intentInput.value = '帮我生成这件的AI试衣建议';
    sendQuery();
  });

  dom.scrim.addEventListener('click', closeDetail);
  dom.panelBackdrop.addEventListener('click', closePanel);
  dom.panelCloseBtn.addEventListener('click', closePanel);

  dom.homeScroll.addEventListener('scroll', onHomeScroll);
  dom.canvas.addEventListener('scroll', toggleCanvasSummary);
}

async function loadProducts() {
  try {
    const response = await fetch('./products.json', { cache: 'no-store' });
    if (!response.ok) {
      throw new Error(`products status ${response.status}`);
    }

    const json = await response.json();
    if (!Array.isArray(json) || !json.length) {
      throw new Error('empty products');
    }

    return json;
  } catch (error) {
    console.warn('products fallback', error);
    return FALLBACK_PRODUCTS;
  }
}

async function init() {
  updateStatusTime();
  setInterval(updateStatusTime, 30000);

  const loaded = await loadProducts();
  state.products = loaded.slice(0, 32);
  state.feedIds = state.products.slice(0, 12).map((item) => item.id);

  showHomeMode();
  renderHomeFeed();
  renderCanvas();
  renderChips();
  showReplySub('');
  bindEvents();
}

init();
