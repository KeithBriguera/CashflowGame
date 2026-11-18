# AHON! — financial literacy game (host screen + phone controllers)

Original game (not affiliated with any commercial board game). Players race to make
passive income exceed monthly expenses.

## Run locally
    npm install
    npm start          # http://localhost:3000
- Host screen (laptop/TV): /host.html
- Players (phones): /play.html (or scan the QR on the host screen)
- Phones must reach the same server (same Wi-Fi: use your PC's LAN IP, or deploy).

## Deploy (Railway)
Push this folder to a repo, create a Railway service from it. It auto-detects Node and runs `npm start`.
WebSockets work out of the box; PORT is read from the environment.

## Test
    npm test           # bot-only full games

## Customize
Edit content.js: professions, deals, doodads, market events, and lessons.
Edit BOOST in content.js to make returns easier or harder. Default rounds: 25 (host can change in lobby).
