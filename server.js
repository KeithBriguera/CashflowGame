const express = require('express');
const http = require('http');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { WebSocketServer } = require('ws');
const QRCode = require('qrcode');
const C = require('./content');

const PORT = process.env.PORT || 3000;
const BOT_DELAY = Number(process.env.BOT_DELAY || 1300);
const AV_COLORS = ['#ff6b6b', '#ffc83d', '#27d3a2', '#4cc9f0', '#9b7bff', '#ff9a4d', '#6fe86f', '#ff7ac8'];
const BOT_NAMES = ['Botchok', 'Ana Bot', 'Jun Bot', 'Mika Bot', 'Dodong Bot', 'Liza Bot', 'Rey Bot', 'Tess Bot'];
const MAX_PLAYERS = 8;
const TIMER_CHOICES = [0, 30, 45, 60, 90, 120];

const app = express();
// Client files are served from ./public if present, otherwise from the project root (flat upload).
// Only whitelisted files are served, so server code is never exposed.
const PUB = fs.existsSync(path.join(__dirname, 'public', 'host.html')) ? path.join(__dirname, 'public') : __dirname;
const CLIENT_FILES = ['host.html', 'play.html', 'style.css', 'common.js', 'art.js', 'sfx.js', 'manifest.webmanifest', 'icon.svg'];
app.get('/', (_q, r) => r.redirect('/host.html'));
CLIENT_FILES.forEach(f => app.get('/' + f, (_q, r) => r.sendFile(path.join(PUB, f))));
app.get('/health', (_q, r) => r.send('ok'));
app.get('/qr', async (req, res) => {
  try {
    const svg = await QRCode.toString(String(req.query.text || '').slice(0, 300), { type: 'svg', margin: 1, color: { dark: '#0b1020', light: '#ffffff' } });
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
    state: 'lobby', players: [], settings: { maxRounds: 25, timer: 0 },
    round: 1, turnIdx: -1, turn: null, log: [], history: [], rollSeq: 0, evtSeq: 0, evt: null,
    decks: {}, botTimer: null, turnTimer: null, timerKey: '', endReason: null
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
function emit(room, type, pid, extra) { room.evt = { n: ++room.evtSeq, type, pid: pid || null, ...(extra || {}) }; }
const peso = n => '₱' + Math.round(n).toLocaleString('en-PH');

/* ---------- players / finance ---------- */
function freeAvatar(room, want) {
  const used = new Set(room.players.map(p => p.avatar));
  if (Number.isInteger(want) && want >= 0 && want < AV_COLORS.length && !used.has(want)) return want;
  for (let i = 0; i < AV_COLORS.length; i++) if (!used.has(i)) return i;
  return 0;
}

function addPlayer(room, name, bot, avatar) {
  const av = freeAvatar(room, avatar);
  const p = {
    id: uid(), token: uid(), name: String(name || 'Player').slice(0, 16), bot: !!bot,
    avatar: av, color: AV_COLORS[av], ws: null, connected: !!bot,
    prof: null, salary: 0, taxes: 0, other: 0, childCost: 0, children: 0,
    cash: 0, liabs: [], assets: [], pos: 0, skip: 0, dbl: 0, free: false, freeRound: null,
    stats: { doodads: 0, deals: 0, loans: 0, donated: 0, sold: 0, paydays: 0, babies: 0 }
  };
  room.players.push(p);
  return p;
}

function initPlayer(p, prof) {
  Object.assign(p, {
    prof: prof.name, salary: prof.salary, taxes: prof.taxes, other: prof.other,
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

// make sure the player has at least `amt` in cash; borrow in 1,000 units if not
function ensureCash(room, p, amt) {
  if (p.cash >= amt) return 0;
  const need = Math.ceil((amt - p.cash) / 1000) * 1000;
  addLoan(p, need);
  log(room, `${p.name} had to borrow ${peso(need)} (10% of it is due every month).`, p.id);
  return need;
}

function checkFree(room, p) {
  if (p.free || !p.prof) return;
  const c = calc(p);
  if (c.passive > 0 && c.passive >= c.expenses) {
    p.free = true;
    p.freeRound = room.round;
    log(room, `${p.name} escaped the paycheck race! Passive income now covers all expenses.`, p.id);
    emit(room, 'escape', p.id);
  }
}

/* ---------- game flow ---------- */
function snapshot(room) {
  const data = {};
  room.players.forEach(p => { const c = calc(p); data[p.id] = { cov: Math.round(c.coverage * 100), cash: p.cash, passive: c.passive, net: c.netWorth }; });
  room.history.push({ round: room.round, data });
}

function startGame(room) {
  if (room.players.length < 1) return;
  const profs = shuffle(C.PROFESSIONS);
  room.players.forEach((p, i) => initPlayer(p, profs[i % profs.length]));
  room.state = 'playing';
  room.round = 1; room.turnIdx = -1; room.turn = null; room.history = []; room.decks = {}; room.endReason = null;
  room.log = []; room.timerKey = '';
  log(room, `The game has started! ${room.settings.maxRounds} rounds. Goal: make your passive income cover your expenses.`);
  emit(room, 'start');
  snapshot(room);
  nextTurn(room);
}

function endGame(room, reason) {
  room.state = 'ended';
  room.endReason = reason;
  room.turn = null;
  snapshot(room);
  log(room, 'The game is over. See the debrief.');
  emit(room, 'end');
}

function nextTurn(room) {
  let guard = 0;
  while (guard++ < room.players.length * 4 + 4) {
    room.turnIdx++;
    if (room.turnIdx >= room.players.length) {
      room.turnIdx = 0;
      snapshot(room);
      room.round++;
      if (room.round > room.settings.maxRounds) return endGame(room, 'rounds');
    }
    if (room.players.every(x => x.free)) return endGame(room, 'allfree');
    const p = room.players[room.turnIdx];
    if (p.free) continue;
    if (p.skip > 0) { p.skip--; log(room, `${p.name} is still job hunting and skips this turn.`, p.id); continue; }
    room.turn = { pid: p.id, phase: 'roll', pending: null, lastRoll: room.turn && room.turn.lastRoll, deadline: null };
    return;
  }
  endGame(room, 'stuck');
}

function setResult(room, title, text, lesson, tone, icon) {
  room.turn.phase = 'done';
  room.turn.pending = { kind: 'result', title, text, lesson: lesson || '', tone: tone || 'neutral', icon: icon || null };
}

function doPayday(room, p) {
  const c = calc(p);
  p.cash += c.cashflow;
  p.stats.paydays++;
  let note = `Payday: ${c.cashflow >= 0 ? '+' : ''}${peso(c.cashflow)} (income ${peso(c.income)} − expenses ${peso(c.expenses)}).`;
  if (p.cash < 0) { const n = ensureCash(room, p, 0); note += ` You ran out of cash and borrowed ${peso(n)}.`; }
  emit(room, 'payday', p.id, { amount: c.cashflow });
  return note;
}

function doRoll(room, p) {
  const n = p.dbl > 0 ? 2 : 1;
  if (p.dbl > 0) p.dbl--;
  const dice = Array.from({ length: n }, () => 1 + rnd(6));
  const steps = dice.reduce((a, b) => a + b, 0);
  room.turn.lastRoll = { dice, n: ++room.rollSeq, pid: p.id, steps };
  const paydayNotes = [];
  for (let i = 0; i < steps; i++) {
    p.pos = (p.pos + 1) % C.BOARD.length;
    if (C.BOARD[p.pos] === 'payday') paydayNotes.push(doPayday(room, p));
  }
  const space = C.BOARD[p.pos];
  log(room, `${p.name} rolled ${dice.join(' + ')}${n > 1 ? ' = ' + steps : ''}.`, p.id);
  resolveSpace(room, p, space, paydayNotes.join(' '));
}

function resolveSpace(room, p, space, paydayText) {
  const t = room.turn;
  const pre = paydayText ? paydayText + ' ' : '';
  switch (space) {
    case 'payday':
      setResult(room, 'Payday!', pre.trim(), 'Pay yourself first: set aside part of every paycheck for savings and assets before you spend.', 'good', 'payday');
      break;
    case 'opp':
      t.phase = 'decide';
      t.pending = { kind: 'opp_choice', note: paydayText || '' };
      break;
    case 'doodad': {
      const card = draw(room, 'doodad', C.DOODADS);
      const borrowed = ensureCash(room, p, card.cost);
      p.cash -= card.cost; p.stats.doodads += card.cost;
      log(room, `${p.name} spent ${peso(card.cost)}: ${card.text}`, p.id);
      emit(room, 'doodad', p.id, { amount: card.cost });
      setResult(room, 'Doodad!', `${pre}${card.text} Cost: ${peso(card.cost)}.${borrowed ? ' You borrowed ' + peso(borrowed) + ' to pay for it.' : ''}`, card.lesson, 'bad', card.icon);
      break;
    }
    case 'market': {
      const card = draw(room, 'market', C.MARKETS);
      const options = p.assets.filter(a => a.type === card.match).map(a => ({
        assetId: a.id, name: a.name, icon: a.icon, offer: Math.round(a.cost * card.mult), net: Math.round(a.cost * card.mult) - a.mortgage, cf: a.cf
      }));
      if (!options.length) {
        setResult(room, 'Market News', `${pre}${card.text} You own nothing like that, so there is no effect on you.`, 'Markets move every day. Owning different kinds of assets spreads your risk.', 'neutral', 'market');
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
        setResult(room, 'Family Time', `${pre}Your nieces and nephews came to visit. No new expenses this time.`, 'Plan for family costs with savings, insurance and an emergency fund.', 'neutral', 'baby');
      } else {
        p.children++; p.stats.babies++;
        emit(room, 'baby', p.id);
        setResult(room, 'A Baby Is Coming!', `${pre}Your monthly expenses go up by ${peso(p.childCost)}.`, 'Big expenses do not ask permission. An emergency fund keeps them from becoming debt.', 'bad', 'baby');
      }
      break;
    case 'downsized': {
      const exp = calc(p).expenses;
      const borrowed = ensureCash(room, p, exp);
      p.cash -= exp; p.skip = 2;
      const months = Math.floor((p.cash + exp) / Math.max(1, exp));
      emit(room, 'downsized', p.id);
      setResult(room, 'Laid Off!', `${pre}You paid one month of expenses (${peso(exp)}).${borrowed ? ' You borrowed ' + peso(borrowed) + ' to cover it.' : ''} You will skip your next 2 turns.`, months >= 3 ? 'Nice, you had an emergency fund! It lets you ride out job loss without panic.' : 'Your emergency fund was too thin. Aim for 3 to 6 months of expenses.', 'bad', 'downsized');
      break;
    }
  }
}

function act(room, p, msg) {
  if (room.state !== 'playing') return 'The game has not started.';
  switch (msg.t) {
    case 'loan': {
      const amt = Math.floor(Number(msg.amount) / 1000) * 1000;
      if (!(amt >= 1000 && amt <= 100000)) return 'Choose an amount from ₱1,000 to ₱100,000.';
      addLoan(p, amt);
      emit(room, 'loan', p.id, { amount: amt });
      log(room, `${p.name} took a bank loan of ${peso(amt)} (pays ${peso(Math.round(amt * 0.1))} a month).`, p.id);
      return null;
    }
    case 'payoff': {
      const l = p.liabs.find(x => x.id === msg.id);
      if (!l) return 'That debt no longer exists.';
      if (p.cash < l.balance) return `Not enough cash. You need ${peso(l.balance)}.`;
      p.cash -= l.balance;
      p.liabs = p.liabs.filter(x => x.id !== l.id);
      emit(room, 'payoff', p.id, { amount: l.balance });
      log(room, `${p.name} paid off ${l.name} (${peso(l.balance)}). Expenses drop by ${peso(l.pay)} a month.`, p.id);
      return null;
    }
  }
  const t = room.turn;
  if (!t || t.pid !== p.id) return 'It is not your turn yet.';
  const pend = t.pending;
  switch (msg.t) {
    case 'roll':
      if (t.phase !== 'roll') return 'You already rolled.';
      doRoll(room, p);
      return null;
    case 'choose_deal': {
      if (!pend || pend.kind !== 'opp_choice') return 'No choice to make right now.';
      const big = msg.size === 'big';
      const card = big ? draw(room, 'big', C.BIG_DEALS) : draw(room, 'small', C.SMALL_DEALS);
      t.pending = { kind: 'deal', size: big ? 'big' : 'small', card: { ...card } };
      emit(room, 'card', p.id);
      return null;
    }
    case 'buy': {
      if (!pend || pend.kind !== 'deal') return 'There is no deal on the table.';
      const c = pend.card;
      if (p.cash < c.down) {
        if (!msg.loan) return `Not enough cash. You need ${peso(c.down)}.`;
        ensureCash(room, p, c.down);
      }
      p.cash -= c.down; p.stats.deals++;
      p.assets.push({ id: uid(), name: c.name, type: c.type, icon: c.icon, cost: c.cost, mortgage: c.mortgage, cf: c.cf, down: c.down });
      emit(room, 'buy', p.id, { amount: c.cf });
      log(room, `${p.name} bought ${c.name} (down payment ${peso(c.down)}, +${peso(c.cf)} a month).`, p.id);
      setResult(room, 'Deal Done!', `${c.name}: down payment ${peso(c.down)}, adding ${peso(c.cf)} a month in passive income.`, c.lesson, 'good', c.icon);
      return null;
    }
    case 'pass':
      if (!pend || pend.kind !== 'deal') return 'There is no deal on the table.';
      setResult(room, 'You Passed', `You did not take ${pend.card.name}. Sometimes walking away is the right call if you are not ready.`, 'Not every deal is for you. Check the cashflow and the risk first.', 'neutral', pend.card.icon);
      return null;
    case 'sell': {
      if (!pend || pend.kind !== 'market') return 'No market offer right now.';
      const o = pend.options.find(x => x.assetId === msg.assetId);
      if (!o) return 'You cannot sell that.';
      p.cash += o.net;
      p.assets = p.assets.filter(a => a.id !== o.assetId);
      p.stats.sold++;
      emit(room, 'sell', p.id, { amount: o.net });
      log(room, `${p.name} sold ${o.name} for ${peso(o.net)} after debts.`, p.id);
      setResult(room, 'Sold!', `${o.name}: offer ${peso(o.offer)}, ${peso(o.net)} after paying its debt. You lose ${peso(o.cf)} a month of passive income.`, pend.card.lesson, 'neutral', o.icon);
      return null;
    }
    case 'keep':
      if (!pend || pend.kind !== 'market') return 'No market offer right now.';
      setResult(room, 'You Held On', 'You kept your asset.', pend.card.lesson, 'neutral', 'market');
      return null;
    case 'donate': {
      if (!pend || pend.kind !== 'charity') return 'No donation request right now.';
      if (p.cash < pend.amount) return 'Not enough cash.';
      p.cash -= pend.amount; p.dbl = 3; p.stats.donated += pend.amount;
      emit(room, 'donate', p.id);
      setResult(room, 'Generous!', `You donated ${peso(pend.amount)}. For your next 3 turns you roll 2 dice.`, 'Giving is part of a healthy relationship with money.', 'good', 'charity');
      return null;
    }
    case 'skip_charity':
      if (!pend || pend.kind !== 'charity') return 'No donation request right now.';
      setResult(room, 'Maybe Next Time', 'You did not donate this time.', '', 'neutral', 'charity');
      return null;
    case 'end_turn':
      if (t.phase !== 'done') return 'Finish the current action first.';
      nextTurn(room);
      return null;
  }
  return 'Unknown action.';
}

/* ---------- bots and timers ---------- */
function decideFor(room, p, mode) {
  // mode 'bot': try to play well. mode 'auto': safe defaults when the turn timer runs out.
  const t = room.turn, pend = t.pending;
  if (t.phase === 'roll') return { t: 'roll' };
  if (pend.kind === 'opp_choice') return mode === 'auto' ? { t: 'choose_deal', size: 'small' } : { t: 'choose_deal', size: p.cash >= 150000 ? 'big' : 'small' };
  if (pend.kind === 'deal') {
    if (mode === 'auto') return { t: 'pass' };
    return pend.card.down <= p.cash - 2000 ? { t: 'buy' } : { t: 'pass' };
  }
  if (pend.kind === 'market') {
    if (mode === 'auto') return { t: 'keep' };
    const best = pend.options.slice().sort((a, b) => b.net - a.net)[0];
    return pend.card.mult > 1.2 && best.net > 0 ? { t: 'sell', assetId: best.assetId } : { t: 'keep' };
  }
  if (pend.kind === 'charity') return { t: 'skip_charity' };
  return { t: 'end_turn' };
}

function botStep(room) {
  if (room.state !== 'playing' || !room.turn) return;
  const p = room.players.find(x => x.id === room.turn.pid);
  if (!p || !p.bot) return;
  const t = room.turn;
  if (t.phase === 'done') {
    const c = calc(p);
    const bank = p.liabs.find(l => l.bank && p.cash >= l.balance + 15000);
    if (bank) act(room, p, { t: 'payoff', id: bank.id });
    else {
      const cc = p.liabs.find(l => /Credit card/.test(l.name) && p.cash >= l.balance + 20000);
      if (cc && c.cashflow < 20000) act(room, p, { t: 'payoff', id: cc.id });
    }
  }
  act(room, p, decideFor(room, p, 'bot'));
  commit(room);
}

function scheduleBot(room) {
  clearTimeout(room.botTimer);
  if (room.state !== 'playing' || !room.turn) return;
  const p = room.players.find(x => x.id === room.turn.pid);
  if (p && p.bot) room.botTimer = setTimeout(() => botStep(room), BOT_DELAY);
}

function turnKey(room) {
  const t = room.turn;
  return t ? `${t.pid}|${t.phase}|${t.pending ? t.pending.kind : ''}|${room.rollSeq}|${room.round}` : '';
}

function armTimer(room) {
  const secs = room.settings.timer;
  if (room.state !== 'playing' || !room.turn) { clearTimeout(room.turnTimer); room.timerKey = ''; return; }
  const key = turnKey(room);
  if (key === room.timerKey) return;
  room.timerKey = key;
  clearTimeout(room.turnTimer);
  const p = room.players.find(x => x.id === room.turn.pid);
  if (!secs || !p || p.bot) { room.turn.deadline = null; return; }
  room.turn.deadline = Date.now() + secs * 1000;
  room.turnTimer = setTimeout(() => {
    if (room.state !== 'playing' || !room.turn || room.turn.pid !== p.id || turnKey(room) !== key) return;
    log(room, `${p.name} ran out of time. Playing the safe option.`, p.id);
    act(room, p, decideFor(room, p, 'auto'));
    commit(room);
  }, secs * 1000 + 100);
}

/* ---------- views / networking ---------- */
function pubPlayer(p) {
  return {
    id: p.id, name: p.name, color: p.color, avatar: p.avatar, bot: p.bot, connected: p.connected, prof: p.prof,
    pos: p.pos, free: p.free, freeRound: p.freeRound, children: p.children, childCost: p.childCost,
    cash: p.cash, salary: p.salary, taxes: p.taxes, other: p.other, dbl: p.dbl, skip: p.skip,
    liabs: p.liabs, assets: p.assets, stats: p.stats, calc: calc(p)
  };
}

function view(room, forId) {
  return {
    t: 'state', code: room.code, state: room.state, round: room.round, settings: room.settings,
    board: C.BOARD, endReason: room.endReason, you: forId || null, now: Date.now(),
    turn: room.turn, evt: room.evt, players: room.players.map(pubPlayer),
    log: room.log.slice(-30), history: room.history
  };
}

function send(ws, obj) { if (ws && ws.readyState === 1) ws.send(JSON.stringify(obj)); }

function commit(room) {
  if (room.state === 'playing') room.players.forEach(p => checkFree(room, p));
  armTimer(room);
  room.hosts.forEach(ws => send(ws, view(room, null)));
  room.players.forEach(p => { if (p.ws) send(p.ws, view(room, p.id)); });
  scheduleBot(room);
}

wss.on('connection', ws => {
  ws.ctx = {};
  ws.isAlive = true;
  ws.on('pong', () => { ws.isAlive = true; });
  ws.on('message', raw => {
    let msg; try { msg = JSON.parse(raw); } catch { return; }
    try { onMessage(ws, msg); } catch (e) { console.error('handler error', e); send(ws, { t: 'toast', msg: 'Something went wrong on the server.' }); }
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

// keep connections alive through proxies (Railway) and drop dead sockets
setInterval(() => {
  wss.clients.forEach(ws => { if (!ws.isAlive) return ws.terminate(); ws.isAlive = false; try { ws.ping(); } catch {} });
}, 25000).unref();

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
      if (!room) return send(ws, { t: 'join_error', msg: 'No room found with that code.' });
      let p = msg.token && room.players.find(x => x.token === msg.token && !x.bot);
      if (!p) {
        if (room.state !== 'lobby') return send(ws, { t: 'join_error', msg: 'This game has already started.' });
        if (room.players.length >= MAX_PLAYERS) return send(ws, { t: 'join_error', msg: 'This room is full (8 players).' });
        const name = String(msg.name || '').trim();
        if (!name) return send(ws, { t: 'join_error', msg: 'Please enter your name.' });
        p = addPlayer(room, name, false, msg.avatar);
        log(room, `${p.name} joined.`);
        emit(room, 'join', p.id);
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
          addPlayer(room, BOT_NAMES.find(n => !used.has(n)) || 'Bot ' + (room.players.length + 1), true);
          emit(room, 'join');
        }
        break;
      case 'remove_player':
        if (room.state === 'lobby') {
          const i = room.players.findIndex(p => p.id === msg.pid);
          if (i >= 0) { const [p] = room.players.splice(i, 1); if (p.ws) send(p.ws, { t: 'kicked' }); }
        }
        break;
      case 'set_rounds': room.settings.maxRounds = Math.max(5, Math.min(60, Number(msg.value) || 25)); break;
      case 'set_timer': { const v = Number(msg.value); room.settings.timer = TIMER_CHOICES.includes(v) ? v : 0; break; }
      case 'start': if (room.state === 'lobby') startGame(room); break;
      case 'skip_turn':
        if (room.state === 'playing' && room.turn) {
          const p = room.players.find(x => x.id === room.turn.pid);
          log(room, `The host skipped ${p ? p.name : 'a'}'s turn.`);
          nextTurn(room);
        }
        break;
      case 'end_game': if (room.state === 'playing') endGame(room, 'host'); break;
      case 'new_game':
        room.state = 'lobby'; room.turn = null; room.log = []; room.history = []; room.timerKey = '';
        room.players.forEach(p => { p.prof = null; });
        break;
    }
    return commit(room);
  }
  if (ctx.role === 'player') {
    const p = room.players.find(x => x.id === ctx.pid);
    if (!p) return;
    if (msg.t === 'set_avatar') {
      if (room.state === 'lobby' && Number.isInteger(msg.avatar) && msg.avatar >= 0 && msg.avatar < AV_COLORS.length && !room.players.some(q => q.avatar === msg.avatar)) {
        p.avatar = msg.avatar; p.color = AV_COLORS[msg.avatar];
      } else send(ws, { t: 'toast', msg: 'That character is already taken.' });
      return commit(room);
    }
    const err = act(room, p, msg);
    if (err) send(ws, { t: 'toast', msg: err });
    commit(room);
  }
}

setInterval(() => {
  const now = Date.now();
  for (const [code, room] of rooms) {
    const live = room.hosts.size || room.players.some(p => p.ws);
    if (!live && now - room.created > 6 * 3600 * 1000) { clearTimeout(room.botTimer); clearTimeout(room.turnTimer); rooms.delete(code); }
  }
}, 600000).unref();

if (require.main === module) {
  server.listen(PORT, () => console.log(`AHON! running on http://localhost:${PORT}`));
}
module.exports = { server, rooms, calc };
