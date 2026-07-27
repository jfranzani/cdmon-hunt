# HUNT THE WUMPUS

A single-page "Hunt the Wumpus" implementation in Angular, front-end only (no backend). Find the
gold ingot on an n×n board and return to the exit — alive — while avoiding bottomless pits and the
Wumpus. See `specs/001-angular-modernization/game-rules.md` for the full rules and
`specs/001-angular-modernization/spec.md` for what this modernization delivers.

## Prerequisites

Node.js `^22.22.3 || ^24.15.0 || >=26.0.0` (see `package.json` engines via `@angular/cli`) and npm.

## Install

```
npm install
```

## Development server

```
npm start
```

Navigate to `http://localhost:4200/`. The app reloads automatically on source changes.

## Build

```
npm run build
```

Build artifacts are written to `dist/cdmon-hunt-wumpus`.

## Running unit tests

```
npm test
```

Runs the Karma/Jasmine unit tests once in watch mode; use `npm run test:ci` for a single
non-interactive headless run (set `CHROME_BIN` to a Chrome/Chromium binary if none is on `PATH`).

## Linting

```
npm run lint
```

## How to play

1. On the start screen, set the board size, number of pits, and number of arrows, then press JUGAR.
2. On the play screen, use the five buttons to control the hunter:
   - **Girar Izquierda** / **Girar Derecha** — turn 90° left/right (doesn't move you).
   - **Avanzar** — move one cell in the direction you're currently facing.
   - **Disparar Flecha** — fire an arrow in your facing direction; it travels until it hits the
     Wumpus or a wall.
   - **Salir** — only enabled while standing on the starting/exit cell; ends the round (a win if
     you're carrying the gold).
3. Watch the log for perceptions: stench (Wumpus nearby), breeze (pit nearby), glimmer (gold here),
   choque (you bumped a wall), and grito (you killed the Wumpus).

## Internal rules

- Pits cannot block the guaranteed path to the golden cell.
- Pits cannot be on the escape cell, the golden cell, or the Wumpus cell.
- The escape/starting cell is always on the board's perimeter (a wall).
