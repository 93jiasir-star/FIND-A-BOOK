const platforms = [
  { group: '页外声', note: '读者评价与评分', icon: '豆', name: '豆瓣读书', meta: '评分、短评与书评', url: q => `https://search.douban.com/book/subject_search?search_text=${q}` },
  { group: '页外声', note: '读者评价与评分', icon: 'G', name: 'Goodreads', meta: '全球读者书评', url: q => `https://www.goodreads.com/search?q=${q}` },
  { group: '书海径', note: '阅读、购买、借阅或下载', icon: '微', name: '微信读书', meta: '在线阅读', url: q => `https://weread.qq.com/web/search/books?keyword=${q}` },
  { group: '书海径', note: '阅读、购买、借阅或下载', icon: '鱼', name: '多抓鱼', meta: '二手书购买', url: q => `https://www.duozhuayu.com/search/book/${q}` },
  { group: '书海径', note: '阅读、购买、借阅或下载', icon: '馆', name: '上海图书馆', meta: '馆藏与借阅', url: q => `https://vufind.library.sh.cn/Search/Results?lookfor=${q}&type=AllFields` },
  { group: '书海径', note: '阅读、购买、借阅或下载', icon: 'Z', name: 'Z-Library', meta: '下载', url: q => `https://z-library.sk/s/${q}` }
];

const form = document.querySelector('#searchForm');
const input = document.querySelector('#bookInput');
const clearInput = document.querySelector('#clearInput');
const results = document.querySelector('#results');
const searchHint = document.querySelector('.search-hint');
const recentSearches = document.querySelector('#recentSearches');
const historyKey = 'find-a-book-recent-searches';
function escapeHtml(value) { const div = document.createElement('div'); div.textContent = value; return div.innerHTML; }
function readHistory() {
  try { return JSON.parse(localStorage.getItem(historyKey) || '[]').filter(item => typeof item === 'string'); }
  catch { return []; }
}
function remember(query) {
  const next = [query, ...readHistory().filter(item => item !== query)].slice(0, 6);
  localStorage.setItem(historyKey, JSON.stringify(next));
}
function removeHistory(query) {
  localStorage.setItem(historyKey, JSON.stringify(readHistory().filter(item => item !== query)));
}
function updateClearInput() {
  clearInput.hidden = !input.value.length;
}
function renderHistory() {
  const items = readHistory();
  recentSearches.hidden = !items.length;
  if (!items.length) return;
  recentSearches.innerHTML = `<div class="recent-title">最近搜索</div><div class="recent-list">${items.map(item => `<div class="history-chip"><button class="history-query" type="button" data-query="${encodeURIComponent(item)}">${escapeHtml(item)}</button><button class="history-remove" type="button" data-remove="${encodeURIComponent(item)}" aria-label="删除 ${escapeHtml(item)}">×</button></div>`).join('')}</div>`;
}
function search(query) {
  const clean = query.trim(); if (!clean) { input.focus(); return; }
  input.value = clean; updateClearInput(); remember(clean);
  const encoded = encodeURIComponent(clean); const groups = [...new Set(platforms.map(p => p.group))];
  results.innerHTML = `<div class="result-intro"><div class="eyebrow">SEARCHING FOR</div><h2>${escapeHtml(clean)}</h2></div>` + groups.map(group => {
    const cards = platforms.filter(p => p.group === group).map(p => `<button class="platform-card" type="button" data-platform-url="${p.url(encoded)}"><span class="platform-icon${/[GZ]/.test(p.icon) ? ` platform-icon-latin platform-icon-${p.icon.toLowerCase()}` : ''}${p.icon === '豆' ? ' platform-icon-bean' : ''}"><span class="platform-icon-glyph">${p.icon}</span></span><span><span class="platform-name">${p.name}</span><span class="platform-meta">${p.meta}</span></span></button>`).join('');
    const note = platforms.find(p => p.group === group).note;
    return `<div class="platform-section"><div class="platform-label"><span class="platform-label-title">${group}</span><span class="platform-label-dot">·</span><span class="platform-label-note">${note}</span></div><div class="platform-list">${cards}</div></div>`;
  }).join('');
  results.classList.add('show'); searchHint.hidden = true; recentSearches.hidden = true;
}
form.addEventListener('submit', event => { event.preventDefault(); search(input.value); });
input.addEventListener('focus', renderHistory);
input.addEventListener('input', updateClearInput);
clearInput.addEventListener('mousedown', event => event.preventDefault());
clearInput.addEventListener('click', () => { input.value = ''; updateClearInput(); input.focus(); });
recentSearches.addEventListener('click', event => {
  const removeButton = event.target.closest('button[data-remove]');
  if (removeButton) { removeHistory(decodeURIComponent(removeButton.dataset.remove)); renderHistory(); return; }
  const queryButton = event.target.closest('button[data-query]');
  if (queryButton) search(decodeURIComponent(queryButton.dataset.query));
});
results.addEventListener('click', event => {
  const platformButton = event.target.closest('button[data-platform-url]');
  if (platformButton) window.open(platformButton.dataset.platformUrl, '_blank', 'noopener,noreferrer');
});
updateClearInput();
renderHistory();
if ('serviceWorker' in navigator) navigator.serviceWorker.register('sw.js');
