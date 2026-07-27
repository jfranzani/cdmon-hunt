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

- **Decision**: Drop `ng-bootstrap` + Bootstrap + jQuery(-adjacent) dependencies. Use plain SCSS with
  CSS Grid for the board layout, native `<dialog>` element (or a small bespoke modal component) for
  the end-game modal, replacing `NgbModal`.
- **Rationale**: Constitution explicitly forbids jQuery; `ng-bootstrap`'s own peer dependency chain
  and Bootstrap's utility-class approach add weight not needed for a single-screen game UI. CSS Grid
  is a natural fit for the board (already conceptually a grid) and avoids a UI kit dependency
  entirely, maximizing control over the "improved graphics" goal (User Story 2).
- **Alternatives considered**: Keep `ng-bootstrap` (lower migration effort) — rejected because the
  modal/tooltip components are the only things used from it, and User Story 2 wants a distinctive
  visual identity, not generic Bootstrap chrome. Angular Material — rejected, same "generic UI kit"
  concern, larger dependency for a small surface area.

## 5. Icons

- **Decision**: Keep `@fortawesome/*` for now, or replace with inline SVG per FR-011's discretion;
  final call deferred to implementation of User Story 2 (this is an art-direction detail, not an
  architectural one — no blocking decision needed for `plan.md`).
- **Rationale**: Icons are cosmetic and don't affect the Constitution Check or project structure.

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

- **Decision**: CSS transitions/animations (via Angular's native `[class]`/`@if`/`@for` bindings and
  plain CSS keyframes) rather than `@angular/animations`.
- **Rationale**: `@angular/animations` adds a runtime dependency and DI providers for what is a small
  set of discrete state transitions (move, death, win, gold pickup); CSS-only keeps the bundle
  smaller and is sufficient for a turn-based game (Principle V, SC-004/SC-005 build-quality goals).
- **Alternatives considered**: `@angular/animations` package — rejected as unnecessary overhead;
  revisit only if a specific transition proves impractical in pure CSS.

## 8. Configuration validation (FR-008)

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

## 9. NEEDS CLARIFICATION items from spec.md carried forward

- User Story 3 Scenario 4 (run summary/scoring) and Scenario 5 (difficulty presets) remain open.
  They do not block Phase 1 design for User Stories 1–2 and are out of scope for the first
  implementation pass unless resolved via `/speckit-clarify` before `/speckit-tasks` is run for
  User Story 3.
