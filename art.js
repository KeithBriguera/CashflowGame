// AHON! original SVG art: icons for spaces/cards and 8 original avatar characters.
// All art is drawn from simple shapes on a 64x64 canvas.
(function () {
  const G = '#ffc83d', G2 = '#e0a100', INK = '#1b2540';
  const ART = {
    // ---- board spaces ----
    payday: `<ellipse cx="32" cy="48" rx="20" ry="7" fill="${G2}"/><rect x="12" y="38" width="40" height="10" fill="${G}"/><ellipse cx="32" cy="38" rx="20" ry="7" fill="#ffe27a"/><ellipse cx="32" cy="28" rx="20" ry="7" fill="${G2}"/><rect x="12" y="18" width="40" height="10" fill="${G}"/><ellipse cx="32" cy="18" rx="20" ry="7" fill="#ffe27a"/><text x="32" y="22" font-size="11" font-weight="900" text-anchor="middle" fill="${G2}" font-family="system-ui">₱</text>`,
    opp: `<circle cx="32" cy="26" r="16" fill="#ffe27a"/><path d="M24 36c-5-4-6-12-2-17 4-5 12-6 17-2 5 4 5 12 0 17-2 2-3 4-3 7H27c0-3-1-4-3-5z" fill="#fff6c9"/><rect x="25" y="43" width="14" height="5" rx="2" fill="#8b95b0"/><rect x="27" y="49" width="10" height="5" rx="2.5" fill="#5f6b8a"/><path d="M32 6v5M13 14l4 3M51 14l-4 3M8 28h5M51 28h5" stroke="${G}" stroke-width="3" stroke-linecap="round"/>`,
    doodad: `<path d="M14 24h36l3 30H11z" fill="#ff6b6b"/><path d="M14 24h36l1 8H13z" fill="#ff8f8f"/><path d="M23 24v-4a9 9 0 0 1 18 0v4" fill="none" stroke="#b83b3b" stroke-width="3.5" stroke-linecap="round"/><circle cx="24" cy="36" r="2.5" fill="#fff"/><circle cx="40" cy="36" r="2.5" fill="#fff"/><path d="M50 8l2 5 5 2-5 2-2 5-2-5-5-2 5-2z" fill="${G}"/>`,
    market: `<rect x="8" y="10" width="48" height="44" rx="7" fill="#e8f4ff"/><rect x="16" y="34" width="7" height="14" rx="2" fill="#4a8fbf"/><rect x="28" y="26" width="7" height="22" rx="2" fill="#27d3a2"/><rect x="40" y="18" width="7" height="30" rx="2" fill="#4a8fbf"/><path d="M14 30l12-10 9 6 17-14" fill="none" stroke="#ff6b6b" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round"/><path d="M45 12h8v8" fill="none" stroke="#ff6b6b" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round"/>`,
    charity: `<path d="M32 54C12 40 8 28 8 21c0-7 5-12 12-12 5 0 9 3 12 7 3-4 7-7 12-7 7 0 12 5 12 12 0 7-4 19-24 33z" fill="#b794f6"/><path d="M32 54C12 40 8 28 8 21c0-7 5-12 12-12 3 0 6 1 8 3-9 1-14 9-12 17 2 8 9 15 16 25z" fill="#9b7bff"/><path d="M22 20c0-3 3-5 6-4" stroke="#fff" stroke-width="3" stroke-linecap="round" fill="none" opacity=".8"/>`,
    baby: `<circle cx="32" cy="34" r="20" fill="#ffd9b8"/><path d="M26 15c2-5 9-6 12-1-3-1-6 0-8 2z" fill="#8a5a3c"/><circle cx="24" cy="32" r="3" fill="${INK}"/><circle cx="40" cy="32" r="3" fill="${INK}"/><circle cx="19" cy="40" r="4" fill="#ff9fb0" opacity=".7"/><circle cx="45" cy="40" r="4" fill="#ff9fb0" opacity=".7"/><path d="M27 43q5 5 10 0" stroke="${INK}" stroke-width="2.5" fill="none" stroke-linecap="round"/><circle cx="32" cy="57" r="4" fill="#ff9fb0"/>`,
    downsized: `<path d="M8 26l24-12 24 12v24H8z" fill="#c98e55"/><path d="M8 26l24 10 24-10-24-12z" fill="#ddaa72"/><path d="M32 36v14" stroke="#a8743f" stroke-width="3"/><rect x="26" y="40" width="12" height="5" fill="#fff" opacity=".85"/><path d="M32 6v14M26 15l6 7 6-7" stroke="#ff6b6b" stroke-width="4" fill="none" stroke-linecap="round" stroke-linejoin="round"/>`,

    // ---- businesses & properties (small) ----
    store: `<rect x="10" y="26" width="44" height="28" fill="#ffe0b8"/><path d="M6 14h52l-4 14H10z" fill="#ff6b6b"/><path d="M14 14l-2 14M26 14l-1 14M38 14l1 14M50 14l2 14" stroke="#fff" stroke-width="4"/><rect x="14" y="34" width="14" height="20" fill="#7d5a3a"/><rect x="33" y="34" width="17" height="11" fill="#9ee3ff"/><circle cx="24" cy="44" r="1.6" fill="${G}"/>`,
    online: `<rect x="14" y="14" width="36" height="26" rx="3" fill="#2a3558"/><rect x="17" y="17" width="30" height="20" rx="1.5" fill="#6fd0ff"/><path d="M8 44h48l-4 7H12z" fill="#8b95b0"/><path d="M24 22h3l2 8h9l2-6H27" fill="none" stroke="#fff" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/><circle cx="30" cy="33" r="1.6" fill="#fff"/><circle cx="37" cy="33" r="1.6" fill="#fff"/>`,
    bedspace: `<rect x="8" y="10" width="4" height="46" fill="#7d5a3a"/><rect x="52" y="10" width="4" height="46" fill="#7d5a3a"/><rect x="10" y="22" width="44" height="7" rx="2" fill="#4cc9f0"/><rect x="10" y="42" width="44" height="7" rx="2" fill="#ff9a4d"/><rect x="12" y="17" width="12" height="6" rx="3" fill="#fff"/><rect x="12" y="37" width="12" height="6" rx="3" fill="#fff"/>`,
    stocks: `<rect x="8" y="8" width="48" height="48" rx="8" fill="#16213f"/><rect x="16" y="36" width="7" height="12" fill="#27d3a2"/><rect x="28" y="28" width="7" height="20" fill="#27d3a2"/><rect x="40" y="18" width="7" height="30" fill="#27d3a2"/><path d="M14 30l10-8 8 5 16-14" fill="none" stroke="${G}" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round"/>`,
    fund: `<circle cx="32" cy="32" r="24" fill="#4cc9f0"/><path d="M32 32V8a24 24 0 0 1 22 15z" fill="${G}"/><path d="M32 32l22-9a24 24 0 0 1-6 29z" fill="#27d3a2"/><path d="M32 32l16 20A24 24 0 0 1 12 48z" fill="#9b7bff"/><circle cx="32" cy="32" r="7" fill="#fff"/>`,
    tricycle: `<circle cx="16" cy="48" r="8" fill="${INK}"/><circle cx="16" cy="48" r="3" fill="#8b95b0"/><circle cx="48" cy="48" r="8" fill="${INK}"/><circle cx="48" cy="48" r="3" fill="#8b95b0"/><path d="M8 44V30c0-4 3-7 7-7h14v21z" fill="#ffc83d"/><path d="M29 44V28h8l11 10v6z" fill="#ff6b6b"/><rect x="12" y="27" width="10" height="8" rx="2" fill="#9ee3ff"/>`,
    water: `<path d="M32 6C22 20 14 28 14 38a18 18 0 0 0 36 0C50 28 42 20 32 6z" fill="#4cc9f0"/><path d="M32 6C22 20 14 28 14 38a18 18 0 0 0 8 15c-6-12 0-26 10-47z" fill="#2aa7d6"/><path d="M40 36a8 8 0 0 1-6 9" stroke="#fff" stroke-width="3" fill="none" stroke-linecap="round" opacity=".8"/>`,
    stall: `<path d="M6 24a26 18 0 0 1 52 0z" fill="#ff9a4d"/><path d="M6 24h52" stroke="#fff" stroke-width="3"/><path d="M19 8l-5 16M32 6v18M45 8l5 16" stroke="#fff" stroke-width="3"/><rect x="10" y="38" width="44" height="6" rx="2" fill="#7d5a3a"/><rect x="14" y="44" width="4" height="12" fill="#7d5a3a"/><rect x="46" y="44" width="4" height="12" fill="#7d5a3a"/><circle cx="22" cy="33" r="5" fill="#ff6b6b"/><circle cx="33" cy="33" r="5" fill="#ffc83d"/><circle cx="44" cy="33" r="5" fill="#6fe86f"/>`,
    print: `<rect x="16" y="8" width="32" height="18" fill="#fff"/><rect x="8" y="24" width="48" height="22" rx="5" fill="#5f6b8a"/><rect x="16" y="38" width="32" height="18" fill="#fff"/><path d="M21 43h22M21 48h22M21 53h14" stroke="#9aa5c4" stroke-width="2"/><circle cx="48" cy="31" r="2.5" fill="#27d3a2"/>`,
    laundry: `<rect x="10" y="6" width="44" height="52" rx="7" fill="#e8f4ff"/><rect x="10" y="6" width="44" height="12" rx="6" fill="#4cc9f0"/><circle cx="32" cy="37" r="14" fill="#8b95b0"/><circle cx="32" cy="37" r="10" fill="#6fd0ff"/><path d="M26 38q3-4 6 0t6 0" stroke="#fff" stroke-width="2.4" fill="none" stroke-linecap="round"/><circle cx="18" cy="12" r="2" fill="#fff"/><circle cx="25" cy="12" r="2" fill="#fff"/>`,

    // ---- big deals ----
    apartment: `<rect x="12" y="8" width="40" height="48" fill="#9b7bff"/><rect x="12" y="8" width="40" height="6" fill="#7d5fe0"/>${[0,1,2].map(r=>[0,1,2].map(c=>`<rect x="${17+c*12}" y="${18+r*11}" width="7" height="7" rx="1.5" fill="${(r+c)%2?'#ffe27a':'#d9ecff'}"/>`).join('')).join('')}<rect x="27" y="46" width="10" height="10" fill="#4a3a8f"/><rect x="6" y="56" width="52" height="3" rx="1.5" fill="#5f6b8a"/>`,
    tea: `<path d="M18 22h28l-4 32H22z" fill="#fff6e6"/><path d="M19 30h26l-2 24H21z" fill="#c98e55"/><ellipse cx="32" cy="22" rx="14" ry="4" fill="#fff"/><path d="M36 22l8-16" stroke="#ff6b6b" stroke-width="3.5" stroke-linecap="round"/><circle cx="26" cy="46" r="2.5" fill="#5b3a21"/><circle cx="33" cy="49" r="2.5" fill="#5b3a21"/><circle cx="39" cy="45" r="2.5" fill="#5b3a21"/><circle cx="30" cy="41" r="2.5" fill="#5b3a21"/>`,
    townhouse: `<path d="M4 30l12-12 12 12v24H4z" fill="#ff9a4d"/><path d="M28 30l12-12 12 12v24H28z" fill="#4cc9f0"/><path d="M52 30l8-8v32H52z" fill="#ffc83d"/><path d="M2 30l14-14 14 14M26 30l14-14 14 14" fill="none" stroke="#5f6b8a" stroke-width="3" stroke-linejoin="round"/><rect x="11" y="40" width="9" height="14" fill="#7d5a3a"/><rect x="35" y="40" width="9" height="14" fill="#2a3558"/><rect x="8" y="33" width="6" height="5" fill="#fff6c9"/><rect x="32" y="33" width="6" height="5" fill="#fff6c9"/>`,
    farm: `<path d="M30 58c2-18 0-28-6-38" stroke="#8a5a3c" stroke-width="6" fill="none" stroke-linecap="round"/><path d="M26 22C14 14 8 18 4 24c8-2 14 0 22-2zM26 22c-4-12 2-16 10-18-4 6-4 12-10 18zM26 22c12-6 20-2 24 4-8-2-16 0-24-4zM26 22c10 2 14 10 14 18-6-6-10-10-14-18z" fill="#27d3a2"/><circle cx="24" cy="25" r="4" fill="#8a5a3c"/><circle cx="29" cy="26" r="4" fill="#6b4328"/><rect x="4" y="56" width="56" height="5" rx="2.5" fill="#6fe86f"/>`,
    commercial: `<rect x="6" y="24" width="52" height="32" fill="#ffe0b8"/><path d="M4 24h56l-3-12H7z" fill="#ff6b6b"/><path d="M14 12l-3 12M24 12l-1 12M34 12l1 12M44 12l2 12M53 12l3 12" stroke="#fff" stroke-width="3"/><rect x="10" y="32" width="12" height="24" fill="#7d5a3a"/><rect x="26" y="32" width="12" height="24" fill="#7d5a3a"/><rect x="42" y="32" width="12" height="24" fill="#7d5a3a"/><rect x="12" y="35" width="8" height="8" fill="#9ee3ff"/><rect x="28" y="35" width="8" height="8" fill="#9ee3ff"/><rect x="44" y="35" width="8" height="8" fill="#9ee3ff"/>`,
    gas: `<rect x="12" y="8" width="30" height="46" rx="5" fill="#ff6b6b"/><rect x="17" y="14" width="20" height="14" rx="2" fill="#ffe27a"/><rect x="8" y="54" width="38" height="5" rx="2" fill="#5f6b8a"/><path d="M42 20h6a5 5 0 0 1 5 5v22a3 3 0 0 0 6 0V28" fill="none" stroke="${INK}" stroke-width="3.5" stroke-linecap="round"/><path d="M27 33c-4 3-4 8 0 10 4-2 4-7 0-10z" fill="#fff"/>`,
    boarding: `<rect x="10" y="6" width="44" height="50" fill="#ff9a4d"/><rect x="10" y="6" width="44" height="7" fill="#e07a2e"/>${[0,1,2,3].map(r=>[0,1,2].map(c=>`<rect x="${15+c*13}" y="${17+r*9}" width="8" height="6" rx="1.5" fill="${(r*3+c)%3===1?'#ffe27a':'#d9ecff'}"/>`).join('')).join('')}<rect x="27" y="48" width="10" height="8" fill="#7d4a1c"/><rect x="6" y="56" width="52" height="3" rx="1.5" fill="#5f6b8a"/>`,
    grocery: `<path d="M6 12h9l7 28h26l6-20H18" fill="none" stroke="${INK}" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/><path d="M19 20h35l-5 18H24z" fill="#27d3a2"/><circle cx="26" cy="50" r="5" fill="${INK}"/><circle cx="46" cy="50" r="5" fill="${INK}"/><circle cx="30" cy="29" r="4" fill="#ff6b6b"/><circle cx="40" cy="28" r="4" fill="${G}"/>`,

    // ---- doodads ----
    sale: `<path d="M6 32L32 6l26 26-26 26z" fill="#ff6b6b" transform="rotate(0 32 32)"/><circle cx="20" cy="30" r="3.5" fill="#fff"/><text x="38" y="38" font-size="15" font-weight="900" text-anchor="middle" fill="#fff" font-family="system-ui" transform="rotate(-45 38 34)">%</text><path d="M44 8l2 5 5 2-5 2-2 5-2-5-5-2 5-2z" fill="${G}"/>`,
    phone: `<rect x="18" y="4" width="28" height="56" rx="6" fill="${INK}"/><rect x="21" y="10" width="22" height="42" rx="2" fill="#6fd0ff"/><rect x="26" y="6" width="12" height="2.5" rx="1.2" fill="#5f6b8a"/><circle cx="32" cy="56" r="1.8" fill="#8b95b0"/><circle cx="32" cy="28" r="6" fill="#fff" opacity=".75"/>`,
    cup: `<path d="M18 18h28l-3 38H21z" fill="#ffe0f0"/><path d="M19 28h26l-2 28H21z" fill="#ff9fb0"/><ellipse cx="32" cy="18" rx="14" ry="4" fill="#fff"/><path d="M36 18l8-14" stroke="#4cc9f0" stroke-width="3.5" stroke-linecap="round"/><circle cx="27" cy="48" r="2.4" fill="#5b3a21"/><circle cx="35" cy="50" r="2.4" fill="#5b3a21"/><circle cx="31" cy="42" r="2.4" fill="#5b3a21"/>`,
    ticket: `<path d="M6 16h52v12a4 4 0 0 0 0 8v12H6V36a4 4 0 0 0 0-8z" fill="#ff7ac8"/><path d="M42 16v32" stroke="#fff" stroke-width="2.5" stroke-dasharray="3 3"/><path d="M20 36l4-12 4 8 3-5 3 9" fill="none" stroke="#fff" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/><circle cx="50" cy="32" r="3" fill="#fff"/>`,
    sneaker: `<path d="M6 40c0-6 4-6 8-8l6-10 8 2 6 6c8 2 18 4 24 8 2 1 2 4-1 4H8c-1 0-2-1-2-2z" fill="#fff"/><path d="M6 44h52v6H8c-2 0-2-6-2-6z" fill="#ff6b6b"/><path d="M20 22l8 2 6 6" fill="none" stroke="#4cc9f0" stroke-width="3.5" stroke-linecap="round"/><path d="M16 36h22" stroke="#4cc9f0" stroke-width="3"/>`,
    resort: `<circle cx="46" cy="16" r="8" fill="${G}"/><path d="M6 44c10-6 18-6 26 0s18 6 26 0v14H6z" fill="#4cc9f0"/><path d="M20 44c0-14 2-24 6-34" stroke="#8a5a3c" stroke-width="4" fill="none" stroke-linecap="round"/><path d="M26 12c-8-6-14-4-18 2 7-1 12 1 18-2zM26 12c0-9 6-10 12-9-3 4-4 8-12 9zM26 12c9-3 14 1 16 7-7-3-11-3-16-7z" fill="#27d3a2"/>`,
    gaming: `<rect x="6" y="20" width="52" height="28" rx="14" fill="#9b7bff"/><rect x="15" y="29" width="4" height="12" rx="1" fill="#fff"/><rect x="11" y="33" width="12" height="4" rx="1" fill="#fff"/><circle cx="43" cy="30" r="3.2" fill="#ff6b6b"/><circle cx="50" cy="36" r="3.2" fill="${G}"/><circle cx="43" cy="40" r="3.2" fill="#27d3a2"/><circle cx="36" cy="36" r="3.2" fill="#4cc9f0"/>`,
    party: `<path d="M32 8c-10 0-16 8-16 18s6 18 16 18 16-8 16-18S42 8 32 8z" fill="#ff7ac8"/><path d="M32 44l-3 6h6z" fill="#ff7ac8"/><path d="M32 50c-6 4 6 6 0 12" stroke="#8b95b0" stroke-width="2.5" fill="none"/><ellipse cx="26" cy="22" rx="4" ry="6" fill="#fff" opacity=".5"/><circle cx="52" cy="14" r="3" fill="${G}"/><circle cx="12" cy="10" r="3" fill="#4cc9f0"/><circle cx="54" cy="44" r="3" fill="#27d3a2"/>`
  };

  Object.assign(ART, {
    house: `<path d="M8 30L32 10l24 20v26H8z" fill="#ffd9a8"/><path d="M4 32L32 8l28 24" fill="none" stroke="#ee6b5b" stroke-width="6" stroke-linecap="round" stroke-linejoin="round"/><rect x="26" y="38" width="12" height="18" rx="2" fill="#8a5a3c"/><rect x="14" y="36" width="9" height="9" rx="1.5" fill="#6fd0ff"/><rect x="41" y="36" width="9" height="9" rx="1.5" fill="#6fd0ff"/>`,
    cap: `<path d="M32 12L4 26l28 14 28-14z" fill="#1b2540"/><path d="M16 34v10c0 4 7 8 16 8s16-4 16-8V34L32 42z" fill="#2a3558"/><path d="M56 28v16" stroke="#ffc83d" stroke-width="3" stroke-linecap="round"/><circle cx="56" cy="46" r="3.5" fill="#ffc83d"/>`,
    plane: `<g transform="rotate(-35 32 32)"><rect x="6" y="27" width="52" height="10" rx="5" fill="#e8f4ff"/><path d="M26 30L18 10h8l14 20z" fill="#4cc9f0"/><path d="M26 34L18 54h8l14-20z" fill="#4cc9f0"/><path d="M8 30L4 22h6l6 8z" fill="#4cc9f0"/><circle cx="50" cy="32" r="2.5" fill="#1b2540"/></g>`,
    boat: `<path d="M8 40h48l-8 14H16z" fill="#ee6b5b"/><path d="M32 8v32" stroke="#8a5a3c" stroke-width="3"/><path d="M34 10l18 24H34z" fill="#fff6e6"/><path d="M30 14L16 34h14z" fill="#ffd24d"/><path d="M4 58c6-4 10-4 16 0s10 4 16 0 10-4 16 0 6 2 8 0" fill="none" stroke="#4cc9f0" stroke-width="3" stroke-linecap="round"/>`,
    clinic: `<rect x="10" y="16" width="44" height="40" rx="5" fill="#fff"/><rect x="10" y="16" width="44" height="10" rx="5" fill="#ee6b5b"/><rect x="28" y="30" width="8" height="18" rx="1.5" fill="#27d3a2"/><rect x="23" y="35" width="18" height="8" rx="1.5" fill="#27d3a2"/><rect x="26" y="50" width="12" height="6" fill="#8b95b0"/>`,
    car: `<path d="M6 40l6-14c1-3 4-5 7-5h26c3 0 6 2 7 5l6 14v10H6z" fill="#4aa3df"/><path d="M16 26h14v10H12zM34 26h14l4 10H34z" fill="#bfe6ff"/><circle cx="18" cy="50" r="6.5" fill="#1b2540"/><circle cx="46" cy="50" r="6.5" fill="#1b2540"/><circle cx="18" cy="50" r="2.5" fill="#8b95b0"/><circle cx="46" cy="50" r="2.5" fill="#8b95b0"/><rect x="52" y="38" width="5" height="4" rx="1" fill="#ffd24d"/>`,
    gift: `<rect x="10" y="26" width="44" height="30" rx="4" fill="#ee6b5b"/><rect x="8" y="20" width="48" height="10" rx="3" fill="#ff8f8f"/><rect x="28" y="20" width="8" height="36" fill="#ffd24d"/><path d="M32 20c-8-12-18-6-12 0zM32 20c8-12 18-6 12 0z" fill="#ffd24d"/>`,
    audit: `<rect x="12" y="8" width="40" height="50" rx="5" fill="#fff6e6"/><rect x="22" y="4" width="20" height="10" rx="3" fill="#8b95b0"/><path d="M20 26h24M20 34h24M20 42h14" stroke="#9aa5c4" stroke-width="3" stroke-linecap="round"/><circle cx="44" cy="46" r="8" fill="#ee6b5b"/><path d="M40 46h8" stroke="#fff" stroke-width="3" stroke-linecap="round"/>`,
    dream: `<path d="M32 6l7.5 17 18.5 2-14 12.5 4 18.2L32 46 16 55.7l4-18.2L6 25l18.5-2z" fill="#ffd24d"/><path d="M32 6l7.5 17 18.5 2-14 12.5z" fill="#ffe98a"/><circle cx="32" cy="30" r="5" fill="#fff6c9"/>`,
    hsdeal: `<rect x="8" y="20" width="48" height="34" rx="5" fill="#8a5a3c"/><rect x="8" y="20" width="48" height="12" rx="5" fill="#a8743f"/><path d="M24 20v-5a4 4 0 0 1 4-4h8a4 4 0 0 1 4 4v5" fill="none" stroke="#5a3a22" stroke-width="3.5"/><rect x="28" y="30" width="8" height="8" rx="1.5" fill="#ffd24d"/>`
  });
  ART.payout = ART.payday; ART.luxury = ART.sale; ART.windfall = ART.gift;

  function icon(name, size, cls) {
    const body = ART[name] || ART.opp;
    const s = size ? ` width="${size}" height="${size}"` : '';
    return `<svg class="ico ${cls || ''}" viewBox="0 0 64 64"${s} xmlns="http://www.w3.org/2000/svg" aria-hidden="true">${body}</svg>`;
  }

  // ---- avatars: 8 original characters, ink-outlined ----
  const INKC = '#1d2433';
  const OL = `stroke="${INKC}" stroke-width="1.8" stroke-linejoin="round" stroke-linecap="round"`;
  const AV = ['#ee6b5b', '#f2b632', '#2fae8f', '#4aa3df', '#9a7be0', '#ff9a5c', '#8fcf5a', '#f19cc0'];
  const SKIN = ['#f2c9a0', '#e0a878', '#c68642', '#8d5524', '#ffdbac', '#e8b88a', '#d19a66', '#a1665e'];
  const HAIR = ['#2b1d14', '#6b3f1d', '#1a1a1a', '#c14a2b', '#3b2a5a', '#2b1d14', '#8a8a8a', '#1a1a1a'];
  const SHIRT = ['#fffaf0', '#1d2433', '#fffaf0', '#ee6b5b', '#fffaf0', '#1d2433', '#fffaf0', '#1d2433'];
  const hairBack = [
    '',
    '<path d="M16 30c0-14 8-20 16-20s16 6 16 20v18H16z" fill="@@"/>',
    '',
    '<circle cx="19" cy="24" r="7" fill="@@"/><circle cx="45" cy="24" r="7" fill="@@"/><circle cx="24" cy="15" r="8" fill="@@"/><circle cx="40" cy="15" r="8" fill="@@"/><circle cx="32" cy="12" r="8" fill="@@"/>',
    '', '', '',
    '<path d="M44 20c8 2 10 14 4 24" stroke="@@" stroke-width="7" fill="none" stroke-linecap="round"/>'
  ];
  const hairFront = [
    '<path d="M18 28c0-10 6-16 14-16s14 6 14 16c-4-6-10-8-14-8s-10 2-14 8z" fill="@@"/>',
    '<path d="M18 30c0-11 6-17 14-17s14 6 14 17c-3-5-7-9-14-9s-11 4-14 9z" fill="@@"/>',
    '<path d="M18 28c0-10 6-15 14-15s14 5 14 15c-4-5-9-7-14-7s-10 2-14 7z" fill="@@"/><circle cx="32" cy="9" r="6" fill="@@"/>',
    '<path d="M18 27c2-8 8-11 14-11s12 3 14 11c-4-4-9-5-14-5s-10 1-14 5z" fill="@@"/>',
    `<path d="M17 28c0-10 6-17 15-17s15 7 15 17z" fill="#4aa3df" ${OL}/><path d="M14 28h36l4 3H12z" fill="#2f7fb8" ${OL}/>`,
    '<path d="M18 28c0-10 6-16 14-16s14 6 14 16c-4-6-10-8-14-8s-10 2-14 8z" fill="@@"/><rect x="17" y="21" width="30" height="5" rx="2.5" fill="#ee6b5b" stroke="#1d2433" stroke-width="1.8"/>',
    '',
    '<path d="M18 28c0-10 6-16 14-16s14 6 14 16c-4-6-10-8-14-8s-10 2-14 8z" fill="@@"/>'
  ];
  const extras = [
    '', '<circle cx="19" cy="37" r="2.2" fill="#f2b632" stroke="#1d2433" stroke-width="1.2"/><circle cx="45" cy="37" r="2.2" fill="#f2b632" stroke="#1d2433" stroke-width="1.2"/>', '',
    '', '', '',
    '<g fill="none" stroke="#1d2433" stroke-width="2"><circle cx="26" cy="32" r="4.5"/><circle cx="38" cy="32" r="4.5"/><path d="M30.5 32h3"/></g>', ''
  ];

  function avatar(i, size) {
    i = ((i % 8) + 8) % 8;
    const H = HAIR[i];
    const rep = str => str.replace(/fill="@@"/g, `fill="${H}" ${OL}`).replace(/stroke="@@"/g, `stroke="${H}"`);
    const s = size ? ` width="${size}" height="${size}"` : '';
    const col = AV[i];
    return `<svg class="avatar" viewBox="0 0 64 64"${s} xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <defs><clipPath id="avc${i}"><circle cx="32" cy="32" r="30"/></clipPath></defs>
      <circle cx="32" cy="32" r="31" fill="${col}"/>
      <g clip-path="url(#avc${i})">
        ${rep(hairBack[i])}
        <path d="M10 66c0-14 9-20 22-20s22 6 22 20z" fill="${SHIRT[i]}" ${OL}/>
        <path d="M26 46.5q6 5 12 0" fill="none" stroke="${INKC}" stroke-width="1.6" stroke-linecap="round" opacity=".7"/>
        <rect x="27" y="38" width="10" height="9" rx="4" fill="${SKIN[i]}" ${OL}/>
        <circle cx="18.5" cy="31" r="3.2" fill="${SKIN[i]}" ${OL}/><circle cx="45.5" cy="31" r="3.2" fill="${SKIN[i]}" ${OL}/>
        <circle cx="32" cy="30" r="14" fill="${SKIN[i]}" ${OL}/>
        ${rep(hairFront[i])}
        <circle cx="26.5" cy="32" r="1.9" fill="${INKC}"/><circle cx="37.5" cy="32" r="1.9" fill="${INKC}"/>
        <path d="M28.5 38q3.5 3 7 0" stroke="${INKC}" stroke-width="1.9" fill="none" stroke-linecap="round"/>
        ${extras[i]}
      </g>
      <circle cx="32" cy="32" r="30.2" fill="none" stroke="${INKC}" stroke-width="2.4"/></svg>`;
  }

  // ---- UI icon set (24px, 2px stroke) ----
  const UI = {
    dice: '<rect x="3.5" y="3.5" width="17" height="17" rx="4"/><circle cx="8.5" cy="8.5" r="1.1" fill="currentColor"/><circle cx="15.5" cy="15.5" r="1.1" fill="currentColor"/><circle cx="12" cy="12" r="1.1" fill="currentColor"/><circle cx="15.5" cy="8.5" r="1.1" fill="currentColor"/><circle cx="8.5" cy="15.5" r="1.1" fill="currentColor"/>',
    wallet: '<path d="M4 8V6.5A2.5 2.5 0 0 1 6.5 4H17v4"/><rect x="3.5" y="8" width="17" height="12" rx="2.5"/><path d="M20.5 12.5h-4a1.8 1.8 0 0 0 0 3.6h4"/>',
    news: '<rect x="4" y="4" width="16" height="16" rx="2.5"/><path d="M8 9h8M8 12.5h8M8 16h5"/>',
    book: '<path d="M4.5 5.5c2.5-1 5-1 7.5.5 2.5-1.5 5-1.5 7.5-.5v13c-2.5-1-5-1-7.5.5-2.5-1.5-5-1.5-7.5-.5z"/><path d="M12 6v13"/>',
    trophy: '<path d="M8 4.5h8v5a4 4 0 0 1-8 0z"/><path d="M8 6H5v1.5A3 3 0 0 0 8 10.5M16 6h3v1.5a3 3 0 0 1-3 3"/><path d="M12 13.5V17M8.5 19.5h7M10 17h4"/>',
    timer: '<circle cx="12" cy="13.5" r="7"/><path d="M12 9.5v4l2.5 1.5M9.5 3.5h5"/>',
    volume: '<path d="M4 9.5h3.5L12 6v12l-4.5-3.5H4z"/><path d="M15.5 9a4 4 0 0 1 0 6M18 6.5a7.5 7.5 0 0 1 0 11"/>',
    mute: '<path d="M4 9.5h3.5L12 6v12l-4.5-3.5H4z"/><path d="M16 9.5l5 5M21 9.5l-5 5"/>',
    expand: '<path d="M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5"/>',
    download: '<path d="M12 4v11M7.5 11l4.5 4.5 4.5-4.5M5 19.5h14"/>',
    check: '<path d="M5 12.5l4.5 4.5L19 7.5"/>',
    close: '<path d="M6 6l12 12M18 6L6 18"/>',
    plus: '<path d="M12 5v14M5 12h14"/>',
    play: '<path d="M8 5.5v13l11-6.5z" fill="currentColor"/>',
    arrow: '<path d="M5 12h14M13 6l6 6-6 6"/>',
    bot: '<rect x="5" y="8" width="14" height="10" rx="3"/><path d="M12 8V5.5M9.5 12.5v1M14.5 12.5v1M3.5 12v3M20.5 12v3"/><circle cx="12" cy="4.5" r="1" fill="currentColor"/>',
    users: '<circle cx="9" cy="8.5" r="3.2"/><path d="M3.5 19c.5-3.5 2.8-5.2 5.5-5.2s5 1.7 5.5 5.2"/><path d="M15.5 5.6a3.2 3.2 0 0 1 0 5.8M17 14c2 .4 3.3 2 3.6 5"/>',
    bank: '<path d="M3.5 9.5L12 4l8.5 5.5z"/><path d="M6 11v6M10 11v6M14 11v6M18 11v6M4 19.5h16"/>',
    star: '<path d="M12 4l2.4 5 5.4.7-4 3.8 1 5.4L12 16.3 7.2 18.9l1-5.4-4-3.8 5.4-.7z"/>'
  };
  function ui(name, size) {
    const s = size || 20;
    return `<svg class="uic" viewBox="0 0 24 24" width="${s}" height="${s}" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${UI[name] || ''}</svg>`;
  }

  // ---- logo (wordmark uses currentColor) ----
  function logo(size) {
    const s = size ? ` height="${size}"` : '';
    return `<svg viewBox="0 0 214 58" class="logo"${s} xmlns="http://www.w3.org/2000/svg" aria-label="AHON!">
      <rect x="4" y="6" width="48" height="48" rx="12" fill="${INKC}"/>
      <rect x="1.5" y="3.5" width="48" height="48" rx="12" fill="#f2b632" stroke="${INKC}" stroke-width="3"/>
      <path d="M11 38l9-9 7 6 11-14" fill="none" stroke="${INKC}" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"/>
      <path d="M31 21h8v8" fill="none" stroke="${INKC}" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"/>
      <text x="62" y="43" font-family="'Bricolage Grotesque','Trebuchet MS',system-ui,sans-serif" font-weight="800" font-size="40" fill="currentColor" letter-spacing="1.5">AHON<tspan fill="#e5484d">!</tspan></text></svg>`;
  }

  window.ART = { icon, avatar, ui, logo, AV_COLORS: AV, names: Object.keys(ART) };
})();
