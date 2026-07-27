---

description: "Task list template for feature implementation"
---

# Tasks: Angular Modernization of Hunt the Wumpus

**Input**: Design documents from `/specs/001-angular-modernization/`

**Prerequisites**: `plan.md` (required), `spec.md` (required for user stories), `research.md`,
`game-rules.md`, `legacy-baseline.md`, `constitution.md` (v1.2.0)

**Tests**: Included. `spec.md` FR-013 and Constitution Principle IV explicitly require unit tests for
every game-logic unit, so test tasks are mandatory here, not optional.

**Organization**: Tasks are grouped by user story (see `spec.md`) to enable independent
implementation and testing of each story. This is a rewrite-in-place of the existing single Angular
project — no new top-level project is introduced (`plan.md` Structure Decision).

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (US1, US2, US3)
- Every task lists its exact file path(s)

## Path Conventions

Single Angular project. All paths are relative to the repository root, under `src/app/` unless noted.
See `plan.md` → Project Structure → Source Code for the full target tree.

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Bring the workspace onto Angular 22 with standalone-by-default tooling before any
game-logic or component work starts.

- [X] T001 Remove legacy tooling that Constitution Principle II forbids reintroducing: delete
      `tslint.json` and the Protractor-based `e2e/` config (repo root, `e2e/`)
- [X] T002 Regenerate/update the Angular workspace scaffold for Angular 22 with standalone-by-default
      schematics: `angular.json`, `package.json`, `tsconfig.json`, `tsconfig.app.json`,
      `tsconfig.spec.json` (repo root) — per `research.md` §1
- [X] T003 [P] Configure ESLint with `@angular-eslint` as TSLint's replacement, wired into the
      `angular.json` lint target (repo root: `eslint.config.js` or equivalent, `angular.json`)
- [X] T004 [P] Update `package.json` dependencies: `@angular/*` → `22.x`; remove `ng-bootstrap`,
      `bootstrap`, `jquery`, `protractor`; keep `@fortawesome/*` only if User Story 2 keeps it per
      `research.md` §5; do not add `@angular/animations` (`package.json`) — per `research.md` §4, §7
- [X] T005 [P] Set up `src/main.ts` and a standalone `app.config.ts` with `bootstrapApplication` and
      `provideRouter` — no `NgModule`s anywhere (`src/main.ts`, `src/app/app.config.ts`)

**Checkpoint**: Workspace builds clean on Angular 22 with no legacy tooling before any game code lands.

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core models, storage, and app shell that every user story depends on.

**⚠️ CRITICAL**: No user story work can begin until this phase is complete.

- [X] T006 Extend the core game models for the facing-direction and exit-outcome concepts
      `game-rules.md` requires: add a `Facing` (N/E/S/W) type and `exitOutcome`/move-count/
      arrows-used fields to the `Hunter`/`Board` shapes (`src/app/core/models/game.ts`)
- [X] T007 [P] Update the `GameConfiguration` model/defaults so the config screen defaults to a
      square board per `spec.md` Assumptions (`src/app/core/models/configuration.ts`)
- [X] T008 Rewrite `StorageService` with an in-memory fallback when `localStorage` is unavailable
      (`src/app/services/storage.service.ts`) — per `spec.md` Edge Cases
- [X] T009 Define `app.routes.ts` with the two required routes (configuration screen, play screen)
      via `provideRouter` (`src/app/app.routes.ts`) — per FR-008 (exactly two screens)
- [X] T010 Convert `AppComponent` to a standalone root component hosting `<router-outlet>`
      (`src/app/app.component.ts`)

**Checkpoint**: Foundation ready — User Story 1 implementation can now begin.

---

## Phase 3: User Story 1 - Play the canonical game on a modern Angular foundation (Priority: P1) 🎯 MVP

**Goal**: A complete, correct implementation of `game-rules.md` §2–§5 (facing/turn/advance, shoot in
facing direction, explicit exit, all six perceptions) on Angular 22, playable end-to-end via the
required button + text-output interface.

**Independent Test**: Configure a board, play a full round using only the on-screen buttons (turn,
advance, shoot, exit), and confirm every perception and outcome matches `game-rules.md` §2–§5, per
`spec.md` User Story 1's Independent Test.

### Tests for User Story 1 (write first, confirm they fail before implementing — FR-013)

- [X] T011 [P] [US1] Unit tests for board-generation invariants (escape cell on a wall, gold/Wumpus on
      distinct available cells, a clear path from escape to gold exists, pits never on escape/gold/
      Wumpus/clear-path cells) in `src/app/services/game.service.spec.ts` — per FR-001,
      `legacy-baseline.md` §8
- [X] T012 [P] [US1] Unit tests for the rewritten clear-path search: each cell is explored at most
      once on a board shaped to force what would have been duplicate revisits in the legacy BFS, and
      it returns an explicit no-path result (no throw) when the gold is unreachable, in
      `src/app/services/path-creator.service.spec.ts` — per FR-001a, `research.md` §11
- [X] T013 [P] [US1] Unit tests for the facing/turn/advance state machine: turn left/right rotates
      facing without moving or consuming a resource; advance moves one cell in the current facing
      when unblocked and stays put with a "choque" result when blocked, in
      `src/app/services/player.service.spec.ts` — per FR-002, FR-006
- [X] T014 [P] [US1] Unit tests for shoot-in-facing-direction collision: Wumpus hit kills it and
      clears neighboring stench, wall hit stops the arrow, a pit between hunter and target does not
      affect the arrow, and shooting with zero arrows is a no-op, in
      `src/app/services/player.service.spec.ts` — per FR-004
- [X] T015 [P] [US1] Unit tests for the exit action's three outcomes: win (on escape cell with gold),
      exit-without-gold (on escape cell without gold), and unavailable everywhere else, in
      `src/app/services/player.service.spec.ts` — per FR-005
- [X] T016 [P] [US1] Unit tests confirming exactly one message string exists per perception type
      (Wumpus-in-cell, stench, breeze, glimmer, choque, grito) with no duplicate registrations, in
      `src/app/services/messages.service.spec.ts` — per FR-006

### Implementation for User Story 1

- [X] T017 [US1] Port `GameService` board generation (escape/gold/Wumpus/pit placement, breeze/stench
      activation) onto signals-based state (`src/app/services/game.service.ts`) — depends on T006;
      makes T011 pass
- [X] T018 [US1] Rewrite `PathCreatorService` per `research.md` §11: explicit visited `Set`, index-
      cursor queue instead of `Array.shift()`, parent-pointer path reconstruction, explicit no-path
      result, single `BoardCoordinate` vocabulary throughout
      (`src/app/services/path-creator.service.ts`) — depends on T006; makes T012 pass
- [X] T019 [US1] Rewrite `PlayerService` (models the spec's Hunter entity) with facing state,
      `turnLeft`/`turnRight`, `advance` (including the wall-bump/"choque" case), shoot-in-facing-
      direction, and the exit action (`src/app/services/player.service.ts`) — depends on T006; makes
      T013, T014, T015 pass
- [X] T020 [US1] Rewrite `MessagesService` with exactly one message per perception/event, including
      the previously-dead wall-bump ("choque") message and de-duplicated arrow-hit-wall/arrow-hit-
      Wumpus strings (`src/app/services/messages.service.ts`) — makes T016 pass
- [X] T021 [US1] Build `ConfigurationScreenComponent` as a standalone component: the reactive form
      (board size, pits, arrows) wired to `StorageService`, no visual polish yet — that's User Story 2
      (`src/app/configuration-screen/configuration-screen.component.ts`) — depends on T007, T008
- [X] T022 [US1] Build `BoardComponent` as the play screen: signals-driven board state, the five
      required command buttons (advance, turn left, turn right, shoot, exit — exit disabled off the
      escape cell), and the text/log output area (`src/app/game/board/board.component.ts`) — depends
      on T017, T019, T020; satisfies FR-008
- [X] T023 [US1] Build `CellComponent` rendering wall/escape/hunter/facing state via template
      bindings only (`[class]`/`[ngClass]`/signals), no manual DOM mutation
      (`src/app/game/cell/cell.component.ts`) — depends on T017; satisfies FR-010
- [X] T024 [US1] Wire `app.routes.ts` to `ConfigurationScreenComponent`/`BoardComponent` and verify
      the full config → play → (win / die / exit-without-gold) → reset loop end-to-end in a running
      dev server, per Constitution Principle VI (`src/app/app.routes.ts`) — depends on T021, T022,
      T023

**Checkpoint**: User Story 1 is fully functional and independently playable/testable — this is the MVP.

---

## Phase 4: User Story 2 - Upgraded visual presentation (Priority: P2)

**Goal**: Modern rendering, layout, and per-action animation on top of the unchanged User Story 1
engine, per FR-011a's animation requirements and `research.md` §7's layered approach.

**Independent Test**: With Phase 3 complete, ship rendering-only changes and re-run every User Story 1
acceptance scenario to confirm zero rule regressions, per `spec.md` User Story 2's Independent Test.

- [X] T025 [P] [US2] Replace the board layout with CSS Grid and a new visual language in SCSS,
      dropping Bootstrap grid classes (`src/app/game/board/board.component.scss`, `src/styles.scss`)
- [X] T026 [P] [US2] Produce upgraded sprite/CSS-drawn assets for the hunter (with facing), Wumpus,
      gold, breeze, and stench, replacing the legacy placeholder images (`src/assets/images/`)
- [X] T027 [US2] Add CSS transition/keyframe animations for turn (rotate), advance (slide), and
      wall-bump/"choque" (shake/recoil) — depends on T023, T025; satisfies FR-012a (turn/advance/
      wall-bump)
- [X] T028 [US2] Add CSS transition/keyframe animations for breeze/stench/glimmer reveal and the
      three end-of-round outcomes (death, win, exit-without-gold) — depends on T022, T025; satisfies
      FR-012a (end-of-round outcomes)
- [X] T029 [US2] Implement the arrow-travel animation with the Web Animations API
      (`element.animate()`), sequencing cell-by-cell based on the actual distance traveled before
      resolving into the wall-hit or Wumpus-hit/scream outcome — depends on T019, T022; satisfies
      FR-012a (shoot), per `research.md` §7
- [X] T030 [US2] Wrap the configuration↔play screen navigation in the View Transitions API
      (`document.startViewTransition`), feature-detected with a non-animated fallback — depends on
      T024; satisfies the FR-012a screen-transition requirement and SC-006's fallback check
- [X] T031 [US2] Verify and adjust the mobile-width layout (~375px) for the board, buttons, and log
      so nothing scrolls horizontally or overlaps — depends on T025; satisfies SC-004

**Checkpoint**: User Stories 1 and 2 both work independently — visuals and animation upgraded, engine
behavior unchanged.

---

## Phase 5: User Story 3 - Quality-of-life improvements beyond the brief (Priority: P3)

**Goal**: Configuration validation and the run summary — both resolved "in scope" in `spec.md`
Clarifications; difficulty presets are explicitly deferred and have no task here.

**Independent Test**: Each item below is verified in isolation without regressing User Story 1, per
`spec.md` User Story 3's Independent Test.

- [ ] T032 [P] [US3] Add configuration form validators: positive-integer guards on board size/pits/
      arrows, plus the pits-fit-the-board cross-field check from `research.md` §8, with a visible
      error that blocks navigation to the play screen
      (`src/app/configuration-screen/configuration-screen.component.ts`) — depends on T021; satisfies
      FR-011
- [ ] T033 [P] [US3] Unit tests for the configuration validators, including the "pits can't legally
      fit" boundary case from `spec.md` Edge Cases
      (`src/app/configuration-screen/configuration-screen.component.spec.ts`)
- [ ] T034 [US3] Track moves/turns-taken and arrows-used counters on the round's state and surface
      them in the end-of-round modal as a run summary (`src/app/game/board/board.component.ts`,
      `src/app/core/models/game.ts`) — depends on T022; satisfies FR-014

**Checkpoint**: All three user stories independently functional.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Deliverable-level requirements from `game-rules.md` §7 that span every story.

- [ ] T035 [P] Update `README.md` with Angular 22 run/build/test instructions, per the "publish
      source with instructions to run the application" requirement in `game-rules.md` §7 (`README.md`)
- [ ] T036 [P] Remove leftover legacy artifacts from the port (unused FontAwesome/Bootstrap
      references if User Story 2 dropped them, stray `e2e/` scaffolding) (`package.json`, `e2e/`)
- [ ] T037 Full manual regression pass of every User Story 1 acceptance scenario in a running dev
      server, on both a desktop and a mobile-width viewport, per Constitution Principle VI — depends
      on T024, T031; satisfies SC-001, SC-004

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — can start immediately.
- **Foundational (Phase 2)**: Depends on Setup completion — BLOCKS all user stories.
- **User Story 1 (Phase 3)**: Depends on Foundational completion. This is the MVP; nothing else
  should start before it's checkpointed.
- **User Story 2 (Phase 4)**: Depends on User Story 1 being complete (it animates/restyles User
  Story 1's components — `plan.md` Next Steps is explicit that Story 2 doesn't start until Story 1 is
  verified against `game-rules.md`).
- **User Story 3 (Phase 5)**: Depends on User Story 1 (`ConfigurationScreenComponent`,
  `BoardComponent` must exist); independent of User Story 2 and could run in parallel with it.
- **Polish (Phase 6)**: Depends on whichever of Phases 3–5 are in scope for a given release.

### User Story Dependencies

- **User Story 1 (P1)**: No dependencies on other stories — this is the foundation everything else
  builds on.
- **User Story 2 (P2)**: Builds on User Story 1's components/services; adds no new gameplay rules.
- **User Story 3 (P3)**: Builds on User Story 1's `ConfigurationScreenComponent`/`BoardComponent`;
  independent of User Story 2.

### Within Each User Story

- Tests are written first and must fail before their corresponding implementation task starts
  (FR-013 requires them; this is not optional for this project).
- Services before components (components in Phase 3 depend on the services built earlier in the same
  phase).
- Story complete and checkpointed before the next priority starts, per `plan.md` Next Steps.

### Parallel Opportunities

- All Setup tasks marked `[P]` (T003–T005) can run in parallel once T001–T002 land.
- All Foundational `[P]` tasks (T007) can run alongside T006/T008–T010 where files don't overlap.
- All six User Story 1 test tasks (T011–T016) can be written in parallel — different files/spec
  blocks, no dependencies between them.
- Within User Story 2, T025/T026 (styling and assets) can run in parallel; T027–T030 depend on T025
  and on the relevant User Story 1 service/component.
- User Story 3's T032/T033 can run in parallel with any User Story 2 task once User Story 1 is done.

---

## Parallel Example: User Story 1 Tests

```bash
# Launch all six User Story 1 test-writing tasks together (different spec files/blocks):
Task: "Unit tests for board-generation invariants in src/app/services/game.service.spec.ts"
Task: "Unit tests for the clear-path search's single-visit/no-throw behavior in src/app/services/path-creator.service.spec.ts"
Task: "Unit tests for the facing/turn/advance state machine in src/app/services/player.service.spec.ts"
Task: "Unit tests for shoot-in-facing-direction collision in src/app/services/player.service.spec.ts"
Task: "Unit tests for the exit action's three outcomes in src/app/services/player.service.spec.ts"
Task: "Unit tests confirming one message per perception type in src/app/services/messages.service.spec.ts"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup.
2. Complete Phase 2: Foundational (blocks everything else).
3. Complete Phase 3: User Story 1 — write the six test files, watch them fail, then implement T017–T024.
4. **STOP and VALIDATE**: manually play a full round in the dev server per Constitution Principle VI;
   confirm every `game-rules.md` §2–§5 rule against `spec.md` User Story 1's acceptance scenarios.
5. This is a legitimate demo/stopping point — the assignment's actual pass/fail bar is met here.

### Incremental Delivery

1. Setup + Foundational → foundation ready.
2. User Story 1 → validate independently → this is the MVP.
3. User Story 2 → validate independently (full US1 regression + visual/UX review) → richer game.
4. User Story 3 → validate independently → polish.
5. Polish phase → README, cleanup, final full regression.

### Notes

- `[P]` tasks touch different files with no dependency on an incomplete task.
- `[Story]` labels map every user-story-phase task back to `spec.md` for traceability.
- Commit after each task or logical group, referencing this feature directory
  (`specs/001-angular-modernization/`) per Constitution → Development Workflow.
- Difficulty presets (`spec.md` User Story 3, deferred) intentionally have no task above — do not add
  one without first amending `spec.md`.
