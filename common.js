// Shared helpers for host.html and play.html
const peso = n => (n < 0 ? '-' : '') + '₱' + Math.abs(Math.round(n)).toLocaleString('en-PH');
const SPACES = {
  payday:    { e: '💰', n: 'Sahod',       c: '#2a9d8f' },
  opp:       { e: '🎯', n: 'Oportunidad', c: '#e9c46a' },
  doodad:    { e: '🛍️', n: 'Doodad',      c: '#e76f51' },
  market:    { e: '📈', n: 'Market',      c: '#4a8fbf' },
  charity:   { e: '🤝', n: 'Tulong',      c: '#9b5de5' },
  baby:      { e: '👶', n: 'Baby',        c: '#f4a6c0' },
  downsized: { e: '📉', n: 'Tanggal',     c: '#7a828c' }
};
const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, ch => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[ch]));

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
