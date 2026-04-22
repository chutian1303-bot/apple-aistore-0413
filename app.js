const HOME_TAGS = ['→ 今日穿搭', '', '→ 人气热卖', '', '', '', '', '', '', '', '', ''];
const HOME_REPLY_TEXT = 'anna 已为你整理本店新季穿搭精选';

const FALLBACK_PRODUCTS = [
  {
    id: 'an-urban-drape-suit',
    name: '都会垂感双排扣西装套装',
    price: 1288,
    image: './assets/fashion-products/thumbs/thumb_01.jpg',
    link: '#'
  },
  {
    id: 'an-black-power-tailor',
    name: '黑金权力感修身西装两件套',
    price: 1699,
    image: './assets/fashion-products/thumbs/thumb_02.jpg',
    link: '#'
  },
  {
    id: 'an-tech-leather-onepiece',
    name: '机能皮感拼接连体短裙',
    price: 1450,
    image: './assets/fashion-products/thumbs/thumb_03.jpg',
    link: '#'
  },
  {
    id: 'an-french-contrast-set',
    name: '法式极简黑白拼色套裙',
    price: 1180,
    image: './assets/fashion-products/thumbs/thumb_04.jpg',
    link: '#'
  },
  {
    id: 'an-pearl-satin-shirt',
    name: '珠光缎面立领衬衫',
    price: 899,
    image: './assets/fashion-products/thumbs/thumb_05.jpg',
    link: '#'
  },
  {
    id: 'an-mist-blue-knit',
    name: '云雾蓝轻薄针织打底衫',
    price: 760,
    image: './assets/fashion-products/thumbs/thumb_06.jpg',
    link: '#'
  },
  {
    id: 'an-wool-volume-coat',
    name: '羊毛混纺廓形大衣',
    price: 1880,
    image: './assets/fashion-products/thumbs/thumb_07.jpg',
    link: '#'
  },
  {
    id: 'an-amber-belted-trench',
    name: '琥珀黄收腰中长风衣',
    image: './assets/fashion-products/thumbs/thumb_08.jpg',
    price: 1560,
    link: '#'
  },
  {
    id: 'an-evening-gray-commute',
    name: '暮色灰通勤阔腿西装套组',
    price: 1320,
    image: './assets/fashion-products/thumbs/thumb_01.jpg',
    link: '#'
  },
  {
    id: 'an-midnight-sharp-set',
    name: '午夜黑利落剪裁套装',
    price: 1740,
    image: './assets/fashion-products/thumbs/thumb_02.jpg',
    link: '#'
  },
  {
    id: 'an-champagne-satin',
    name: '香槟白高支缎面衬衫',
    price: 980,
    image: './assets/fashion-products/thumbs/thumb_05.jpg',
    link: '#'
  },
  {
    id: 'an-oat-warm-coat',
    name: '燕麦奶油保暖羊毛外套',
    price: 1960,
    image: './assets/fashion-products/thumbs/thumb_07.jpg',
    link: '#'
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
  phone: document.getElementById('phoneApp'),
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

function ensureChromeVisible() {
  state.chromeHidden = false;
  dom.sbar.classList.remove('hidden');
  dom.bbar.classList.remove('hidden');
  dom.bottomBar.classList.remove('hidden');
  dom.compactBar.classList.remove('visible');
}

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
    if (text.includes('版型') || text.includes('显瘦') || text.includes('身材') || text.includes('尺码')) {
      return {
        summary: '版型建议已更新',
        answer: `${shortName(activeProduct.name)} 建议优先选利落直线条；梨形更推荐高腰与收腰轮廓，小个子可提高腰线比例。`,
        picks: [activeProduct]
      };
    }

    if (text.includes('对比') || text.includes('区别') || lower.includes('compare') || text.includes('风格')) {
      return {
        summary: '风格对比建议已更新',
        answer: `已为你整理 ${shortName(activeProduct.name)} 的对比建议：先看版型轮廓，再看面料垂感与场景适配，最后按预算收敛。`,
        picks: [activeProduct]
      };
    }

    if (text.includes('优惠') || text.includes('便宜') || text.includes('券')) {
      const discounted = Math.round(activeProduct.price * 0.88 * 100) / 100;
      return {
        summary: '优惠信息已更新',
        answer: `这款可叠加店铺券与会员券，预计到手约 ${money(discounted)}。如果你愿意，我可以继续按预算给你列替代款。`,
        picks: [activeProduct]
      };
    }

    return {
      summary: '商品问答已更新',
      answer: `关于 ${shortName(activeProduct.name)}，你可以继续问我版型推荐、风格对比、搭配建议或优惠方案。`,
      picks: [activeProduct]
    };
  }

  if (text.includes('通勤') || text.includes('上班') || text.includes('职场')) {
    const picks = pickByKeywords(['通勤', '西装', '外套'], 5);
    return {
      summary: `通勤推荐 ${picks.length}款`,
      answer: `我先给你筛了 ${picks.length} 款通勤向单品，优先照顾显高显瘦与会议场景。你可以补充预算，我继续精排。`,
      picks
    };
  }

  if (text.includes('显瘦') || text.includes('梨形') || text.includes('身材') || text.includes('小个子')) {
    const picks = pickByKeywords(['高腰', '套裙', '风衣', '羊毛'], 5);
    return {
      summary: `版型推荐 ${picks.length}款`,
      answer: `已为你整理 ${picks.length} 款更修饰身形的版型，优先给到高腰、垂感和纵向线条更强的组合。`,
      picks
    };
  }

  if (text.includes('优惠') || text.includes('券') || text.includes('便宜')) {
    const picks = [...state.products].sort((a, b) => a.price - b.price).slice(0, 5);
    return {
      summary: `优惠款 ${picks.length}款`,
      answer: '我先按到手价帮你排了更划算的方案，你可以继续告诉我预算，我再缩小到 2-3 个最适合你的款式。',
      picks
    };
  }

  if (text.includes('新品') || text.includes('上新') || text.includes('推荐') || text.includes('女装') || text.includes('搭配')) {
    const picks = state.products.slice(0, 5);
    return {
      summary: `精选推荐 ${picks.length}款`,
      answer: '结合你的意图，我先把匹配度更高的新季女装放在这里，你可以继续限定价格、风格或场景。',
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
    dom.canvas.innerHTML = '<div class="empty-text">你可以直接提问，比如：通勤穿什么显高显瘦？</div>';
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

  ensureChromeVisible();
}

function openDetail(productId) {
  const product = getProduct(productId);
  if (!product) {
    return;
  }

  state.activeProductId = product.id;
  state.detailOpen = true;
  closePanel();
  ensureChromeVisible();
  dom.phone.classList.add('detail-open');

  dom.detailImage.src = product.image;
  dom.detailImage.alt = shortName(product.name);
  dom.detailName.textContent = shortName(product.name);
  dom.detailMeta.textContent = 'ANNNASPEAK 官方精选 · 店铺直发 · 支持店铺券';
  dom.detailInsight.innerHTML = `结合你的通勤与日常场景，这款 <span class="ac-hi">${escapeHtml(shortName(product.name))}</span> 在版型、面料和预算之间更均衡。`;
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
  dom.intentInput.placeholder = '继续问这款商品：版型、风格、优惠、搭配';

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

function closeDetail(options = {}) {
  if (!state.detailOpen) {
    return;
  }
  const keepHomeHint = options.keepHomeHint !== false;

  const closedId = state.activeProductId;
  state.detailOpen = false;
  state.activeProductId = null;
  dom.phone.classList.remove('detail-open');

  dom.scrim.classList.add('hidden');
  dom.detailOverlay.classList.add('hidden');
  dom.detailOverlay.setAttribute('aria-hidden', 'true');
  dom.intentInput.placeholder = 'anna在线，可以问我任何穿搭问题';

  if (closedId) {
    recordViewed(closedId);
  }

  renderHomeFeed();
  renderChips();

  if (state.mode === 'home' && keepHomeHint) {
    showReplySub(HOME_REPLY_TEXT);

    if (!state.prefilledAfterView) {
      dom.intentInput.value = '给我推荐一套显高显瘦的通勤穿搭';
      state.prefilledAfterView = true;
    }
  }
}

function formatHistoryTag(message) {
  if (message.picks.length) {
    return `<span class="hl-tag result">推荐了 ${message.picks.length} 个商品</span>`;
  }
  return '<span class="hl-tag">anna 顾问已回复</span>';
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
    ? ['版型推荐', '搭配建议', '风格对比', '怎么买便宜']
    : ['找优惠', '场景推荐', '风格对比'];

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

  if (key === '风格对比') {
    dom.intentInput.value = state.detailOpen ? '帮我对比这款和同价位热门款的风格差异' : '帮我对比通勤风和休闲风的选择';
  } else if (key === '搭配建议') {
    dom.intentInput.value = '给我配一套高性价比的春日搭配';
  } else if (key === '版型推荐') {
    dom.intentInput.value = '这款更适合梨形身材还是直筒身材';
  } else if (key === '怎么买便宜') {
    dom.intentInput.value = '这款怎么买更便宜';
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
    closeDetail({ keepHomeHint: false });
    showCanvasMode();
    renderCanvas();
    renderChips();
    dom.intentInput.value = '';
    dom.canvas.scrollTop = 0;
    showReplySub(message.summary);
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
    dom.intentInput.value = '帮我对比这款和同价位热门款';
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
