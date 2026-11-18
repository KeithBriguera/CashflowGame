// Full-game simulation with bots only. Usage: BOT_DELAY=1 node test-bots.js [games]
process.env.BOT_DELAY = process.env.BOT_DELAY || '1';
const WebSocket = require('ws');
const { server } = require('./server');

const GAMES = Number(process.argv[2] || 3);

function runGame(port, bots, rounds) {
  return new Promise((resolve, reject) => {
    const ws = new WebSocket(`ws://localhost:${port}`);
    let last, started = false, toasts = [];
    const timer = setTimeout(() => reject(new Error('timeout')), 120000);
    ws.on('open', () => ws.send(JSON.stringify({ t: 'host_create' })));
    ws.on('message', raw => {
      const m = JSON.parse(raw);
      if (m.t === 'toast') toasts.push(m.msg);
      if (m.t === 'hosted' && !started) {
        started = true;
        for (let i = 0; i < bots; i++) ws.send(JSON.stringify({ t: 'add_bot' }));
        ws.send(JSON.stringify({ t: 'start', maxRounds: rounds }));
      }
      if (m.t === 'state') {
        last = m;
        if (m.state === 'ended') { clearTimeout(timer); ws.close(); resolve({ last, toasts }); }
      }
    });
    ws.on('error', reject);
  });
}

server.listen(0, async () => {
  const port = server.address().port;
  for (let g = 0; g < GAMES; g++) {
    const bots = 3 + (g % 3);
    const { last, toasts } = await runGame(port, bots, 25);
    const rows = last.players.map(p => {
      const c = p.calc;
      return `${p.name.padEnd(10)} ${String(p.prof).padEnd(18)} cov=${String(Math.round(c.coverage * 100)).padStart(3)}% passive=${String(c.passive).padStart(6)} exp=${String(c.expenses).padStart(6)} cash=${String(p.cash).padStart(8)} assets=${p.assets.length} free=${p.free ? 'R' + p.freeRound : '-'} loans=${p.stats.loans}`;
    });
    console.log(`Game ${g + 1}: ${bots} bots, ended=${last.endReason}, round=${last.round}, toasts=${toasts.length}`);
    console.log(rows.join('\n'));
    if (toasts.length) console.log('  toasts:', [...new Set(toasts)].slice(0, 5));
  }
  server.close(); process.exit(0);
});
