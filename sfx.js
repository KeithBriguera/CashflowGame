// AHON! synthesized sound effects (no audio files needed) + confetti/coin particles.
(function () {
  let ctx = null, enabled = true;
  function ac() {
    if (!ctx) { const A = window.AudioContext || window.webkitAudioContext; if (A) ctx = new A(); }
    if (ctx && ctx.state === 'suspended') ctx.resume();
    return ctx;
  }
  function tone(freq, dur, type, vol, delay, slideTo) {
    const c = ac(); if (!c || !enabled) return;
    const t0 = c.currentTime + (delay || 0);
    const o = c.createOscillator(), g = c.createGain();
    o.type = type || 'sine'; o.frequency.setValueAtTime(freq, t0);
    if (slideTo) o.frequency.exponentialRampToValueAtTime(slideTo, t0 + dur);
    g.gain.setValueAtTime(0.0001, t0);
    g.gain.exponentialRampToValueAtTime(vol || 0.15, t0 + 0.01);
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
    o.connect(g); g.connect(c.destination); o.start(t0); o.stop(t0 + dur + 0.05);
  }
  function noise(dur, vol, delay) {
    const c = ac(); if (!c || !enabled) return;
    const t0 = c.currentTime + (delay || 0), len = Math.floor(c.sampleRate * dur);
    const buf = c.createBuffer(1, len, c.sampleRate), d = buf.getChannelData(0);
    for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / len);
    const s = c.createBufferSource(), g = c.createGain(), f = c.createBiquadFilter();
    f.type = 'bandpass'; f.frequency.value = 1800;
    g.gain.value = vol || 0.12; s.buffer = buf; s.connect(f); f.connect(g); g.connect(c.destination); s.start(t0);
  }
  const SFX = {
    unlock() { ac(); },
    setEnabled(v) { enabled = !!v; },
    isEnabled() { return enabled; },
    roll() { for (let i = 0; i < 7; i++) noise(0.05, 0.1, i * 0.06); tone(220, 0.1, 'triangle', 0.08, 0.45); },
    step() { tone(520 + Math.random() * 60, 0.06, 'square', 0.04); },
    coin() { tone(988, 0.08, 'square', 0.08); tone(1319, 0.22, 'square', 0.08, 0.08); },
    payday() { [523, 659, 784, 1047].forEach((f, i) => tone(f, 0.18, 'triangle', 0.12, i * 0.07)); },
    buy() { [392, 523, 659, 784].forEach((f, i) => tone(f, 0.16, 'triangle', 0.13, i * 0.06)); },
    sell() { tone(784, 0.1, 'square', 0.07); tone(1047, 0.2, 'square', 0.07, 0.09); },
    bad() { tone(300, 0.35, 'sawtooth', 0.09, 0, 120); },
    card() { tone(660, 0.07, 'triangle', 0.1); tone(880, 0.1, 'triangle', 0.1, 0.06); },
    join() { tone(740, 0.09, 'sine', 0.1); tone(988, 0.14, 'sine', 0.1, 0.08); },
    tick() { tone(1200, 0.03, 'square', 0.04); },
    win() { [523, 659, 784, 1047, 784, 1047, 1319].forEach((f, i) => tone(f, 0.22, 'triangle', 0.14, i * 0.1)); },
    turn() { tone(880, 0.08, 'sine', 0.08); tone(1175, 0.12, 'sine', 0.08, 0.07); }
  };

  // ---------- particles ----------
  let cv = null, cx = null, parts = [], raf = 0;
  function ensureCanvas() {
    if (cv) return;
    cv = document.createElement('canvas');
    cv.style.cssText = 'position:fixed;inset:0;width:100%;height:100%;pointer-events:none;z-index:50';
    document.body.appendChild(cv); cx = cv.getContext('2d');
    const rs = () => { cv.width = innerWidth * devicePixelRatio; cv.height = innerHeight * devicePixelRatio; };
    rs(); addEventListener('resize', rs);
  }
  function loop() {
    cx.clearRect(0, 0, cv.width, cv.height);
    const dpr = devicePixelRatio;
    parts = parts.filter(p => p.life > 0 && p.y < innerHeight + 60);
    parts.forEach(p => {
      p.vy += p.g; p.x += p.vx; p.y += p.vy; p.rot += p.vr; p.life--;
      cx.save(); cx.translate(p.x * dpr, p.y * dpr); cx.rotate(p.rot); cx.globalAlpha = Math.min(1, p.life / 25);
      cx.fillStyle = p.c;
      if (p.coin) { cx.beginPath(); cx.ellipse(0, 0, p.s * dpr, p.s * dpr * Math.abs(Math.cos(p.rot * 2)) + 1, 0, 0, 7); cx.fill(); }
      else cx.fillRect(-p.s * dpr / 2, -p.s * dpr / 4, p.s * dpr, p.s * dpr / 2);
      cx.restore();
    });
    if (parts.length) raf = requestAnimationFrame(loop); else { raf = 0; cx.clearRect(0, 0, cv.width, cv.height); }
  }
  function spawn(n, x, y, o) {
    ensureCanvas();
    const colors = o.colors;
    for (let i = 0; i < n; i++) {
      const a = o.angle != null ? o.angle + (Math.random() - 0.5) * o.spread : Math.random() * 6.283;
      const sp = o.speed * (0.4 + Math.random() * 0.8);
      parts.push({ x: x + (Math.random() - .5) * (o.jitter || 0), y, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp, g: o.gravity || 0.25, rot: Math.random() * 6, vr: (Math.random() - .5) * 0.4, s: o.size * (0.6 + Math.random() * 0.8), c: colors[i % colors.length], coin: !!o.coin, life: o.life || 90 });
    }
    if (!raf) raf = requestAnimationFrame(loop);
  }
  const FX = {
    confetti(x, y) {
      const c = ['#ffc83d', '#ff6b6b', '#27d3a2', '#4cc9f0', '#9b7bff', '#ff9a4d', '#ffffff'];
      const w = innerWidth, h = innerHeight;
      spawn(110, x == null ? w * .5 : x, y == null ? h * .35 : y, { colors: c, speed: 14, size: 11, gravity: .32, life: 150 });
      spawn(60, w * .1, h * .8, { colors: c, speed: 16, size: 10, angle: -1.1, spread: .8, gravity: .35, life: 140 });
      spawn(60, w * .9, h * .8, { colors: c, speed: 16, size: 10, angle: -2.05, spread: .8, gravity: .35, life: 140 });
    },
    coins(x, y) { spawn(26, x == null ? innerWidth / 2 : x, y == null ? innerHeight / 2 : y, { colors: ['#ffc83d', '#ffe27a', '#e0a100'], speed: 9, size: 9, angle: -1.57, spread: 1.6, gravity: .35, coin: true, life: 80, jitter: 40 }); },
    smoke(x, y) { spawn(18, x == null ? innerWidth / 2 : x, y == null ? innerHeight / 2 : y, { colors: ['#6a7490', '#8b95b0', '#ff6b6b'], speed: 5, size: 9, angle: -1.57, spread: 2.2, gravity: -0.03, life: 60, jitter: 40 }); }
  };
  window.SFX = SFX; window.FX = FX;
})();
