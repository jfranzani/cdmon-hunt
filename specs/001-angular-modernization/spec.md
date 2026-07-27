# Feature Specification: Angular Modernization of Hunt the Wumpus

**Feature Branch**: `001-angular-modernization`

**Created**: 2026-07-27

**Status**: Draft

**Input**: User description: "Modernize Hunt the Wumpus from Angular 10 to the latest Angular,
improving code quality, graphics, and gameplay while preserving core game rules"

**Baseline reference**: `specs/001-angular-modernization/legacy-baseline.md` documents the exact
behavior of the Angular 10 implementation this feature modernizes. Every requirement below states
whether it preserves or changes a rule from that baseline.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Play the classic game on a modern Angular foundation (Priority: P1)

As a returning player, I want to play the exact same "Hunt the Wumpus" game I remember — same board
generation rules, same win/lose conditions, same keyboard controls — but running on a rebuilt, modern
Angular codebase, so the game keeps working long-term and is a clean base for future improvements.

**Why this priority**: This is the migration MVP. Nothing else in this spec is buildable or safely
testable until the engine and core loop exist on the new stack. It also de-risks the project: a
faithful port is independently verifiable against `legacy-baseline.md` before any new gameplay or
visual work begins.

**Independent Test**: Configure a board (grid size, pit count, arrow count), play a full round using
only the keyboard (move, shoot, die, win, reset), and confirm every outcome matches
`legacy-baseline.md` §2–§6. Deliverable is playable end-to-end without any P2/P3 work.

**Acceptance Scenarios**:

1. **Given** a new game with default settings (8×8, 1 pit, 1 arrow), **When** the board is
   generated, **Then** the escape cell is on a wall, gold and Wumpus occupy distinct non-escape
   cells, a clear (unobstructed) path exists from escape to gold, and no pit occupies the escape
   cell, the gold cell, the Wumpus cell, or any cell on that clear path.
2. **Given** the player is adjacent to the Wumpus or a pit, **When** they move onto that cell,
   **Then** the player dies with the corresponding legacy message and an end-game modal offering
   "play again" / "change settings".
3. **Given** the player is standing on the gold cell, **When** they move onto it, **Then** they pick
   up the gold (message shown, cell's gold flag cleared) and can no longer pick it up again.
4. **Given** the player is carrying the gold, **When** they move onto the escape cell, **Then** they
   win the game and see a win modal.
5. **Given** the player is in shoot mode with at least one arrow, **When** they press a direction
   key, **Then** an arrow travels in a straight line until it hits the Wumpus (killing it and
   clearing stink from its neighbors) or a wall/board edge, and the arrow count decreases by one.
6. **Given** the player has zero arrows, **When** they attempt to shoot, **Then** they are told they
   have no arrows left and no arrow is consumed.
7. **Given** the configuration screen, **When** the player submits grid size / pit count / arrow
   count, **Then** the settings persist across a page reload and are used for the next game.

---

### User Story 2 - Upgraded visual presentation (Priority: P2)

As a player, I want the game to look and feel like a modern, polished game — clearer board rendering,
better sprites/animations, responsive layout, and richer feedback for events (breeze, stink, gold,
death, victory) — instead of the original's plain Bootstrap grid and manually-mutated DOM classes.

**Why this priority**: Visual quality is explicitly requested but depends on the P1 engine existing
first; it does not change game rules, so it can be developed and reviewed independently once P1 is
playable.

**Independent Test**: With the P1 engine in place, replace rendering only (no rule changes) and
verify the same acceptance scenarios from User Story 1 still pass, now with the new visuals — i.e.
this story is testable purely by visual/UX review plus a full regression of Story 1's scenarios.

**Acceptance Scenarios**:

1. **Given** any board state, **When** it renders, **Then** cell walls, escape cell, player position,
   and (once discovered by the player) breeze/stink/gold indicators are rendered via Angular
   template bindings (`[class]`/`[ngClass]`/signals), not manual `nativeElement` mutation.
2. **Given** a move, shot, death, or win event, **When** it occurs, **Then** the UI provides a
   visibly distinct transition/animation for that event (exact treatment decided in `plan.md`).
3. **Given** the game is opened on a narrow (mobile-width) viewport, **When** the board renders,
   **Then** the layout remains usable without horizontal scrolling or overlapping controls.
4. **Given** the existing sprite set (`hunter.png`, `wumpus.png`, `gold.jpg`, `breeze.jpg`,
   `stink.png`, `stinkAndBreeze.png`), **When** the new UI ships, **Then** these are replaced or
   visibly upgraded (not reused as-is) — exact art direction is a `plan.md`/implementation decision,
   not fixed by this spec.

---

### User Story 3 - Quality-of-life gameplay improvements (Priority: P3)

As a player, I want a handful of gameplay improvements that fix known rough edges from the original
(see `legacy-baseline.md` §7) and add a bit more depth, without breaking the core Hunt-the-Wumpus
rules from User Story 1.

**Why this priority**: These are enhancements on top of a working, good-looking game; each one is
independently valuable and independently shippable, but none are required for the game to be
"modernized and playable."

**Independent Test**: Each sub-item below can be verified in isolation by exercising the specific
scenario and confirming it does not regress User Story 1's acceptance scenarios.

**Acceptance Scenarios**:

1. **Given** the configuration form, **When** the player enters an invalid value (grid dimension,
   pit count, or arrow count that is zero, negative, non-numeric, or large enough that pits cannot
   all be legally placed), **Then** the form shows a validation error and does not navigate to the
   game screen. *(Fixes baseline §7.3.)*
2. **Given** the player moves into a wall or off the edge of the board, **When** the move is
   blocked, **Then** the UI shows an explicit "you can't go that way" message instead of silently
   doing nothing. *(Fixes baseline §7.1 — the unreachable `wallAhead` message.)*
3. **Given** the arrow-hits-wall and arrow-hits-Wumpus messages, **When** they are shown, **Then**
   each has exactly one, correct, unambiguous message string. *(Fixes baseline §7.2 — the duplicate
   message-registration bug.)*
4. **Given** a completed or lost game, **When** the end-game modal appears, **Then** it also shows a
   basic run summary (e.g. moves taken, arrows used) [NEEDS CLARIFICATION: is a scoring/summary
   system in scope for the first modernization pass, or a later feature?].
5. **Given** repeated play, **When** the player wants a different challenge, **Then** the settings
   support both the original numeric configuration and a small set of named difficulty presets
   (e.g. Easy/Normal/Hard mapping to grid size + pit count) [NEEDS CLARIFICATION: are difficulty
   presets desired, or is free-form numeric configuration sufficient?].

### Edge Cases

- What happens when the configured grid is too small to fit the escape cell, gold, Wumpus, the clean
  path, and all requested pits without contradiction (e.g. 2×2 grid, 5 pits)? Baseline has no guard
  for this (see `legacy-baseline.md` §5); this spec requires it be handled as a validation error
  (User Story 3, Scenario 1) rather than a runtime exception.
- What happens if the player holds down / rapidly repeats a movement key faster than the UI can
  process state updates? Behavior MUST remain deterministic (no double-moves from a single
  keypress, no dropped death/win detection).
- What happens when the player resizes the browser mid-game? Board state MUST NOT reset or corrupt.
- What happens when `localStorage` is unavailable (private browsing, storage disabled)? The game
  MUST fall back to sensible in-memory defaults rather than crashing the configuration screen.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The system MUST generate boards using the same rules as `legacy-baseline.md` §2:
  configurable grid size, escape cell always on a wall, gold and Wumpus on distinct available cells,
  a guaranteed clear path from escape to gold, and pits only on cells that are not the escape cell,
  gold cell, Wumpus cell, or clear-path cell. *(Preserves baseline; NON-NEGOTIABLE per Constitution
  Principle I.)*
- **FR-002**: The system MUST implement player movement, death (Wumpus/pit), gold pickup, and the
  win condition (return to escape cell while carrying gold) exactly as in `legacy-baseline.md` §3.
  *(Preserved.)*
- **FR-003**: The system MUST implement arrow shooting exactly as in `legacy-baseline.md` §4 (straight
  line travel, kills Wumpus and clears its stink, stops at walls, does not interact with pits, limited
  by arrow count). *(Preserved.)*
- **FR-004**: The system MUST let the player configure grid size, pit count, and arrow count before a
  game, and persist that configuration for future sessions. *(Preserved from baseline §5, with the
  addition of validation — see FR-008.)*
- **FR-005**: The system MUST support full keyboard play (movement + shooting + mode toggle) as the
  primary input method. *(Preserved — Constitution Principle VI.)*
- **FR-006**: The system MUST be built with the latest stable Angular release, standalone components,
  and signals-based state, with no `NgModule`-based feature modules and no jQuery dependency.
  *(New — Constitution Principle II.)*
- **FR-007**: The system MUST render all cell state (walls, escape, player, discovered breeze/stink/
  gold indicators) through Angular template bindings, not direct DOM manipulation. *(New — fixes
  baseline §7.5.)*
- **FR-008**: The system MUST validate configuration input (grid dimensions, pit count, arrow count)
  and reject configurations that are non-positive or that make legal pit placement impossible, with a
  visible error instead of a silent failure or runtime exception. *(New — fixes baseline §7.3 and the
  edge case above.)*
- **FR-009**: The system MUST show a distinct, correct message when a move is blocked by a wall or
  board edge. *(New — fixes baseline §7.1.)*
- **FR-010**: The system MUST have exactly one correct message for "arrow hit wall" and one for
  "arrow hit Wumpus". *(New — fixes baseline §7.2.)*
- **FR-011**: The system MUST present an upgraded visual treatment (art/animation/layout) for the
  board, player, and game events, replacing the original Bootstrap-grid-plus-static-image
  presentation, and MUST remain usable on mobile-width viewports. *(New — User Story 2.)*
- **FR-012**: The system MUST have unit tests covering the board-generation invariants in
  `legacy-baseline.md` §8 (pit/path/escape-cell rules), independent of any UI framework changes.
  *(New — Constitution Principle IV.)*

### Key Entities

- **Board**: The grid of cells for one game round, plus the current player state and the running
  event log. Generated fresh per round from a `GameConfiguration`.
- **Cell**: One grid position — its walls, and whether it is the escape cell, holds gold, holds the
  Wumpus, holds a pit, is on the guaranteed clear path, currently has breeze/stink, and currently
  holds the player.
- **GameConfiguration**: Player-chosen grid width/height, pit count, and arrow count; persisted
  across sessions.
- **Player**: Position (via the Cell it occupies), remaining arrows, whether it is carrying gold,
  whether it is alive, whether it has escaped (won).
- **GameEvent / Log Entry**: A user-facing message describing the outcome of the last action (move
  result, shot result, death, win), used to drive both text feedback and (per User Story 2) visual/
  animated feedback.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: A player can complete a full game (configure → play → win or die → reset) using only
  the keyboard, with zero console errors, on the latest Angular stack.
- **SC-002**: 100% of the board-generation invariants listed in `legacy-baseline.md` §8 are covered
  by automated unit tests and pass on every commit.
- **SC-003**: All five rough edges listed in `legacy-baseline.md` §7 (items 1–5) are resolved and
  each has a corresponding test or manual verification step.
- **SC-004**: The game is playable and legible on both a desktop viewport (≥1280px wide) and a
  mobile-width viewport (~375px wide) without horizontal scrolling.
- **SC-005**: `ng build` produces zero TypeScript errors under strict mode and zero use of
  `NgModule`-based feature modules.

## Assumptions

- This is a solo hobby project with one active player/developer; there is no multiplayer, backend,
  or account system in scope, now or implied for later phases.
- "Latest Angular" means the latest stable major version available at the time `/speckit-plan` is
  executed for this feature; the exact version is pinned in `plan.md`, not in this spec.
- The existing Spanish-language player-facing copy is retained as-is for User Story 1 (parity); any
  localization/i18n layer is out of scope unless a future spec adds it.
- User Story 3's scoring/summary and difficulty-preset items are marked `NEEDS CLARIFICATION` and
  MUST be resolved (accepted, deferred, or dropped) via `/speckit-clarify` or direct user confirmation
  before `/speckit-plan` treats them as committed scope; they are not blockers for User Story 1 or 2.
- Existing sprite assets (`src/assets/images/*`) are treated as placeholders to be replaced or
  substantially reworked under User Story 2, not as fixed final art.
- No specific performance/frame-rate target is set beyond "responsive, no visible jank on a modern
  laptop/phone" — this is a turn-based grid game, not a real-time action game.
