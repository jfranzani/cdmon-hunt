# Feature Specification: Angular Modernization of Hunt the Wumpus

**Feature Branch**: `001-angular-modernization`

**Created**: 2026-07-27

**Status**: Draft

**Input**: User description: "Modernize Hunt the Wumpus from Angular 10 to the latest Angular,
improving code quality, graphics, and gameplay, based on the original assignment brief
(`game-rules.md`), while remaining open to further gameplay improvements."

**Rule sources**: `specs/001-angular-modernization/game-rules.md` is the **authoritative** source of
truth for gameplay rules (the original assignment brief). `specs/001-angular-modernization/
legacy-baseline.md` documents what the shipped Angular 10 code actually does, and is used where it
matches the brief or where a requirement below explicitly chooses to preserve a legacy behavior.
Every requirement below states which source it follows and whether it preserves, changes, or adds to
that source's behavior.

## Clarifications

### Session 2026-07-27

- Q: Should the end-of-round modal (win/death/exit-without-gold) show a run summary (moves taken,
  arrows used)? → A: Yes — include a lightweight summary (moves/turns taken, arrows used); it's
  nearly free given the state is already tracked, and gives the modal a "beat your last run" hook
  that fits a turn-based puzzle game. No broader scoring/leaderboard system.
- Q: Should the configuration screen offer named difficulty presets (Easy/Normal/Hard) in addition to
  free-form numeric fields? → A: No, not for this pass — free-form numeric config plus the FR-011
  validation already lets the player dial difficulty (bigger board + more pits = harder); presets
  would add UI/state complexity without much payoff for a solo project. Revisit later if wanted.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Play the canonical game on a modern Angular foundation (Priority: P1)

As a player, I want to play "Hunt the Wumpus" exactly as the original assignment brief describes it —
a hunter with a facing direction who can advance, turn, shoot an arrow in the direction they're
facing, and exit the cave from the starting cell — on a rebuilt, modern Angular codebase with a
minimal, reliable button-driven interface, so the game is a complete, correct implementation of the
brief and a clean base for future improvements.

**Why this priority**: This is the migration MVP and the actual pass/fail bar for the assignment.
Nothing else in this spec is buildable or safely testable until the engine and core loop exist on the
new stack. A correct implementation is independently verifiable against `game-rules.md` before any
extra visual or gameplay work begins.

**Independent Test**: Configure a board (grid size, pit count, arrow count), play a full round using
only the on-screen buttons (turn, advance, shoot, exit), and confirm every perception and outcome
matches `game-rules.md` §2–§5. Deliverable is playable end-to-end without any P2/P3 work.

**Acceptance Scenarios**:

1. **Given** a new game with default settings (8×8, 1 pit, 1 arrow), **When** the board is
   generated, **Then** the escape cell is on a wall, gold and Wumpus occupy distinct non-escape
   cells, a clear (unobstructed) path exists from escape to gold, and no pit occupies the escape
   cell, the gold cell, the Wumpus cell, or any cell on that clear path. *(`game-rules.md` §5 +
   `legacy-baseline.md` §2 — preserved.)*
2. **Given** the hunter is facing any direction, **When** the player chooses "turn left" or "turn
   right", **Then** the hunter's facing rotates 90° accordingly, the hunter's position does not
   change, and no arrow/turn count is consumed. *(`game-rules.md` §3b — new; the legacy code has no
   facing/turning concept at all.)*
3. **Given** the hunter is facing a direction with an open cell ahead, **When** the player chooses
   "advance", **Then** the hunter moves into that cell and perceives, as applicable, stench (Wumpus
   adjacent), breeze (pit adjacent), and/or glimmer (standing on the gold cell). *(`game-rules.md`
   §2.2–§2.4 — preserved from `legacy-baseline.md` §3, now relative to facing instead of an
   arbitrary chosen direction.)*
4. **Given** the hunter is facing a wall or the board edge, **When** the player chooses "advance",
   **Then** the hunter perceives the impact ("choque"), does not move, and no other perception is
   reported for that action. *(`game-rules.md` §2.5 — new requirement; fixes the legacy code's dead
   `wallAhead` message, see `legacy-baseline.md` §7.1.)*
5. **Given** the cell the hunter is about to advance into holds the Wumpus or a pit, **When** the
   player chooses "advance", **Then** the hunter dies with a message identifying the cause, and an
   end-of-round modal offers "play again" / "change settings". *(`game-rules.md` §4 — preserved.)*
6. **Given** the hunter has at least one arrow, **When** the player chooses "shoot", **Then** an
   arrow travels in the hunter's current facing direction until it hits the Wumpus (the Wumpus dies,
   its stench clears from neighboring cells, and the hunter perceives its scream/"grito") or a wall
   (no further effect), and the arrow count decreases by one. *(`game-rules.md` §2.6, §3c —
   preserved from `legacy-baseline.md` §4, now fired in the facing direction instead of a separately
   chosen one.)*
7. **Given** the hunter has zero arrows, **When** the player chooses "shoot", **Then** they are told
   they have no arrows left and no arrow is consumed. *(Preserved.)*
8. **Given** the hunter is standing on the escape/starting cell, **When** the player chooses "exit",
   **Then** the round ends: if the hunter is carrying the gold, it's a win; if not, the round ends
   without a win (see Assumptions for the exact framing). *(`game-rules.md` §3d, §4 — new; the legacy
   code has no explicit exit action, it wins automatically the instant the player steps onto the
   escape cell with gold.)*
9. **Given** the hunter is anywhere other than the escape/starting cell, **When** the player looks at
   the "exit" control, **Then** it is visibly unavailable/disabled, consistent with "Exit (if on the
   exit cell)". *(`game-rules.md` §3d — new.)*
10. **Given** the play screen, **When** it renders, **Then** it shows one clearly labeled button per
    command (advance, turn left, turn right, shoot, exit) and a text/log output area showing the
    hunter's perceptions after each action, per the required minimal interface. *(`game-rules.md`
    §7 — new; the legacy UI has no turn/exit controls and used keyboard-only input.)*
11. **Given** the configuration screen, **When** the player submits grid size / pit count / arrow
    count, **Then** the settings persist across a page reload and are used for the next game.
    *(`game-rules.md` §5 — preserved from `legacy-baseline.md` §5.)*

---

### User Story 2 - Upgraded visual presentation (Priority: P2)

As a player, I want the game to look and feel like a modern, polished game — clearer board rendering,
better sprites/animations, responsive layout, and richer feedback for events (breeze, stench,
glimmer, impact, scream, death, victory) — instead of the original's plain Bootstrap grid and
manually-mutated DOM classes, while the required minimal button + text-output interface from User
Story 1 keeps working underneath it.

**Why this priority**: Visual quality is explicitly requested but depends on the P1 engine existing
first; it does not change game rules, so it can be developed and reviewed independently once P1 is
playable. `game-rules.md` §7 explicitly frames the button/text-box interface as a floor, not a
ceiling — richer visuals are allowed and encouraged as long as that floor still works.

**Independent Test**: With the P1 engine in place, enhance rendering only (no rule changes) and
verify the same acceptance scenarios from User Story 1 still pass, now with the new visuals — i.e.
this story is testable purely by visual/UX review plus a full regression of Story 1's scenarios.

**Acceptance Scenarios**:

1. **Given** any board state, **When** it renders, **Then** cell walls, escape cell, hunter position
   and facing direction, and (once discovered by the player) breeze/stench/glimmer indicators are
   rendered via Angular template bindings (`[class]`/`[ngClass]`/signals), not manual `nativeElement`
   mutation.
2. **Given** the hunter turns left or right, **When** the action resolves, **Then** the hunter's
   marker visibly rotates to the new facing direction rather than snapping instantly.
3. **Given** the hunter advances into an open cell, **When** the action resolves, **Then** the hunter
   visibly moves/slides into the new cell rather than teleporting.
4. **Given** the hunter advances into a wall or the board edge ("choque"), **When** the action
   resolves, **Then** the UI plays a short, visibly distinct bump/recoil animation and the hunter does
   not move.
5. **Given** the hunter shoots an arrow, **When** the action resolves, **Then** the arrow is animated
   traveling cell-by-cell in the facing direction before resolving into a wall-hit or Wumpus-hit
   (scream) outcome — the animation's length reflects the actual distance traveled, not a fixed
   duration.
6. **Given** the hunter dies (Wumpus or pit) or the round ends via "exit" (with or without the gold),
   **When** the end-of-round state is reached, **Then** each of the three outcomes (death, win,
   exited-without-gold) has its own visibly distinct animated treatment before or alongside the
   end-of-round modal.
7. **Given** the player navigates between the configuration screen and the play screen, **When** that
   navigation happens, **Then** the transition is animated using the View Transitions API where the
   browser supports it, and degrades to an instant (non-animated) screen swap where it doesn't —
   never a broken or blank intermediate state.
8. **Given** the game is opened on a narrow (mobile-width) viewport, **When** the board renders,
   **Then** the layout remains usable without horizontal scrolling or overlapping controls.
9. **Given** the existing sprite set (`hunter.png`, `wumpus.png`, `gold.jpg`, `breeze.jpg`,
   `stink.png`, `stinkAndBreeze.png`), **When** the new UI ships, **Then** these are replaced or
   visibly upgraded (not reused as-is), and the hunter's sprite/marker visibly reflects its current
   facing direction — exact art direction is a `plan.md`/implementation decision, not fixed by this
   spec.

---

### User Story 3 - Quality-of-life improvements beyond the brief (Priority: P3)

As a player, I want a handful of gameplay improvements that go beyond what the original brief
requires, without breaking the core Hunt-the-Wumpus rules from User Story 1.

**Why this priority**: These are enhancements on top of a working, correct, good-looking game; each
one is independently valuable and independently shippable, but none are required by `game-rules.md`.

**Independent Test**: Each sub-item below can be verified in isolation by exercising the specific
scenario and confirming it does not regress User Story 1's acceptance scenarios.

**Acceptance Scenarios**:

1. **Given** the configuration form, **When** the player enters an invalid value (grid dimension,
   pit count, or arrow count that is zero, negative, non-numeric, or large enough that pits cannot
   all be legally placed), **Then** the form shows a validation error and does not navigate to the
   game screen. *(Beyond the brief; fixes `legacy-baseline.md` §7.3.)*
2. **Given** a completed, lost, or exited-without-gold round, **When** the end-of-round modal
   appears, **Then** it also shows a basic run summary: moves/turns taken and arrows used. *(Beyond
   the brief; resolved 2026-07-27 — see Clarifications.)*

**Explicitly deferred**: Named difficulty presets (e.g. Easy/Normal/Hard) were considered and
deliberately deferred — see Clarifications. Free-form numeric configuration (already required by
FR-007) plus its validation (FR-011) is the only configuration mechanism in this pass.

### Edge Cases

- What happens when the configured grid is too small to fit the escape cell, gold, Wumpus, the clean
  path, and all requested pits without contradiction (e.g. 2×2 grid, 5 pits)? Baseline has no guard
  for this (see `legacy-baseline.md` §5); this spec requires it be handled as a validation error
  (User Story 3, Scenario 1) rather than a runtime exception.
- What happens if the player rapidly repeats a command (turn/advance/shoot/exit) faster than the UI
  can process state updates? Behavior MUST remain deterministic: one command in, one state update and
  one perception report out — no double-turns, no dropped death/win/exit detection.
- Does turning consume an arrow, a move, or otherwise cost the player anything? No — per
  `game-rules.md` §3b, turning only changes facing; it is free and instantaneous.
- What happens if the player presses "shoot" while facing a direction where a pit lies between the
  hunter and the Wumpus/wall? Per `game-rules.md` §3c and `legacy-baseline.md` §4, arrows are
  unaffected by pits — the arrow passes over/through pit cells without interacting with them.
- What happens when the player resizes the browser mid-game? Board and facing state MUST NOT reset or
  corrupt.
- What happens when `localStorage` is unavailable (private browsing, storage disabled)? The game
  MUST fall back to sensible in-memory defaults rather than crashing the configuration screen.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The system MUST generate boards using the same rules as `legacy-baseline.md` §2 and
  `game-rules.md` §5: configurable grid size, escape cell always on a wall, gold and Wumpus on
  distinct available cells, a guaranteed clear path from escape to gold, and pits only on cells that
  are not the escape cell, gold cell, Wumpus cell, or clear-path cell. *(Preserved; NON-NEGOTIABLE per
  Constitution Principle I.)*
- **FR-002**: The hunter MUST have a facing direction (N/E/S/W). "Turn left" and "turn right" MUST
  rotate that facing 90° without changing position or consuming any resource. "Advance" MUST move the
  hunter one cell in the current facing direction if that cell exists and is not blocked by a wall;
  otherwise it MUST leave the hunter in place. *(`game-rules.md` §3a–§3b — new movement model,
  replacing the legacy code's free 4-direction movement; see `game-rules.md` §6.1.)*
- **FR-003**: Advancing onto the Wumpus's cell or a pit's cell MUST kill the hunter, ending the round
  with a message identifying the cause. *(`game-rules.md` §4 — preserved from `legacy-baseline.md`
  §3.)*
- **FR-004**: "Shoot" MUST fire an arrow in the hunter's current facing direction; it travels until it
  hits the Wumpus (killing it, clearing stench from its neighbors, and reporting the scream
  perception) or a wall (no effect beyond consuming the arrow); pits do not affect arrow travel.
  Shooting with zero arrows MUST report that no arrows remain and MUST NOT consume an arrow.
  *(`game-rules.md` §2.6, §3c — preserved from `legacy-baseline.md` §4, now direction = facing
  instead of a separately chosen direction; see `game-rules.md` §6.3.)*
- **FR-005**: "Exit" MUST be actionable only while the hunter occupies the escape/starting cell (the
  control MUST be visibly disabled elsewhere). Using it MUST end the round: a win if the hunter is
  carrying the gold, otherwise a non-winning end-of-round outcome (see Assumptions). *(`game-rules.md`
  §3d, §4 — new; the legacy code has no explicit exit action, see `game-rules.md` §6.2.)*
- **FR-006**: The system MUST report exactly one, correct, unambiguous perception message for each of
  the six perception types in `game-rules.md` §2: Wumpus-in-cell (death), stench (Wumpus adjacent),
  breeze (pit adjacent), glimmer (on the gold cell), impact/"choque" (advancing into a wall or the
  board edge), and scream/"grito" (killing the Wumpus). *(New/fixed: folds in the previously-dead
  `wallAhead` message and the duplicated arrow-hit-wall/arrow-hit-Wumpus message registrations from
  `legacy-baseline.md` §7.1–§7.2, now required outright rather than optional cleanup.)*
- **FR-007**: The system MUST let the player configure the board size, pit count, and arrow count
  before a game, and persist that configuration for future sessions. *(`game-rules.md` §5 — preserved
  from `legacy-baseline.md` §5, with the addition of validation — see FR-011.)*
- **FR-008**: The play screen's primary interface MUST be one clearly labeled button per command
  (advance, turn left, turn right, shoot, exit) plus a text/log output area for perceptions — the
  minimal interface `game-rules.md` §7 requires. The application MUST have exactly two screens: start/
  configuration and play. Keyboard shortcuts MAY be layered on top as an enhancement but MUST NOT be
  required to play. *(`game-rules.md` §7 — new; see Constitution Principle VI.)*
- **FR-009**: The system MUST be built with the latest stable Angular release, standalone components,
  and signals-based state, with no `NgModule`-based feature modules and no jQuery dependency.
  *(New — Constitution Principle II.)*
- **FR-010**: The system MUST render all cell and hunter state (walls, escape, hunter position and
  facing, discovered breeze/stench/glimmer indicators) through Angular template bindings, not direct
  DOM manipulation. *(New — fixes `legacy-baseline.md` §7.5.)*
- **FR-011**: The system MUST validate configuration input (grid dimensions, pit count, arrow count)
  and reject configurations that are non-positive or that make legal pit placement impossible, with a
  visible error instead of a silent failure or runtime exception. *(Beyond the brief; fixes
  `legacy-baseline.md` §7.3 and the corresponding edge case above; User Story 3.)*
- **FR-012**: The system MUST present an upgraded visual treatment (art/layout) for the board and
  hunter (including facing direction), replacing the original Bootstrap-grid-plus-static-image
  presentation, and MUST remain usable on mobile-width viewports, without removing the FR-008 button/
  text-output floor. *(New — User Story 2.)*
- **FR-012a**: The system MUST animate turn, advance, wall-bump ("choque"), shoot/arrow-travel, and
  each end-of-round outcome (death, win, exit-without-gold) as visibly distinct effects, using modern
  native web-platform animation (CSS transitions/keyframes, the Web Animations API, and the View
  Transitions API for screen-to-screen navigation with a non-animated fallback where unsupported) —
  not `@angular/animations` by default. *(New — User Story 2; see `research.md` §7.)*
- **FR-013**: The system MUST have unit tests covering, at minimum: the board-generation invariants
  in `legacy-baseline.md` §8, the facing/turn/advance state machine (FR-002), the shoot-in-facing-
  direction collision logic (FR-004), and the exit/win/non-win outcome (FR-005) — independent of any
  UI framework changes. *(`game-rules.md` §7 "unit tests for all game components" — new, broadens the
  previous board-generation-only test requirement; Constitution Principle IV.)*
- **FR-014**: The end-of-round modal (win, death, or exit-without-gold) MUST show a run summary:
  the number of moves/turns taken and the number of arrows used during that round. *(Beyond the
  brief; User Story 3; resolved 2026-07-27 — see Clarifications.)*

### Key Entities

- **Board**: The grid of cells for one game round, plus the current hunter state, the running
  perception/event log, and counters for the run summary — moves/turns taken and arrows used
  (FR-014). Generated fresh per round from a `GameConfiguration`.
- **Cell**: One grid position — its walls, and whether it is the escape cell, holds gold, holds the
  Wumpus, holds a pit, is on the guaranteed clear path, currently has breeze/stench, and currently
  holds the hunter.
- **GameConfiguration**: Player-chosen board size (n×n, or width/height — see Assumptions), pit count,
  and arrow count; persisted across sessions.
- **Hunter** (formerly "Player"): Position (via the Cell it occupies), **facing direction** (N/E/S/W —
  new), remaining arrows, whether it is carrying gold, whether it is alive, and the outcome of its
  last "exit" if any (win / exited without gold / still in progress).
- **GameEvent / Perception Log Entry**: A user-facing message describing the outcome of the last
  action — one of the six `game-rules.md` §2 perceptions, a death, a win, or a non-winning exit — used
  to drive both the required text output (FR-008) and (per User Story 2) visual/animated feedback.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: A player can complete a full game (configure → turn/advance/shoot as needed → win, die,
  or exit without the gold → reset) using only the required on-screen buttons, with zero console
  errors, on the latest Angular stack.
- **SC-002**: 100% of the board-generation invariants listed in `legacy-baseline.md` §8, and all six
  perception types in `game-rules.md` §2, are covered by automated unit tests and pass on every
  commit.
- **SC-003**: All divergences from `game-rules.md` listed in its §6 (facing/turning, exit action,
  shoot-in-facing-direction, the wall-bump/"choque" perception) are implemented and each has a
  corresponding test or manual verification step.
- **SC-004**: The game is playable and legible on both a desktop viewport (≥1280px wide) and a
  mobile-width viewport (~375px wide) without horizontal scrolling.
- **SC-005**: `ng build` produces zero TypeScript errors under strict mode and zero use of
  `NgModule`-based feature modules.
- **SC-006**: Each of the six actions/outcomes in FR-012a (turn, advance, wall-bump, shoot, and the
  three end-of-round outcomes) has a distinguishable animation, verified in a browser that supports
  the View Transitions API and in one that doesn't (or with it feature-detected off), confirming the
  fallback never breaks or blanks the screen.

## Assumptions

- This is a solo hobby project with one active player/developer; there is no multiplayer, backend,
  or account system in scope, now or implied for later phases. `game-rules.md` §7 explicitly requires
  a front-end-only SPA with no backend interaction — all game logic runs client-side.
- **Exiting without the gold**: `game-rules.md` states the objective ("find the gold and return to
  the exit... alive") but does not spell out what happens if the hunter uses "exit" while on the
  escape cell without the gold. This spec's ruling: the round ends immediately (same as a win, in that
  it stops play and offers "play again"/"change settings"), but it is reported and treated as a
  non-winning outcome, distinct from both "win" and "died." This is the closest reading of the brief's
  "Salir (si se encuentra en la casilla de salida)" as an unconditional action available on that cell.
- **Initial facing direction**: `game-rules.md` does not specify which way the hunter faces at the
  start of a round. This spec's ruling: face away from the nearest board edge/wall at the escape cell
  (i.e., facing into the board) so the first "advance" is never an immediate wall-bump; if ambiguous
  (e.g. a corner), default to a fixed, documented direction (e.g. North, or clockwise-first from the
  wall the escape cell sits on).
- **Board shape**: `game-rules.md` §5 specifies a square n×n board. This spec keeps the legacy code's
  independently configurable width/height as a superset (not a contradiction), defaulting both to the
  same value in the configuration screen so the common case is square.
- "Latest Angular" means the latest stable major version available at the time `/speckit-plan` is
  executed for this feature; the exact version is pinned in `plan.md`, not in this spec.
- The existing Spanish-language player-facing copy (including the Spanish perception terms in
  `game-rules.md` §2) is retained as-is for User Story 1 (parity); any localization/i18n layer is out
  of scope unless a future spec adds it.
- User Story 3's scoring/summary and difficulty-preset questions were resolved in the Clarifications
  section above (summary: in scope, FR-014; presets: explicitly deferred); neither was ever a blocker
  for User Story 1 or 2.
- Existing sprite assets (`src/assets/images/*`) are treated as placeholders to be replaced or
  substantially reworked under User Story 2, not as fixed final art; the hunter sprite/marker must
  additionally communicate facing direction, which the legacy assets do not.
- No specific performance/frame-rate target is set beyond "responsive, no visible jank on a modern
  laptop/phone" — this is a turn-based grid game, not a real-time action game.
