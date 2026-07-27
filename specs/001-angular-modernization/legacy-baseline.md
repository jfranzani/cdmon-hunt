# Legacy Baseline: Hunt the Wumpus (Angular 10)

**Purpose**: This document captures the *observed behavior* of the existing codebase (as of the
`master` branch, Angular 10.1.3, no tests-passing guarantee) before any modernization work begins.
It exists so that `spec.md` can explicitly state which behaviors are preserved, changed, or removed,
rather than the team re-deriving the rules from memory. Source of truth is the code itself; this is
a reading, not a redesign.

## 1. Game Concept

A single-player grid dungeon-crawler based on "Hunt the Wumpus". The player starts on a wall cell
(the escape cell), must locate a hidden gold cell, and return to the escape cell while carrying the
gold, without stepping on the Wumpus or a pit. The player may also fire a limited number of arrows
in a straight line to kill the Wumpus.

## 2. Board Generation (`GameService`, `helper-functions.ts`)

- Board is a `cellsX` × `cellsY` grid (default **8×8**), configurable by the player.
- Every border cell gets `Wall` flags (`top`/`bottom`/`left`/`right`) based on its position; corner
  cells can have two walls set.
- **Escape cell**: chosen uniformly at random among wall cells only, via
  `getEscapeRandomNumber(cols, rows) = floor(random() * ((cols-1)*2 + (rows-1)*2 - 4))`, then walking
  wall cells in row-major order until that index is hit. Net effect: escape cell is always on the
  perimeter, i.e. **"Escape Cell must be on a wall"** (README rule).
- **Gold cell**: picked uniformly at random from all "available" cells (see `isCellAlreadyTaken`
  below) — i.e. any cell not already escape/pit/gold/Wumpus/clear-path.
- **Wumpus cell**: picked the same way, from available cells (after gold is placed, so gold and
  Wumpus never overlap). All 4 orthogonal neighbors of the Wumpus that are still "available" get
  `hasStink = true`.
- **Clean path to gold**: a BFS (`PathCreatorService.findPath`) computes the shortest orthogonal path
  from the escape cell to the gold cell over cells that are not yet taken. Every cell on that path
  (excluding the destination) is marked `isClearPath = true`, which makes it "taken" for subsequent
  placement — this is how the game guarantees pits never block the only route to the gold (README:
  **"Pits cannot block the user to the golden path"**).
- **Pits**: placed one at a time (`pits` count, default **1**), each uniformly at random among cells
  that are still "available" (i.e., not escape/gold/Wumpus/clear-path/another pit — README:
  **"Pits cannot be on an escape cell / the golden cell / the Wumpus cell"**). After all pits are
  placed, every orthogonal neighbor of every pit that is still available gets `hasBreeze = true`.
- **Placement order matters**: escape → gold → Wumpus (+stink) → clean path (+consumes cells) → pits
  (+breeze). This order is why pits can never land on the path, but stink/breeze cells CAN later be
  reused as pit neighbors (breeze/stink are hints, not obstacles).
- A cell is "taken"/unavailable for new features (`isCellAlreadyTaken`) if it is escape, pit, gold,
  Wumpus, or on the clear path. Breeze/stink flags do not make a cell unavailable.

## 3. Player & Movement (`PlayerService`)

- Player starts on the escape cell (`hasPlayer = true`), with `arrows` = configured arrow count
  (default **1**), `hasGold = false`, `isAlive = true`.
- Movement is orthogonal, one cell at a time, via arrow keys (`AxisDirection`: North/South/East/West).
  There is no diagonal movement and no notion of facing/rotation — moving in any direction is
  instantaneous regardless of current heading.
- On each move attempt (`movePlayer`):
  1. If there's no adjacent cell in that direction (edge of board / wall), the move is a no-op
     (returns `null`, player doesn't move, previous log lines are cleared without new lines added —
     effectively a silent "you can't go that way").
     - Note: `ConsoleMessages.wallAhead` exists but is **never actually triggered** in
       `movePlayer`/`BoardComponent` — dead code / unused message. Worth deciding whether the
       modernized version should surface this message or keep silent blocking.
  2. If the destination has the Wumpus → player dies (`isAlive = false`, `diedReason` =
     "Ves al Wumpus cara a cara y recibes un golpe con su garrote"). Board shows a "HAS MUERTO" modal.
  3. Else if the destination is a pit → player dies (`diedReason` = "Has caído en el pozo").
  4. Else (survives): breeze/stink/gold/empty-cell messages are appended (not mutually exclusive —
     a cell can log breeze AND stink AND gold in the same step if it has multiple flags).
     - Breeze → "Sientes una leve brisa" (`class: 'breeze'`).
     - Stink → "Sientes un hedor muy intenso" (`class: 'stink'`).
     - Gold → "Has encontrado el oro! Escapa!" (`class: 'gold'`), sets `player.hasGold = true`, and
       the gold flag is cleared from the cell (can't be picked up twice).
     - If destination is the escape cell AND player already has gold → `wonGame()` sets
       `player.escaped = true` (win condition). Gold flag cleared again (redundant no-op if already
       false).
     - If none of the above applied, log "No hay nada por aquí..." (empty cell).
  5. Player position updates (`hasPlayer` toggled off old cell, on for new cell).
- **Win condition**: standing on the escape cell while carrying gold.
- **Death conditions**: stepping onto the Wumpus cell or a pit cell. There is no "the Wumpus moves"
  mechanic — the Wumpus is static.

## 4. Shooting (`PlayerService.shootArrow` / `checkArrowColission`)

- The player toggles between "walk mode" and "shoot mode" via a UI button (`isWalking` boolean in
  `BoardComponent`); the same arrow keys either move or shoot depending on mode.
- Shooting decrements `arrows` by 1 (checked client-side in `BoardComponent.shootArrow`; if 0 arrows
  remain, it overwrites the first log line with a "no more arrows" message instead of calling the
  service — note this **mutates `board.log[0]` directly** and assumes `log` is non-empty, which is
  fragile).
- The arrow travels in a straight line, cell by cell, via recursion (`checkArrowColission`):
  - Hits the Wumpus → Wumpus is killed (`isWumpus = false`), and its stink is removed from all 4
    orthogonal neighbors (regardless of whether other pits/Wumpi also contributed the stink — no
    reference counting bug, but there's only ever one Wumpus).
  - Hits a wall (`isWall(cell.wall)`) → arrow stops, message "arrow hit wall" (though the two
    `messagesService.set` calls for `arrowHitWall`/`arrowHitWumpus` in `messages.service.ts` are
    registered twice, second one silently overwriting the first with a slightly different string —
    net effect only the second string is ever shown).
  - Otherwise (empty cell) → continues recursively to the next cell in that direction, with **no pit
    interaction** — pits do not stop or affect arrows.
  - If the arrow exits the board without hitting anything, `cell` becomes `null` and the recursion
    returns the default "hit wall" message (edge case: arrow leaving open board edge is reported the
    same as hitting an interior wall).
- Arrows do not consume the player's turn/position and cannot kill the player.

## 5. Configuration Screen (`ConfigurationScreenComponent`)

- Reactive form with 4 numeric fields: `colsX`, `colsY`, `pits`, `arrows` (defaults 8, 8, 1, 1).
- No min/max validation in the form or template — a user could enter 0 or negative columns/pits/
  arrows, or an enormous grid, and nothing currently guards against it.
- On submit, settings are persisted to `localStorage` (`StorageService`, key `game-settings`, raw
  `JSON.stringify`) and the router navigates to `/game`.
- No persistence across "pits/arrows must be <= available cells" — a large `pits` value relative to
  a small board could exhaust available cells; `addPit`'s `Math.floor(Math.random() * availableCells.length)`
  would then throw/behave oddly on an empty `availableCells` array (not currently guarded).

## 6. Board / Cell Rendering (`BoardComponent`, `CellComponent`)

- Board renders as nested `*ngFor` rows/cols of `app-cell`, using Bootstrap layout classes
  (`container-fluid`), FontAwesome icons, and `ng-bootstrap` for a modal + tooltip.
- `CellComponent` manually mutates `nativeElement.className` in `ngAfterViewInit` to add wall/escape
  CSS classes — not idiomatic Angular (no `[ngClass]`/host bindings), and only runs once (doesn't
  react to cell changes after first render, though wall/escape flags never change post-generation so
  this happens to work).
- Sprites: `hunter.png` (player), `wumpus.png`, `gold.jpg`, `breeze.jpg`, `stink.png`,
  `stinkAndBreeze.png` — static images in `src/assets/images`, referenced from `cell.component.html`
  (not fully inspected here, but represents the current "art").
- All player-facing copy is in **Spanish**, hardcoded in `MessagesService` and the templates (no
  i18n abstraction beyond Angular's unused `@angular/localize` dependency).
- End-of-game states use a single shared `ng-bootstrap` modal (`content` template) with "Jugar de
  nuevo" (play again) / "Cambiar la configuración" (change settings) actions, driven by
  `modalTitle`/`modalMessage` strings set from `BoardComponent`.

## 7. Known Rough Edges (candidates for the modernization spec to explicitly accept or fix)

1. `ConsoleMessages.wallAhead` message is defined but unreachable — moving into a wall/edge is silent.
2. `arrowHitWall` and `arrowHitWumpus` messages are each registered twice in `MessagesService` with
   slightly different Spanish text; only the last registration wins.
3. No input validation on the configuration form (grid size, pit/arrow counts can be zero, negative,
   or larger than the board can support).
4. `BoardComponent.shootArrow` directly mutates `board.log[0].message`, assuming the log array is
   non-empty — a latent bug if `log` were ever empty at that point.
5. `CellComponent` mutates the DOM manually instead of using Angular bindings.
6. Uses `NgModules` + `ng-bootstrap` + `jquery` + FontAwesome (transitive) — none of these are
   required by modern Angular (standalone components, no jQuery dependency needed).
7. Game state (`Board`) lives entirely in `BoardComponent` fields, not in a shared reactive store —
   fine at this scale, but worth an explicit decision for the rewrite (services + signals vs. a
   state library).
8. All copy is hardcoded Spanish strings; no localization layer.
9. `Player.name` exists on the model but is never surfaced in any UI or form.

## 8. Explicit Rules Carried Over From README

- Pits cannot block the player from the golden path.
- Pits cannot be on an escape cell.
- Pits cannot be on the golden cell.
- Pits cannot be on the Wumpus cell.
- Escape cell must be on a wall.

These five rules are non-negotiable invariants of the *current* design and are treated as the
default baseline for "gameplay rules to preserve" in `spec.md`, unless a user story explicitly
proposes changing one of them.
