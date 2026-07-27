# Phase 0 Research: Angular Modernization

Companion to `plan.md`. Each decision resolves a "NEEDS CLARIFICATION"-style unknown before design
starts, per Constitution Principle III (spec-driven delivery) and V (simplicity).

## 1. Target Angular version

- **Decision**: Angular 22 (latest stable on npm as of 2026-07-27; `@angular/core@22.0.8`,
  `@angular/cli@22.0.8`).
- **Rationale**: Constitution Principle II requires the latest stable release; pinning to the exact
  version available today avoids ambiguity in `tasks.md` later. Re-verify with `npm view
  @angular/core version` at implementation time in case a newer patch/minor ships first.
- **Alternatives considered**: Pinning to an older LTS (e.g. Angular 18) for "stability" — rejected,
  the project has no external users/SLA forcing LTS conservatism, and the constitution explicitly
  wants the latest stack.

## 2. Component architecture: standalone vs NgModules

- **Decision**: 100% standalone components/directives/pipes, `provideRouter`/`provideAnimations`-style
  bootstrap in `main.ts`, no `AppModule`/feature `NgModule`s.
- **Rationale**: NgModules are legacy as of Angular 19+ (standalone is the default schematic output);
  Constitution Principle II mandates this explicitly.
- **Alternatives considered**: Keep NgModules for familiarity — rejected, directly conflicts with the
  constitution.

## 3. State management

- **Decision**: Angular **signals** (`signal`, `computed`, `effect`) inside existing-style services
  (`GameService`, `PlayerService`, etc., ported to expose signals instead of plain getters/setters),
  no external state library (NgRx/NGXS).
- **Rationale**: Board/player state is single-user, in-memory, and small; Constitution Principle V
  (simplicity/YAGNI) and the Technology Stack Constraints section rule out a state library unless
  justified. Signals give fine-grained reactivity for the board grid without RxJS ceremony.
- **Alternatives considered**: NgRx — rejected as unjustified complexity for this scale. Keeping
  plain class fields with manual `ChangeDetectorRef.markForCheck()` (closest to the legacy approach)
  — rejected, not idiomatic for "latest Angular."

## 4. UI component library / styling

- **Decision**: Drop `ng-bootstrap` + Bootstrap + jQuery(-adjacent) dependencies. Use CSS Grid for the
  board layout, native `<dialog>`-style overlay markup for the end-game modal, replacing `NgbModal`.
  Component structure/typography/color/spacing is expressed with **Tailwind CSS v4** utility classes
  in templates; component `.scss` files are kept only for what utility classes can't express — the
  `CELL_SIZE_PX`-positioned hunter/arrow overlays and their keyframe animations (see §7). Tailwind's
  design tokens (`@theme` block in `src/styles.css`, a dungeon color palette plus two font families)
  are the single source of truth for the visual language.
- **Rationale**: Constitution explicitly forbids jQuery; `ng-bootstrap`'s own peer dependency chain
  and Bootstrap's utility-class approach add weight not needed for a single-screen game UI, and both
  ship generic component chrome that works against a distinctive visual identity. The initial plan
  (plain hand-written SCSS, no utility framework) held through User Story 1 and the first pass of User
  Story 2, but direct user feedback on the shipped UI ("the ui is awful") made it clear hand-rolled
  SCSS wasn't converging on a polished result fast enough. Tailwind was added as a middle ground: it
  keeps bundle size and dependency surface small (no component runtime, just a build-time utility
  generator) while giving enough utility coverage to iterate quickly on layout/spacing/color without
  writing bespoke SCSS for every element — reserving custom SCSS for the handful of things Tailwind
  can't do (the overlay positioning math, custom keyframes).
- **Alternatives considered**: Keep `ng-bootstrap` (lower migration effort) — rejected because the
  modal/tooltip components are the only things used from it, and User Story 2 wants a distinctive
  visual identity, not generic Bootstrap chrome. Angular Material — rejected, same "generic UI kit"
  concern, larger dependency for a small surface area. Continuing with plain hand-written SCSS only —
  rejected after the "ui is awful" feedback as too slow to iterate with for a single-developer visual
  polish pass. Bootstrap/Material were rejected again at this point for the same reasons as above; a
  utility-first framework (no bundled components) was the fit that didn't reintroduce that risk.

## 5. Icons and fonts

- **Decision**: Emoji glyphs (🏹, 🧭, 💀, etc.) are used for in-game iconography instead of an icon
  library — no `@fortawesome/*` or equivalent dependency. Typography uses two self-hosted variable
  web fonts: Cinzel (headings, `font-display`) and Inter (body text, `font-body`), declared via
  `@font-face` in `src/styles.css` and served from `src/assets/fonts/`, rather than linked from the
  Google Fonts CDN.
- **Rationale**: Emoji are cosmetic and don't affect the Constitution Check or project structure —
  they cover the small, fixed set of perceptions/actions this game needs without a font-icon or SVG
  sprite dependency. Fonts are self-hosted rather than CDN-linked for the same "minimize external
  runtime dependencies" reasoning already applied elsewhere (see §7's native-platform-first stance on
  animation): one less third-party origin the page depends on at runtime, no flash of unstyled text
  waiting on that origin, and no failure mode tied to a network the browser can't reach. Only the
  Latin subset is bundled (sufficient for this app's Spanish copy), and each family resolved to a
  single variable-font file covering every weight the UI uses, so self-hosting added exactly two
  files.
- **Alternatives considered**: `@fortawesome/*` icon font — rejected as unnecessary dependency weight
  for a handful of glyphs emoji already cover natively. Google Fonts `<link>` tags — tried first, but
  dropped after real-browser verification surfaced a connection failure loading fonts.googleapis.com
  in this environment; self-hosting sidesteps that failure mode entirely regardless of its root cause.

## 6. Testing framework

- **Decision**: Keep Karma + Jasmine for unit/component tests (matches `ng test` defaults for the
  targeted Angular version at time of scaffolding); re-evaluate Jest/Vitest only if the Angular CLI's
  own default changes, to avoid fighting the tooling.
- **Rationale**: Constitution allows replacing Karma/Jasmine "if justified" — no functional
  requirement in `spec.md` needs a different test runner, so the default is the simplest choice
  (Principle V).
- **Alternatives considered**: Vitest via `@angular/build:unit-test` — worth revisiting if it becomes
  the Angular CLI default; not adopted preemptively.

## 7. Animation approach (User Story 2)

- **Decision**: Native web-platform animation, layered by how much control each case needs, rather
  than `@angular/animations`:
  1. **CSS transitions/keyframes** (via Angular's native `[class]`/`@if`/`@for` bindings) as the
     default for simple state-driven feedback — turning (rotate the hunter marker), advancing
     (slide into the new cell), wall-bump/"choque" (a short shake/recoil), breeze/stench/glimmer
     reveal (fade/pulse-in), death (a distinct death treatment per cause), win/exit (a distinct
     celebratory/neutral treatment for the two outcomes).
  2. **Web Animations API** (`element.animate()`) where a sequence needs JS-driven control that
     pure CSS can't express cleanly — e.g. an arrow visibly traveling cell-by-cell before resolving
     into a wall-hit or Wumpus-hit/scream outcome, where the number of cells (and therefore the
     animation's length) is only known at runtime.
  3. **View Transitions API** (`document.startViewTransition`), feature-detected with a plain
     (non-animated) fallback when unsupported, for cross-state transitions that CSS alone struggles
     with — the config-screen ↔ play-screen navigation, and swapping in the end-of-round modal.
  `@angular/animations` is not added by default under any of these; it remains available only if a
  specific transition genuinely can't be done with the above (to be justified inline in `tasks.md`/
  implementation if it comes up, per Constitution Principle V).
- **Rationale**: The user explicitly asked for the game to use modern HTML5/CSS3-or-later animation
  capabilities, with a distinct animation per player action (turn, advance, wall-bump, shoot, death,
  win/exit) rather than a single generic transition. The native-platform stack (CSS + WAAPI + View
  Transitions) delivers that directly, is exactly the "latest CSS3 or later" tooling requested,
  avoids `@angular/animations`' runtime/DI overhead (Principle V, SC-004/SC-005 build-quality goals),
  and each layer is only reached for when the simpler one below it can't express the effect.
- **Alternatives considered**: `@angular/animations` package — rejected as unnecessary overhead for
  effects the native platform already covers well; CSS-only with no WAAPI/View Transitions — rejected
  because the runtime-length arrow-travel animation and the screen-to-screen transitions are
  genuinely awkward in pure CSS, and the user asked for "latest features" specifically, which these
  two APIs represent more than CSS transitions alone.

## 8. Configuration validation (FR-011)

- **Decision**: Reactive Forms `Validators` (`min`, `required`, `pattern`) plus one custom
  cross-field validator that estimates whether `pits` can legally fit given `cellsX`/`cellsY` (mirrors
  the board-generation availability logic at a conservative upper bound: `pits <= (cellsX * cellsY) -
  4` to leave room for escape/gold/Wumpus/at-least-one clear-path cell).
- **Rationale**: Keeps validation declarative and colocated with the existing reactive form
  (`ConfigurationScreenComponent`), consistent with Principle V.
- **Alternatives considered**: Attempting a full trial board generation to validate — rejected as
  overkill for a client-side form guard; the conservative bound is good enough to prevent the crash
  case in the edge cases section of `spec.md`, and actual generation still needs to remain robust
  regardless.

## 9. Movement model: facing + turn/advance vs. legacy free 4-direction movement

- **Decision**: Implement the facing-direction model from `game-rules.md` §3 — the hunter has a
  heading (N/E/S/W), "turn left"/"turn right" rotate it 90° without moving, "advance" moves one cell
  in the current heading if unblocked, and "shoot" fires in the current heading. This replaces the
  legacy code's free 4-direction movement (any arrow key moves that direction regardless of any
  heading) for User Story 1.
- **Rationale**: `game-rules.md` is the authoritative rule source per Constitution Principle I (v1.1.0);
  the original assignment brief explicitly specifies "Avanzar" / "Girar 90° izquierda o derecha" as
  distinct actions, which only makes sense with a facing concept. This is not a discretionary
  architecture choice — it's a correctness requirement.
- **Alternatives considered**: Keep the legacy free-movement model and treat facing/turning as a
  purely cosmetic overlay (e.g. rotate a sprite to match the last move direction without it affecting
  shoot direction) — rejected, because it wouldn't satisfy `game-rules.md` §3's actual action set
  (there would be no way to shoot in a direction other than the last move, and "turn without moving"
  would have no effect, which contradicts the brief).

## 10. Initial hunter facing direction

- **Decision**: At board generation, set the hunter's initial facing to point away from the wall the
  escape cell sits on (i.e., into the board). If the escape cell is a corner (two walls), pick the
  first of those two wall-normal directions in a fixed, documented order (e.g. prefer facing away
  from the top/bottom wall over the left/right wall).
- **Rationale**: `game-rules.md` doesn't specify an initial facing; picking "away from the wall" avoids
  the degenerate first move being an immediate wall-bump for most escape-cell positions, which would
  read as a bug even though it's technically spec-compliant. This is a deterministic, testable rule
  (Constitution Principle IV), not randomized.
- **Alternatives considered**: Always default to North regardless of escape-cell position — rejected,
  because on a wall segment facing away from North (e.g. the top wall) the hunter would start facing
  directly into a wall, which is a poor first impression even if not strictly a rule violation.

## 11. Path-finding algorithm review (`PathCreatorService.findPath`)

The user asked for the legacy path-finding algorithm — hand-written without much prior experience —
to be analyzed and improved rather than ported as-is. Reading `src/app/services/path-creator.service.ts`
closely surfaces a real bug, not just a style nit:

- **Finding — no working "visited" check, so the BFS can revisit the same cell unboundedly.**
  `exploreInDirection` does set `board[y][x].status = PathFinderStatus.Valid` on every cell it visits,
  clearly intended as a "mark visited" step. But `locationStatus()` — the function that decides
  whether a neighbor is `Blocked` vs. `Valid` — only calls `isCellAlreadyTaken()`, which checks
  `isEscape`/`isPit`/`hasGold`/`isWumpus`/`isClearPath`. It never looks at the `status` field that was
  just set. So a cell that's already been visited (and re-marked "Valid") is `Valid` again the next
  time any neighbor reaches it, and gets pushed back onto the queue. The intended dedup line does
  nothing; there is no dedup.
  - **Why it still "works" today**: BFS processes the queue in FIFO order, so cells are still explored
    in non-decreasing depth order even with duplicates, and `findPath` returns the instant it reaches
    the gold cell — so the *first* path found is still the true shortest path. Correctness of the
    returned path is not in question.
  - **Why it's a real problem anyway**: without dedup, the number of enqueued (cell, path-so-far)
    entries grows combinatorially with how open the board is and how far the gold is from the escape
    cell — every cycle back to an already-visited cell spawns new duplicate branches. Each entry also
    carries a full copy of its path array (`currentLocation.path.slice()` on every step). On the
    default 8×8 board with a handful of obstacles this is masked by getting lucky and returning early,
    but the board size is a player-configurable parameter (FR-007) — a large, mostly-open board with
    the gold far from the escape cell can make this run very slowly or exhaust memory in the browser,
    which is exactly the kind of latent bug that's invisible in casual testing and shows up later.
  - **Compounding issue**: `queue.shift()` is called every iteration; `Array.prototype.shift()` is
    O(n), so the loop is O(n²) in queue size on top of the unbounded queue growth above.
  - **Secondary issue**: `findPath` returns `null` when no path exists (e.g. gold surrounded by
    already-taken cells), and the caller (`createCleanPathToGold`) does not guard against that before
    calling `.slice()` on it — a latent crash, related to but distinct from the FR-011 configuration
    validation (that guards board-level parameters; this guards the pathfinder's own return value).
  - **Secondary issue**: the code mixes two coordinate vocabularies for the same thing
    (`distanceFromTop`/`distanceFromLeft` inside the search vs. `BoardCoordinate`'s `X`/`Y` for the
    result) — harmless but needlessly hard to follow.

- **Decision**: Keep breadth-first search as the algorithm — it's the right choice for "shortest path
  on an unweighted grid" and does not need to become A\* or anything fancier. Fix the implementation:
  1. Track visited cells explicitly with a `Set<string>` (or a same-shaped `boolean[][]`) keyed by
     coordinate, checked *before* a neighbor is enqueued — not inferred from unrelated cell flags.
  2. Mark a cell visited at the moment it's enqueued (not only when dequeued), which is what actually
     prevents the combinatorial requeueing described above.
  3. Use an index cursor into the queue array (or a real deque) instead of `Array.shift()`, so the
     loop is O(width × height) instead of O(n²).
  4. Reconstruct the path via parent pointers (or a single coordinate list per cell) instead of
     copying/growing a full path array into every queued entry, which is both simpler and removes the
     main memory cost.
  5. Return an explicit "no path" result (e.g. `null` with a typed signature that callers must handle,
     or a discriminated result type) and have `createCleanPathToGold` guard it defensively even though
     FR-011's configuration validation should make it unreachable in practice — defense in depth for a
     function whose failure mode is a hard crash.
  6. Use one coordinate vocabulary consistently (reuse the existing `BoardCoordinate {X, Y}` shape
     throughout the search, not a second `distanceFromTop`/`distanceFromLeft` naming).
- **Rationale**: This directly satisfies both Constitution Principle IV (test discipline — the visited-
  set behavior needs a dedicated unit test, e.g. a board shaped to force revisits) and the new
  Principle VII (see `constitution.md` 1.2.0) requiring inherited algorithms to be reviewed and fixed,
  not preserved for parity's sake — Principle I's "preserve baseline behavior" only applies to
  externally observable gameplay rules, not to an internal bug that happens to not (yet) be visible to
  players.
- **Alternatives considered**: Rewriting as A\*/Dijkstra with a heuristic — rejected, unnecessary
  complexity for an unweighted grid where BFS is already optimal (Principle V). Leaving the algorithm
  untouched and only tests added — rejected, the user explicitly asked for it to be analyzed and
  improved, and the unbounded-requeue issue is a genuine correctness-adjacent risk for larger
  player-configured boards, not just style.

## 12. User Story 3 clarifications (resolved 2026-07-27)

- Run summary/scoring: resolved **in scope** — a lightweight summary (moves/turns taken, arrows
  used) on the end-of-round modal, now FR-014 in `spec.md`. No broader scoring/leaderboard system.
- Difficulty presets: resolved **deferred** — free-form numeric configuration (FR-007) plus
  validation (FR-011) is the only configuration mechanism for this pass; named presets add UI/state
  complexity without much payoff for a solo project and can be revisited later.
- See `spec.md` Clarifications section for the full Q&A. Neither item ever blocked Phase 1 design for
  User Stories 1–2.
