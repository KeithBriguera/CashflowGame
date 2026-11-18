# AHON! — multiplayer financial-literacy game

Original game (not affiliated with any commercial board game). Players race to make
passive income exceed monthly expenses. Big screen = host, phones = controllers.

## Run locally
    npm install
    npm start            # http://localhost:3000

- Host screen (laptop/TV): `/host.html` (the root URL redirects here)
- Players (phones): `/play.html` (or scan the QR on the host screen)
- For phones on the same Wi-Fi, open the host page using your PC's LAN IP, not `localhost`.

## Deploy (Railway)
Push this folder to GitHub and create a Railway service from the repo. It runs `npm start`
and reads PORT from the environment. Files can sit at the repo root (flat) or in a `public/` folder.

## Features
- 8 original characters, illustrated board, animated tokens, sound effects, confetti
- Optional turn timer, adjustable game length, bots for solo testing
- Debrief with podium, progress chart, discussion questions, CSV export
- In-game glossary of money terms; phones vibrate on key events

## Customize
Edit `content.js` for professions, deals, doodads, market events and lessons.
`BOOST` there scales returns (default makes a 25-round session winnable).
Game returns are higher than real life; this is a teaching game, not investment advice.

## Test
    npm test             # bot-only full games
