# Implementation Plan: Angular Modernization of Hunt the Wumpus

**Branch**: `001-angular-modernization` | **Date**: 2026-07-27 | **Spec**: `specs/001-angular-modernization/spec.md`

**Input**: Feature specification from `specs/001-angular-modernization/spec.md`

## Summary

Rebuild the "Hunt the Wumpus" game on Angular 22 using standalone components and signals, implementing
the canonical rules in `game-rules.md` (the original assignment brief) as User Story 1 — including the
facing-direction movement model (turn/advance), the shoot-in-facing-direction arrow, the explicit exit
action, and all six required perceptions (stench, breeze, glimmer, impact/"choque", scream, and death)
— then layering on an upgraded visual presentation (User Story 2) and a small set of quality-of-life
improvements that go beyond the brief (User Story 3). `legacy-baseline.md` remains useful wherever it
matches `game-rules.md` (board generation, death conditions, arrow-vs-Wumpus mechanics), but User
Story 1 is scoped to the brief, not to replicating every legacy shortcut. The game logic (board
generation, movement, shooting, path-finding) is framework-light TypeScript already isolated in
services — the primary technical work is (a) porting/extending those services for the facing/turn/
exit model on the new stack, closing the gaps in `game-rules.md` §6, and (b) rebuilding the
presentation layer — a minimal button + text-output interface per `game-rules.md` §7 — without
`NgModule`s, `ng-bootstrap`, jQuery, or manual DOM mutation.

## Technical Context

**Language/Version**: TypeScript (strict mode), targeting the TS version bundled with Angular 22.

**Primary Dependencies**: `@angular/core` / `@angular/router` / `@angular/forms` @ 22.x (standalone
APIs, signals). No `@angular/animations` — animation uses native CSS transitions/keyframes, the Web
Animations API, and the View Transitions API instead, see `research.md` §7. No `ng-bootstrap`, no
`bootstrap`, no `jquery`, no `@fortawesome/*` unless User Story 2 implementation decides to keep
FontAwesome for icons only (non-blocking, cosmetic decision — see `research.md` §5).

**Storage**: Browser `localStorage` for `GameConfiguration` (same as baseline), with an in-memory
fallback when unavailable (spec.md Edge Cases).

**Testing**: Karma + Jasmine (`ng test` default), per `research.md` §6. Angular CLI's default E2E
tooling (Protractor is deprecated/removed) — a modern replacement (e.g. Playwright via
`ng e2e`) is a `tasks.md`-time decision, not required to unblock this plan.

**Target Platform**: Static, client-only web app (no backend), deployed as a built Angular app;
must run correctly on evergreen desktop and mobile browsers.

**Project Type**: Single frontend project (no backend/API — game logic runs entirely client-side, as
in the baseline).

**Performance Goals**: No hard numeric target; turn-based grid game, so "no visible input lag on a
keypress" and "no layout jank on window resize" are sufficient (spec.md Success Criteria / Edge
Cases). Bundle size should not regress meaningfully from dropping Bootstrap/jQuery/ng-bootstrap (net
expectation: smaller, not larger).

**Constraints**: Must implement every rule in `game-rules.md` §2–§5 (facing/turn/advance, shoot-in-
facing-direction, explicit exit, all six perceptions) and every board-generation invariant in
`legacy-baseline.md` §8, unless `spec.md` explicitly marks something changed. Must build with zero
TypeScript errors under strict mode (SC-005) and without `NgModule`-based feature modules.

**Scale/Scope**: Single-player, single-screen-plus-config game; ~10 components/services total
(comparable to the current `src/app` tree) — this is a rewrite-in-place of an existing small app, not
a new large system.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Check | Status |
|---|---|---|
| I. Gameplay Fidelity to the Canonical Rules | Every functional requirement in `spec.md` cites `game-rules.md` and/or `legacy-baseline.md` and states preserved/new/beyond-brief (FR-001–FR-008 follow `game-rules.md`, FR-009–FR-010/FR-012–FR-013 are implementation-quality requirements, FR-011 is explicitly beyond-brief). | PASS |
| II. Modern, Idiomatic Angular | Plan targets Angular 22, standalone-only, signals, strict TS, drops jQuery (Technical Context above). | PASS |
| III. Spec-Driven Delivery | This plan follows an approved `spec.md`; `tasks.md` will be generated via `/speckit-tasks` before any implementation starts — no code is written as part of this planning pass. | PASS |
| IV. Test Discipline | FR-013 requires unit tests for board-generation invariants, the facing/turn/advance state machine, shoot-in-facing collision, and the exit/win/non-win outcome; Testing section keeps Karma/Jasmine so existing test patterns (`*.spec.ts` already present for every service) carry forward. | PASS |
| V. Simplicity & YAGNI | State management stays signals-in-services (no NgRx); UI kit dropped rather than swapped for another kit; animation uses native CSS/WAAPI/View Transitions layered by need rather than adding `@angular/animations` (`research.md` §3–4, §7). | PASS |
| VI. Visual & UX Quality | FR-008 requires the button + text-output floor as the primary interface (not just keyboard); FR-012/SC-004 require mobile-width usability on top of it; manual browser verification is required before any Story 1/2 task is "done" (enforced at `tasks.md`/implementation time, not by this plan alone). | PASS (deferred enforcement to implementation) |

No violations requiring `Complexity Tracking` justification.

## Project Structure

### Documentation (this feature)

```text
specs/001-angular-modernization/
├── game-rules.md          # Canonical assignment brief — authoritative gameplay rules (reference)
├── spec.md                # Feature specification (/speckit-specify output)
├── legacy-baseline.md     # Reverse-engineered behavior of the Angular 10 app (reference, not a template phase output)
├── plan.md                # This file (/speckit-plan command output)
├── research.md            # Phase 0 output (/speckit-plan command)
└── tasks.md                # Phase 2 output (/speckit-tasks command — NOT created by this plan)
```

`data-model.md` and `contracts/` are omitted: there is no backend/API surface, and the data model
(Board/Cell/Hunter/GameConfiguration) is already fully specified by `spec.md`'s Key Entities section
plus the existing `src/app/core/models/game.ts` / `configuration.ts` shapes, which the implementation
extends (not just ports as-is) to add the facing-direction state that `game-rules.md` requires and
the legacy model never had — see the `Player`/`Hunter` note under Source Code below.

### Source Code (repository root)

This is a rewrite-in-place of the existing single Angular project — no new top-level project is
introduced. Target layout (standalone-components version of the current `src/app` tree):

```text
src/
├── app/
│   ├── app.component.ts            # Standalone root component (replaces app.module.ts)
│   ├── app.routes.ts                # Route config via provideRouter (replaces app-routing.module.ts)
│   ├── core/
│   │   ├── models/                  # game.ts, configuration.ts — ported, signals-friendly shapes
│   │   └── helpers/                 # helper-functions.ts — pure functions, framework-agnostic, minimal change
│   ├── configuration-screen/
│   │   └── configuration-screen.component.ts   # Standalone, reactive form + new validators (FR-011)
│   ├── game/
│   │   ├── board/board.component.ts             # Standalone, signals-driven board state; hosts the
│   │   │                                         #   5 command buttons + text-output log (FR-008)
│   │   └── cell/cell.component.ts               # Standalone, template-bound classes (fixes baseline
│   │                                             #   §7.5); renders hunter facing on its own cell
│   ├── services/
│   │   ├── game.service.ts          # Board generation — preserves legacy-baseline.md §2 rules
│   │   ├── player.service.ts        # Facing/turn/advance/shoot/exit — implements game-rules.md
│   │   │                            #   §2–§4 (FR-002–FR-006); adds facing state and the exit action
│   │   │                            #   the legacy service never had
│   │   ├── path-creator.service.ts  # BFS clean-path — preserves §2 clean-path guarantee
│   │   ├── messages.service.ts      # One message per perception type, no duplicates (FR-006)
│   │   └── storage.service.ts       # localStorage + in-memory fallback (Edge Cases)
│   └── styles/                      # SCSS (kept), CSS Grid board layout, new visual language (US2)
└── assets/images/                    # Sprite set — replaced/upgraded under User Story 2, must convey
                                       #   hunter facing direction (FR-012)

# Existing test co-location pattern is preserved: one *.spec.ts per component/service.
# "player.service.ts" keeps its filename for continuity with the legacy codebase; the domain concept
# it models is the spec's "Hunter" entity (facing, position, arrows, gold, alive/exit outcome).
```

**Structure Decision**: Single Angular project, standalone components, no NgModules. Directory shape
mirrors the current `src/app` tree closely (low migration risk, easy diffing against
`legacy-baseline.md`) rather than a full restructure — consistent with Principle V (smallest change
that satisfies the spec). `app.module.ts` / `configuration-screen.module.ts` / `game.module.ts` /
`app-routing.module.ts` are removed and replaced by `bootstrapApplication` + `provideRouter` in
`main.ts`/`app.routes.ts`.

## Complexity Tracking

*No Constitution Check violations — table intentionally empty.*

## Next Steps

1. All open questions are resolved: the run-summary/scoring and difficulty-preset items are settled
   in `spec.md`'s Clarifications section (2026-07-27), and the exit-without-gold and initial-facing
   rulings are recorded in `spec.md` Assumptions. No outstanding `NEEDS CLARIFICATION` markers remain.
2. Run `/speckit-tasks` to break User Stories 1–3 into independently-implementable tasks.
3. Implementation starts with User Story 1 only (the migration MVP, scoped to `game-rules.md`) — User
   Stories 2 and 3 are not started until Story 1 is verified against `game-rules.md` per the
   Constitution's Visual & UX Quality principle.
