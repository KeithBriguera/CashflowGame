// Shared helpers for host.html and play.html
const peso = n => (n < 0 ? '-' : '') + '₱' + Math.abs(Math.round(n)).toLocaleString('en-PH');
const compact = n => { const a = Math.abs(n); const s = a >= 1e6 ? (a / 1e6).toFixed(a % 1e6 ? 2 : 0).replace(/\.?0+$/, '') + 'M' : a >= 1e4 ? Math.round(a / 1e3) + 'K' : Math.round(a).toLocaleString('en-PH'); return (n < 0 ? '-' : '') + '₱' + s; };
const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, ch => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[ch]));

const SPACES = {
  payday:    { n: 'Payday',      c1: '#2fae8f' },
  opp:       { n: 'Opportunity', c1: '#f2b632' },
  doodad:    { n: 'Doodad',      c1: '#ee6b5b' },
  market:    { n: 'Market',      c1: '#4aa3df' },
  charity:   { n: 'Give Back',   c1: '#9a7be0' },
  baby:      { n: 'Baby',        c1: '#f19cc0' },
  downsized: { n: 'Layoff',      c1: '#9aa3b5' }
};
const TYPE_LABEL = { property: 'Property', business: 'Business', stock: 'Stocks' };
const TYPE_COLOR = { property: '#b9a4ee', business: '#ffb27a', stock: '#8ddbc3' };

const GLOSSARY = [
  ['Passive income', 'Money that comes in every month from assets, without you trading your time for it. Your goal is to make this bigger than your expenses.'],
  ['Expenses', 'Everything you must pay every month: taxes, living costs, children, and loan payments.'],
  ['Cashflow', 'Income minus expenses. Positive cashflow grows your savings every payday. Negative cashflow drains them.'],
  ['Asset', 'Something that puts money in your pocket each month, like a business, a rental, or dividend stocks.'],
  ['Liability', 'Something that takes money out of your pocket each month, like a loan or credit card balance.'],
  ['Down payment', 'The part of the price you pay up front. The rest is usually financed with a loan.'],
  ['Doodad', 'Spending on things you want but do not need, which add no value and do not earn.'],
  ['Emergency fund', '3 to 6 months of expenses saved in cash, so a layoff or surprise bill does not push you into debt.'],
  ['Leverage', 'Using borrowed money to buy an asset. It can multiply your gains, and your losses.']
];

function connectWS(handlers) {
  let ws, closed = false, retry = 0;
  const api = {
    send: o => { if (ws && ws.readyState === 1) ws.send(JSON.stringify(o)); },
    close: () => { closed = true; if (ws) ws.close(); }
  };
  function open() {
    const proto = location.protocol === 'https:' ? 'wss' : 'ws';
    ws = new WebSocket(`${proto}://${location.host}`);
    ws.onopen = () => { retry = 0; handlers.open && handlers.open(api); };
    ws.onmessage = e => { let m; try { m = JSON.parse(e.data); } catch { return; } handlers.message && handlers.message(m, api); };
    ws.onclose = () => {
      handlers.close && handlers.close();
      if (!closed) setTimeout(open, Math.min(4000, 500 + retry++ * 700));
    };
  }
  open();
  return api;
}

/* ---------- shared card renderers (used by both host and phone) ---------- */
function statTile(label, value, tone) {
  return `<div class="stat ${tone || ''}"><span>${esc(label)}</span><b>${value}</b></div>`;
}

function dealCardHTML(c, size) {
  const tc = TYPE_COLOR[c.type] || '#ffc83d';
  return `<div class="gcard deal" style="--tc:${tc}">
    <div class="gc-head"><span class="tag">${size === 'big' ? 'BIG DEAL' : 'SMALL DEAL'} • ${esc(TYPE_LABEL[c.type] || '')}</span></div>
    <div class="gc-art">${ART.icon(c.icon, 120)}</div>
    <h2>${esc(c.name)}</h2>
    <p class="blurb">${esc(c.blurb)}</p>
    <div class="stats">
      ${statTile('Price', peso(c.cost))}
      ${statTile('Down payment', peso(c.down))}
      ${statTile('Loan', c.mortgage ? peso(c.mortgage) : 'None')}
      ${statTile('Income / month', '+' + peso(c.cf), 'good')}
    </div></div>`;
}

function resultCardHTML(r) {
  return `<div class="gcard result tone-${r.tone}">
    <div class="gc-head"><span class="tag">${esc(r.title)}</span></div>
    <div class="gc-art">${ART.icon(r.icon || 'payday', 110)}</div>
    <p class="blurb big">${esc(r.text)}</p>
    ${r.lesson ? `<div class="lesson"><b>Money lesson</b>${esc(r.lesson)}</div>` : ''}</div>`;
}

function marketCardHTML(p, forPlayer) {
  return `<div class="gcard market" style="--tc:#9ccdf0">
    <div class="gc-head"><span class="tag">MARKET NEWS</span></div>
    <div class="gc-art">${ART.icon('market', 110)}</div>
    <p class="blurb big">${esc(p.card.text)}</p>
    ${forPlayer ? '' : '<p class="mute">Deciding whether to sell…</p>'}</div>`;
}

function dieHTML(n, rolling) {
  const dots = { 1: [4], 2: [0, 8], 3: [0, 4, 8], 4: [0, 2, 6, 8], 5: [0, 2, 4, 6, 8], 6: [0, 2, 3, 5, 6, 8] }[n] || [4];
  return `<div class="die ${rolling ? 'roll' : ''}">${Array.from({ length: 9 }, (_, i) => `<i class="${dots.includes(i) ? 'on' : ''}"></i>`).join('')}</div>`;
}

function rankPlayers(players) {
  return players.slice().sort((a, b) => (b.free - a.free) || (b.calc.coverage - a.calc.coverage) || (b.calc.netWorth - a.calc.netWorth));
}
