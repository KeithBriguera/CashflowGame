const express = require('express');
const http = require('http');
const path = require('path');
const crypto = require('crypto');
const { WebSocketServer } = require('ws');
const QRCode = require('qrcode');
const C = require('./content');

const PORT = process.env.PORT || 3000;
const BOT_DELAY = Number(process.env.BOT_DELAY || 1100);
const COLORS = ['#ef476f', '#ffd166', '#06d6a0', '#4cc9f0', '#b794f6', '#f78c6b', '#80ed99', '#ff9f1c'];
const BOT_NAMES = ['Botchok', 'Bot Ana', 'Bot Jun', 'Bot Mika', 'Bot Dodong', 'Bot Liza'];
const MAX_PLAYERS = 8;

const app = express();
// Serve client files from ./public if it exists, otherwise from the project root (flat upload).
// Only whitelisted files are served, so server code is never exposed.
const fs = require('fs');
const PUB = fs.existsSync(path.join(__dirname, 'public', 'host.html')) ? path.join(__dirname, 'public') : __dirname;
app.get('/', (_q, r) => r.redirect('/host.html'));
['host.html', 'play.html', 'common.js', 'style.css'].forEach(f =>
  app.get('/' + f, (_q, r) => r.sendFile(path.join(PUB, f))));
app.get('/health', (_q, r) => r.send('ok'));
app.get('/qr', async (req, res) => {
  try {
    const svg = await QRCode.toString(String(req.query.text || '').slice(0, 300), { type: 'svg', margin: 1 });
    res.type('image/svg+xml').send(svg);
  } catch (e) { res.status(400).end(); }
});
const server = http.createServer(app);
const wss = new WebSocketServer({ server });

const rooms = new Map();
const uid = () => crypto.randomBytes(6).toString('hex');
const rnd = n => Math.floor(Math.random() * n);

function newCode() {
  let c;
  do { c = String(1000 + rnd(9000)); } while (rooms.has(c));
  return c;
}

function shuffle(a) {
  a = a.slice();
  for (let i = a.length - 1; i > 0; i--) { const j = rnd(i + 1); [a[i], a[j]] = [a[j], a[i]]; }
  return a;
}

function createRoom() {
  const room = {
    code: newCode(), hostKey: uid(), hosts: new Set(), created: Date.now(),
    state: 'lobby', players: [], maxRounds: 25, round: 1, turnIdx: -1, turn: null,
    log: [], history: [], rollSeq: 0, decks: {}, botTimer: null, endReason: null
  };
  rooms.set(room.code, room);
  return room;
}

function draw(room, name, arr) {
  let d = room.decks[name];
  if (!d || !d.length) d = room.decks[name] = shuffle(arr.map((_, i) => i));
  return arr[d.pop()];
}

function log(room, msg, pid) {
  room.log.push({ t: Date.now(), msg, pid: pid || null });
  if (room.log.length > 80) room.log.shift();
}

const peso = n => '₱' + Math.round(n).toLocaleString('en-PH');

/* ---------- player / finance ---------- */
function addPlayer(room, name, bot) {
  const p = {
    id: uid(), token: uid(), name: String(name || 'Player').slice(0, 16), bot: !!bot,
    color: COLORS[room.players.length % COLORS.length], ws: null, connected: !!bot,
    prof: null, emoji: '🙂', salary: 0, taxes: 0, other: 0, childCost: 0, children: 0,
    cash: 0, liabs: [], assets: [], pos: 0, skip: 0, dbl: 0, free: false, freeRound: null,
    stats: { doodads: 0, deals: 0, loans: 0, donated: 0, sold: 0, paydays: 0, babies: 0 }
  };
  room.players.push(p);
  return p;
}

function initPlayer(p, prof) {
  Object.assign(p, {
    prof: prof.name, emoji: prof.emoji, salary: prof.salary, taxes: prof.taxes, other: prof.other,
    childCost: prof.childCost, children: 0, cash: prof.cash, assets: [], pos: 0, skip: 0, dbl: 0,
    free: false, freeRound: null,
    liabs: prof.liabs.map(l => ({ id: uid(), name: l.name, balance: l.balance, pay: l.pay, bank: false })),
    stats: { doodads: 0, deals: 0, loans: 0, donated: 0, sold: 0, paydays: 0, babies: 0 }
  });
}

function calc(p) {
  const passive = p.assets.reduce((s, a) => s + a.cf, 0);
  const income = p.salary + passive;
  const liabPay = p.liabs.reduce((s, l) => s + l.pay, 0);
  const expenses = p.taxes + p.other + p.children * p.childCost + liabPay;
  const assetValue = p.assets.reduce((s, a) => s + a.cost, 0);
  const mortgages = p.assets.reduce((s, a) => s + a.mortgage, 0);
  const debts = p.liabs.reduce((s, l) => s + l.balance, 0);
  return {
    passive, income, expenses, liabPay, cashflow: income - expenses,
    coverage: expenses ? passive / expenses : 0,
    assetValue, mortgages, debts, netWorth: p.cash + assetValue - mortgages - debts
  };
}

function addLoan(p, amt) {
  p.liabs.push({ id: uid(), name: 'Bank loan', balance: amt, pay: Math.round(amt * 0.1), bank: true });
  p.cash += amt;
  p.stats.loans += amt;
}

// make sure player has at least `amt` in cash; borrow in 1,000 units if not
function ensureCash(room, p, amt) {
  if (p.cash >= amt) return 0;
  const need = Math.ceil((amt - p.cash) / 1000) * 1000;
  addLoan(p, need);
  log(room, `${p.name} ay napilitang umutang ng ${peso(need)} (interes 10% buwan-buwan).`, p.id);
  return need;
}

function checkFree(room, p) {
  if (p.free || !p.prof) return;
  const c = calc(p);
  if (c.passive > 0 && c.passive >= c.expenses) {
    p.free = true;
    p.freeRound = room.round;
    log(room, `🎉 ${p.name} ay NAKALABAS na sa rat race! Mas malaki na ang passive income kaysa expenses.`, p.id);
  }
}

/* ---------- game flow ---------- */
function snapshot(room) {
  const data = {};
  room.players.forEach(p => { const c = calc(p); data[p.id] = { cov: Math.round(c.coverage * 100), cash: p.cash, passive: c.passive }; });
  room.history.push({ round: room.round, data });
}

function startGame(room, maxRounds) {
  if (room.players.length < 1) return;
  room.maxRounds = Math.max(5, Math.min(60, Number(maxRounds) || room.maxRounds));
  const profs = shuffle(C.PROFESSIONS);
  room.players.forEach((p, i) => initPlayer(p, profs[i % profs.length]));
  room.state = 'playing';
  room.round = 1; room.turnIdx = -1; room.turn = null; room.history = []; room.decks = {}; room.endReason = null;
  room.log = [];
  log(room, `Nagsimula na ang laro! ${room.maxRounds} rounds. Layunin: ang passive income mo ay lampas sa expenses mo.`);
  snapshot(room);
  nextTurn(room);
}

function endGame(room, reason) {
  room.state = 'ended';
  room.endReason = reason;
  room.turn = null;
  snapshot(room);
  log(room, 'Tapos na ang laro. Tingnan ang debrief.');
}

function nextTurn(room) {
  let guard = 0;
  while (guard++ < room.players.length * 4 + 4) {
    room.turnIdx++;
    if (room.turnIdx >= room.players.length) {
      room.turnIdx = 0;
      snapshot(room);
      room.round++;
      if (room.round > room.maxRounds) return endGame(room, 'rounds');
    }
    if (room.players.every(x => x.free)) return endGame(room, 'allfree');
    const p = room.players[room.turnIdx];
    if (p.free) continue;
    if (p.skip > 0) { p.skip--; log(room, `${p.name} ay nakalaktaw sa turn (wala pang trabaho).`, p.id); continue; }
    room.turn = { pid: p.id, phase: 'roll', pending: null, lastRoll: room.turn && room.turn.lastRoll };
    return;
  }
  endGame(room, 'stuck');
}

function setResult(room, title, text, lesson, tone) {
  room.turn.phase = 'done';
  room.turn.pending = { kind: 'result', title, text, lesson: lesson || '', tone: tone || 'neutral' };
}

function doPayday(room, p) {
  const c = calc(p);
  p.cash += c.cashflow;
  p.stats.paydays++;
  let note = `Sahod: ${c.cashflow >= 0 ? '+' : ''}${peso(c.cashflow)} (income ${peso(c.income)} − expenses ${peso(c.expenses)}).`;
  if (p.cash < 0) { const n = ensureCash(room, p, 0); note += ` Naubusan ng cash, umutang ng ${peso(n)}.`; }
  return note;
}

function doRoll(room, p) {
  const n = p.dbl > 0 ? 2 : 1;
  if (p.dbl > 0) p.dbl--;
  const dice = Array.from({ length: n }, () => 1 + rnd(6));
  const steps = dice.reduce((a, b) => a + b, 0);
  room.turn.lastRoll = { dice, n: ++room.rollSeq, pid: p.id };
  const paydayNotes = [];
  for (let i = 0; i < steps; i++) {
    p.pos = (p.pos + 1) % C.BOARD.length;
    if (C.BOARD[p.pos] === 'payday') paydayNotes.push(doPayday(room, p));
  }
  const space = C.BOARD[p.pos];
  log(room, `${p.name} ay nag-roll ng ${dice.join('+')}${n > 1 ? '=' + steps : ''} at pumunta sa ${space}.`, p.id);
  resolveSpace(room, p, space, paydayNotes.join(' '));
}

function resolveSpace(room, p, space, paydayText) {
  const t = room.turn;
  const pre = paydayText ? paydayText + ' ' : '';
  switch (space) {
    case 'payday':
      setResult(room, 'Payday! 💰', pre.trim(), 'Bayaran mo muna ang sarili mo: ilaan ang bahagi ng sahod sa ipon at assets bago gumastos.', 'good');
      break;
    case 'opp':
      t.phase = 'decide';
      t.pending = { kind: 'opp_choice', note: paydayText || '' };
      break;
    case 'doodad': {
      const card = draw(room, 'doodad', C.DOODADS);
      const borrowed = ensureCash(room, p, card.cost);
      p.cash -= card.cost; p.stats.doodads += card.cost;
      log(room, `${p.name} ay gumastos ng ${peso(card.cost)}: ${card.text}`, p.id);
      setResult(room, 'Doodad! 🛍️', `${pre}${card.text} Gastos: ${peso(card.cost)}.${borrowed ? ' Umutang ka ng ' + peso(borrowed) + ' para mabayaran ito.' : ''}`, card.lesson, 'bad');
      break;
    }
    case 'market': {
      const card = draw(room, 'market', C.MARKETS);
      const options = p.assets.filter(a => a.type === card.match).map(a => ({
        assetId: a.id, name: a.name, offer: Math.round(a.cost * card.mult), net: Math.round(a.cost * card.mult) - a.mortgage, cf: a.cf
      }));
      if (!options.length) {
        setResult(room, 'Market 📈', `${pre}${card.text} Wala kang asset na ganito kaya walang epekto.`, 'Ang market ay nagbabago araw-araw; mas ligtas kung may iba-ibang asset.', 'neutral');
      } else {
        t.phase = 'decide';
        t.pending = { kind: 'market', card: { text: card.text, mult: card.mult, lesson: card.lesson }, options, note: paydayText || '' };
      }
      break;
    }
    case 'charity': {
      const amt = Math.max(500, Math.round(calc(p).income * 0.1 / 100) * 100);
      t.phase = 'decide';
      t.pending = { kind: 'charity', amount: amt, note: paydayText || '' };
      break;
    }
    case 'baby':
      if (p.children >= 3) {
        setResult(room, 'Baby 👶', `${pre}Bumisita ang mga pamangkin. Wala nang dagdag na anak.`, 'Magplano para sa pamilya: ipon, insurance, at emergency fund.', 'neutral');
      } else {
        p.children++; p.stats.babies++;
        setResult(room, 'May baby! 👶', `${pre}Dumagdag ang gastos: +${peso(p.childCost)} buwan-buwan.`, 'Hindi nagpapaalam ang malalaking gastos. Maghanda sa pamamagitan ng emergency fund.', 'bad');
      }
      break;
    case 'downsized': {
      const exp = calc(p).expenses;
      const borrowed = ensureCash(room, p, exp);
      p.cash -= exp; p.skip = 2;
      const months = Math.floor((p.cash + exp) / Math.max(1, exp));
      setResult(room, 'Nawalan ng trabaho! 📉', `${pre}Binayaran mo ang isang buwang gastos (${peso(exp)}).${borrowed ? ' Umutang ka ng ' + peso(borrowed) + '.' : ''} Lalaktaw ka ng 2 turns.`, months >= 3 ? 'Mabuti, may emergency fund ka! Kaya mong tumagal ng ilang buwan.' : 'Kulang ang emergency fund mo. Ang payo: ipon ng 3 hanggang 6 na buwang gastos.', 'bad');
      break;
    }
  }
}

function act(room, p, msg) {
  if (room.state !== 'playing') return 'Hindi pa nagsisimula ang laro.';
  switch (msg.t) {
    case 'loan': {
      const amt = Math.floor(Number(msg.amount) / 1000) * 1000;
      if (!(amt >= 1000 && amt <= 100000)) return 'Pumili ng halagang ₱1,000 hanggang ₱100,000.';
      addLoan(p, amt);
      log(room, `${p.name} ay umutang ng ${peso(amt)} sa bangko (bayad: ${peso(Math.round(amt * 0.1))}/buwan).`, p.id);
      return null;
    }
    case 'payoff': {
      const l = p.liabs.find(x => x.id === msg.id);
      if (!l) return 'Wala nang ganitong utang.';
      if (p.cash < l.balance) return `Kulang ang cash mo. Kailangan: ${peso(l.balance)}.`;
      p.cash -= l.balance;
      p.liabs = p.liabs.filter(x => x.id !== l.id);
      log(room, `${p.name} ay binayaran ang ${l.name} (${peso(l.balance)}). Bumaba ang expenses ng ${peso(l.pay)}/buwan.`, p.id);
      return null;
    }
  }
  const t = room.turn;
  if (!t || t.pid !== p.id) return 'Hindi mo pa turn.';
  const pend = t.pending;
  switch (msg.t) {
    case 'roll':
      if (t.phase !== 'roll') return 'Nag-roll ka na.';
      doRoll(room, p);
      return null;
    case 'choose_deal': {
      if (!pend || pend.kind !== 'opp_choice') return 'Walang pagpipilian ngayon.';
      const big = msg.size === 'big';
      const card = big ? draw(room, 'big', C.BIG_DEALS) : draw(room, 'small', C.SMALL_DEALS);
      t.pending = { kind: 'deal', size: big ? 'big' : 'small', card: { ...card } };
      return null;
    }
    case 'buy': {
      if (!pend || pend.kind !== 'deal') return 'Walang deal.';
      const c = pend.card;
      if (p.cash < c.down) {
        if (!msg.loan) return `Kulang ang cash. Kailangan: ${peso(c.down)}.`;
        ensureCash(room, p, c.down);
      }
      p.cash -= c.down; p.stats.deals++;
      p.assets.push({ id: uid(), name: c.name, type: c.type, cost: c.cost, mortgage: c.mortgage, cf: c.cf, down: c.down });
      log(room, `${p.name} ay bumili ng ${c.name} (down ${peso(c.down)}, +${peso(c.cf)}/buwan).`, p.id);
      setResult(room, 'Nabili mo! ✅', `${c.name}: down payment ${peso(c.down)}, dagdag na passive income ${peso(c.cf)}/buwan.`, c.lesson, 'good');
      return null;
    }
    case 'pass':
      if (!pend || pend.kind !== 'deal') return 'Walang deal.';
      setResult(room, 'Pinalampas mo', `Hindi mo kinuha ang ${pend.card.name}. Minsan tama rin ang tumanggi kung hindi pa handa.`, 'Hindi lahat ng deal ay para sa iyo; unahin ang cashflow at risk.', 'neutral');
      return null;
    case 'sell': {
      if (!pend || pend.kind !== 'market') return 'Walang market ngayon.';
      const o = pend.options.find(x => x.assetId === msg.assetId);
      if (!o) return 'Hindi mo ito pwedeng ibenta.';
      p.cash += o.net;
      p.assets = p.assets.filter(a => a.id !== o.assetId);
      p.stats.sold++;
      log(room, `${p.name} ay ibinenta ang ${o.name} (net ${peso(o.net)}).`, p.id);
      setResult(room, 'Naibenta! 💵', `${o.name}: alok ${peso(o.offer)}, net pagkatapos ng utang ${peso(o.net)}. Nawala ang ${peso(o.cf)}/buwan na passive income.`, pend.card.lesson, 'neutral');
      return null;
    }
    case 'keep':
      if (!pend || pend.kind !== 'market') return 'Walang market ngayon.';
      setResult(room, 'Pinanatili mo', 'Hindi mo ibinenta ang asset mo.', pend.card.lesson, 'neutral');
      return null;
    case 'donate': {
      if (!pend || pend.kind !== 'charity') return 'Walang tulong ngayon.';
      if (p.cash < pend.amount) return 'Kulang ang cash.';
      p.cash -= pend.amount; p.dbl = 3; p.stats.donated += pend.amount;
      setResult(room, 'Nagbigay ka 🤝', `Nag-donate ka ng ${peso(pend.amount)}. Sa susunod na 3 turns, 2 dice ang ro-roll mo.`, 'Ang pagbibigay ay bahagi ng malusog na relasyon sa pera.', 'good');
      return null;
    }
    case 'skip_charity':
      if (!pend || pend.kind !== 'charity') return 'Walang tulong ngayon.';
      setResult(room, 'Hindi muna', 'Hindi ka nag-donate ngayon.', '', 'neutral');
      return null;
    case 'end_turn':
      if (t.phase !== 'done') return 'Tapusin muna ang kasalukuyang aksyon.';
      nextTurn(room);
      return null;
  }
  return 'Hindi kilalang aksyon.';
}

/* ---------- bots ---------- */
function botStep(room) {
  if (room.state !== 'playing' || !room.turn) return;
  const p = room.players.find(x => x.id === room.turn.pid);
  if (!p || !p.bot) return;
  const t = room.turn, pend = t.pending;
  let msg;
  if (t.phase === 'roll') msg = { t: 'roll' };
  else if (pend.kind === 'opp_choice') msg = { t: 'choose_deal', size: p.cash >= 150000 ? 'big' : 'small' };
  else if (pend.kind === 'deal') msg = pend.card.down <= p.cash - 2000 ? { t: 'buy' } : { t: 'pass' };
  else if (pend.kind === 'market') {
    const best = pend.options.slice().sort((a, b) => b.net - a.net)[0];
    msg = pend.card.mult > 1.2 && best.net > 0 ? { t: 'sell', assetId: best.assetId } : { t: 'keep' };
  } else if (pend.kind === 'charity') msg = { t: 'skip_charity' };
  else {
    const c = calc(p);
    const bank = p.liabs.find(l => l.bank && p.cash >= l.balance + 15000);
    if (bank) { act(room, p, { t: 'payoff', id: bank.id }); }
    else {
      const cc = p.liabs.find(l => /Credit card/.test(l.name) && p.cash >= l.balance + 20000);
      if (cc && c.cashflow < 20000) act(room, p, { t: 'payoff', id: cc.id });
    }
    msg = { t: 'end_turn' };
  }
  act(room, p, msg);
  commit(room);
}

function scheduleBot(room) {
  clearTimeout(room.botTimer);
  if (room.state !== 'playing' || !room.turn) return;
  const p = room.players.find(x => x.id === room.turn.pid);
  if (p && p.bot) room.botTimer = setTimeout(() => botStep(room), BOT_DELAY);
}

/* ---------- views / networking ---------- */
function pubPlayer(p) {
  const c = calc(p);
  return {
    id: p.id, name: p.name, color: p.color, bot: p.bot, connected: p.connected, prof: p.prof, emoji: p.emoji,
    pos: p.pos, free: p.free, freeRound: p.freeRound, children: p.children, childCost: p.childCost,
    cash: p.cash, salary: p.salary, taxes: p.taxes, other: p.other, dbl: p.dbl, skip: p.skip,
    liabs: p.liabs, assets: p.assets, stats: p.stats, calc: c
  };
}

function view(room, forId) {
  return {
    t: 'state', code: room.code, state: room.state, round: room.round, maxRounds: room.maxRounds,
    board: C.BOARD, endReason: room.endReason, you: forId || null,
    turn: room.turn, players: room.players.map(pubPlayer),
    log: room.log.slice(-30), history: room.history
  };
}

function send(ws, obj) { if (ws && ws.readyState === 1) ws.send(JSON.stringify(obj)); }

function commit(room) {
  if (room.state === 'playing') {
    room.players.forEach(p => checkFree(room, p));
  }
  room.hosts.forEach(ws => send(ws, view(room, null)));
  room.players.forEach(p => { if (p.ws) send(p.ws, view(room, p.id)); });
  scheduleBot(room);
}

wss.on('connection', ws => {
  ws.ctx = {};
  ws.on('message', raw => {
    let msg; try { msg = JSON.parse(raw); } catch { return; }
    try { onMessage(ws, msg); } catch (e) { console.error('handler error', e); send(ws, { t: 'toast', msg: 'May error sa server.' }); }
  });
  ws.on('close', () => {
    const { room, role, pid } = ws.ctx;
    if (!room) return;
    if (role === 'host') room.hosts.delete(ws);
    if (role === 'player') {
      const p = room.players.find(x => x.id === pid);
      if (p && p.ws === ws) { p.ws = null; p.connected = false; commit(room); }
    }
  });
});

function onMessage(ws, msg) {
  const ctx = ws.ctx;
  switch (msg.t) {
    case 'host_create': {
      const room = createRoom();
      room.hosts.add(ws); ctx.room = room; ctx.role = 'host';
      send(ws, { t: 'hosted', code: room.code, hostKey: room.hostKey });
      commit(room); return;
    }
    case 'host_resume': {
      const room = rooms.get(String(msg.code));
      if (!room || room.hostKey !== msg.hostKey) return send(ws, { t: 'host_invalid' });
      room.hosts.add(ws); ctx.room = room; ctx.role = 'host';
      send(ws, { t: 'hosted', code: room.code, hostKey: room.hostKey });
      commit(room); return;
    }
    case 'join': {
      const room = rooms.get(String(msg.code || '').trim());
      if (!room) return send(ws, { t: 'join_error', msg: 'Walang room na may ganyang code.' });
      let p = msg.token && room.players.find(x => x.token === msg.token && !x.bot);
      if (!p) {
        if (room.state !== 'lobby') return send(ws, { t: 'join_error', msg: 'Nagsimula na ang laro.' });
        if (room.players.length >= MAX_PLAYERS) return send(ws, { t: 'join_error', msg: 'Puno na ang room (8 players).' });
        const name = String(msg.name || '').trim();
        if (!name) return send(ws, { t: 'join_error', msg: 'Ilagay ang pangalan mo.' });
        p = addPlayer(room, name, false);
        log(room, `${p.name} ay sumali.`);
      }
      if (p.ws && p.ws !== ws) { try { p.ws.close(); } catch {} }
      p.ws = ws; p.connected = true; ctx.room = room; ctx.role = 'player'; ctx.pid = p.id;
      send(ws, { t: 'joined', token: p.token, code: room.code, pid: p.id });
      commit(room); return;
    }
  }
  const room = ctx.room;
  if (!room) return;
  if (ctx.role === 'host') {
    switch (msg.t) {
      case 'add_bot':
        if (room.state === 'lobby' && room.players.length < MAX_PLAYERS) {
          const used = new Set(room.players.map(p => p.name));
          const name = BOT_NAMES.find(n => !used.has(n)) || 'Bot ' + (room.players.length + 1);
          addPlayer(room, name, true);
        }
        break;
      case 'remove_player':
        if (room.state === 'lobby') {
          const i = room.players.findIndex(p => p.id === msg.pid);
          if (i >= 0) { const [p] = room.players.splice(i, 1); if (p.ws) send(p.ws, { t: 'kicked' }); room.players.forEach((q, k) => q.color = COLORS[k % COLORS.length]); }
        }
        break;
      case 'set_rounds': room.maxRounds = Math.max(5, Math.min(60, Number(msg.value) || 25)); break;
      case 'start': if (room.state === 'lobby') startGame(room, msg.maxRounds); break;
      case 'skip_turn':
        if (room.state === 'playing' && room.turn) {
          const p = room.players.find(x => x.id === room.turn.pid);
          log(room, `Nilaktawan ng host ang turn ni ${p ? p.name : ''}.`);
          nextTurn(room);
        }
        break;
      case 'end_game': if (room.state === 'playing') endGame(room, 'host'); break;
      case 'new_game':
        room.state = 'lobby'; room.turn = null; room.log = []; room.history = [];
        room.players.forEach(p => { p.prof = null; });
        break;
    }
    return commit(room);
  }
  if (ctx.role === 'player') {
    const p = room.players.find(x => x.id === ctx.pid);
    if (!p) return;
    const err = act(room, p, msg);
    if (err) send(ws, { t: 'toast', msg: err });
    commit(room);
  }
}

setInterval(() => {
  const now = Date.now();
  for (const [code, room] of rooms) {
    const live = room.hosts.size || room.players.some(p => p.ws);
    if (!live && now - room.created > 6 * 3600 * 1000) { clearTimeout(room.botTimer); rooms.delete(code); }
  }
}, 600000).unref();

if (require.main === module) {
  server.listen(PORT, () => console.log(`AHON! running on http://localhost:${PORT}`));
}
module.exports = { server, rooms, calc };
