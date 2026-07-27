# Implementation Plan: Angular Modernization of Hunt the Wumpus

**Branch**: `001-angular-modernization` | **Date**: 2026-07-27 | **Spec**: `specs/001-angular-modernization/spec.md`

**Input**: Feature specification from `specs/001-angular-modernization/spec.md`

## Summary

Rebuild the existing Angular 10 "Hunt the Wumpus" game on Angular 22 using standalone components and
signals, preserving all board-generation and gameplay rules documented in `legacy-baseline.md` (User
Story 1), then layer on an upgraded visual presentation (User Story 2) and a small set of
quality-of-life fixes/enhancements (User Story 3). The game logic (board generation, movement,
shooting, path-finding) is framework-light TypeScript already isolated in services — the primary
technical work is (a) porting those services to the new stack and closing the rough edges in
`legacy-baseline.md` §7, and (b) rebuilding the presentation layer without `NgModule`s, `ng-bootstrap`,
jQuery, or manual DOM mutation.

## Technical Context

**Language/Version**: TypeScript (strict mode), targeting the TS version bundled with Angular 22.

**Primary Dependencies**: `@angular/core` / `@angular/router` / `@angular/forms` @ 22.x (standalone
APIs, signals). No `@angular/animations` (CSS-only, see `research.md` §7). No `ng-bootstrap`, no
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

**Constraints**: Must preserve every gameplay invariant in `legacy-baseline.md` §2–§4 and §8
unless `spec.md` explicitly marks it changed. Must build with zero TypeScript errors under strict
mode (SC-005) and without `NgModule`-based feature modules.

**Scale/Scope**: Single-player, single-screen-plus-config game; ~10 components/services total
(comparable to the current `src/app` tree) — this is a rewrite-in-place of an existing small app, not
a new large system.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Check | Status |
|---|---|---|
| I. Gameplay Fidelity by Default | Every functional requirement in `spec.md` cites which `legacy-baseline.md` section it preserves/changes (FR-001–FR-003 preserved, FR-007–FR-011 explicitly new). | PASS |
| II. Modern, Idiomatic Angular | Plan targets Angular 22, standalone-only, signals, strict TS, drops jQuery (Technical Context above). | PASS |
| III. Spec-Driven Delivery | This plan follows an approved `spec.md`; `tasks.md` will be generated via `/speckit-tasks` before any implementation starts — no code is written as part of this planning pass. | PASS |
| IV. Test Discipline | FR-012 requires unit tests for baseline §8 invariants; Testing section keeps Karma/Jasmine so existing test patterns (`*.spec.ts` already present for every service) carry forward. | PASS |
| V. Simplicity & YAGNI | State management stays signals-in-services (no NgRx); UI kit dropped rather than swapped for another kit; animations are CSS-only rather than adding `@angular/animations` (`research.md` §3–4, §7). | PASS |
| VI. Visual & UX Quality | FR-011/SC-004 require mobile-width usability and manual browser verification is called out as required before any Story 2 task is "done" (enforced at `tasks.md`/implementation time, not by this plan alone). | PASS (deferred enforcement to implementation) |

No violations requiring `Complexity Tracking` justification.

## Project Structure

### Documentation (this feature)

```text
specs/001-angular-modernization/
├── spec.md               # Feature specification (/speckit-specify output)
├── legacy-baseline.md     # Reverse-engineered behavior of the Angular 10 app (reference, not a template phase output)
├── plan.md                # This file (/speckit-plan command output)
├── research.md            # Phase 0 output (/speckit-plan command)
└── tasks.md                # Phase 2 output (/speckit-tasks command — NOT created by this plan)
```

`data-model.md` and `contracts/` are omitted: there is no backend/API surface, and the data model
(Board/Cell/Player/GameConfiguration) is already fully specified by `spec.md`'s Key Entities section
plus the existing `src/app/core/models/game.ts` / `configuration.ts` shapes, which the implementation
ports largely as-is (renamed/adjusted only where Angular 22 idioms require it, e.g. converting mutable
class fields to `signal()`s).

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
│   │   └── configuration-screen.component.ts   # Standalone, reactive form + new validators (FR-008)
│   ├── game/
│   │   ├── board/board.component.ts             # Standalone, signals-driven board state
│   │   └── cell/cell.component.ts               # Standalone, template-bound classes (fixes baseline §7.5)
│   ├── services/
│   │   ├── game.service.ts          # Board generation — preserves legacy-baseline.md §2 rules
│   │   ├── player.service.ts        # Movement/shoot/win/die — preserves §3–§4
│   │   ├── path-creator.service.ts  # BFS clean-path — preserves §2 clean-path guarantee
│   │   ├── messages.service.ts      # Fixes duplicate-message bug (baseline §7.2)
│   │   └── storage.service.ts       # localStorage + in-memory fallback (Edge Cases)
│   └── styles/                      # SCSS (kept), CSS Grid board layout, new visual language (US2)
└── assets/images/                    # Sprite set — replaced/upgraded under User Story 2

# Existing test co-location pattern is preserved: one *.spec.ts per component/service.
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

1. Run `/speckit-clarify` (optional) or get direct confirmation on the two `NEEDS CLARIFICATION`
   items in `spec.md` (run summary/scoring, difficulty presets) before they're scheduled into
   `tasks.md` for User Story 3.
2. Run `/speckit-tasks` to break User Stories 1–3 into independently-implementable tasks.
3. Implementation starts with User Story 1 only (the migration MVP) — User Stories 2 and 3 are not
   started until Story 1 is verified against `legacy-baseline.md` per the Constitution's Visual & UX
   Quality principle.
