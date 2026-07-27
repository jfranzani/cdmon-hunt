<!--
Sync Impact Report
- Version change: 1.0.0 → 1.1.0
- Modified principles:
  - I. "Gameplay Fidelity by Default" → "Gameplay Fidelity to the Canonical Rules" — the
    authoritative source of truth is now `specs/001-angular-modernization/game-rules.md` (the
    original assignment brief), not the legacy Angular 10 code's observed behavior. The legacy
    code is demoted to an implementation reference that is known to diverge from the brief in
    several places.
  - VI. "Visual & UX Quality, Verified in the Browser" — added the assignment's required minimal
    UI floor (buttons per command + text output box) as the primary interface; keyboard shortcuts
    are now explicitly an additive enhancement, not the primary input model.
- Added sections: none (existing sections amended in place)
- Removed sections: none
- Templates requiring updates:
  - .specify/templates/plan-template.md ✅ no changes needed (Constitution Check
    gate is generic and already references "constitution file")
  - .specify/templates/spec-template.md ✅ no changes needed (generic, principle
    I's baseline-preservation language is enforced via spec content, not template
    structure)
  - .specify/templates/tasks-template.md ✅ no changes needed (task categorization is generic)
  - .claude/skills/speckit-*/SKILL.md ✅ no agent-specific references to update
- Follow-up TODOs: none
-->

# Hunt the Wumpus (cdmon-hunt) Constitution

## Core Principles

### I. Gameplay Fidelity to the Canonical Rules
`specs/001-angular-modernization/game-rules.md` — the original assignment brief this project was
built against — is the authoritative source of truth for gameplay rules, not the legacy Angular 10
code's observed behavior. `specs/001-angular-modernization/legacy-baseline.md` documents what the
shipped code actually does and remains a useful implementation reference, but where it diverges from
`game-rules.md` (facing-direction movement vs. free movement, the missing explicit "exit" action, the
dead wall-bump message, etc. — see `game-rules.md` §6), the brief wins by default. Any feature spec
MUST explicitly state, per rule, whether it follows `game-rules.md`, deliberately preserves a legacy
behavior instead (with rationale), or introduces a new improvement beyond either. Silently altering
gameplay behavior during implementation (i.e. a change not called out in an approved `spec.md`) is a
constitution violation. The board-generation invariants shared by both documents (pits never block
the golden path, pits never sit on the escape/gold/Wumpus cell, escape cell is always on a wall)
remain non-negotiable unless a spec explicitly revises them.

### II. Modern, Idiomatic Angular
New and rewritten code MUST target the latest stable Angular release available
at the time the work is done, using standalone components/directives/pipes
(no `NgModule`-based feature modules), the signals APIs for component and
shared state, and the modern control-flow syntax (`@if`/`@for`/`@switch`).
TypeScript strict mode MUST stay enabled. Legacy-only dependencies (jQuery,
Protractor, TSLint) MUST NOT be reintroduced; their replacements are chosen in
each feature's `plan.md`, not improvised during coding.

### III. Spec-Driven Delivery (NON-NEGOTIABLE)
No application code (features, refactors, or gameplay/visual changes) is
written without an approved `spec.md` under `specs/` for that unit of work,
followed by `plan.md` and `tasks.md` before implementation begins. Ad hoc
scope creep during `/speckit-implement` MUST be pushed back into the spec (via
`/speckit-specify` amendment) rather than implemented silently. This
constitution supersedes any conflicting ad hoc practice.

### IV. Test Discipline
Every game-logic unit (board generation, movement, shooting/collision,
path-finding, configuration validation) MUST have unit tests that assert the
rule invariants in `legacy-baseline.md` §8, not just line coverage. UI
components that drive gameplay MUST have component tests for their primary
interaction paths (move, shoot, win, die, reconfigure). A task is not "done"
until its tests exist and pass; tests are not deleted or skipped to make CI
green.

### V. Simplicity & YAGNI
Implement the smallest change that satisfies the current spec's acceptance
criteria. Do not introduce state-management libraries, abstractions, or
configuration options the current spec does not require. Speculative
generality ("we might need this later") is deferred until a spec actually
needs it.

### VI. Visual & UX Quality, Verified in the Browser
Every change that affects rendering, gameplay feel, or interaction MUST be
manually exercised in a running dev server (golden path + at least one edge
case: dying, winning, running out of arrows, exiting empty-handed) before
being marked complete. Passing unit/component tests is necessary but not
sufficient evidence of a working feature. The required minimal interface —
one clearly labeled button per user command (advance, turn left, turn right,
shoot, exit) plus a text/log output area — per `game-rules.md` §7 is the
primary, always-functional input model; keyboard shortcuts and richer visuals
are additive enhancements layered on top, never a replacement for the button
+ text-output floor.

## Technology Stack Constraints

- **Framework**: Latest stable Angular, standalone APIs only, signals for
  state where practical. `ng update` is the preferred path for staying
  current; avoid pinning to an old major once a spec starts the migration.
- **Language**: TypeScript in strict mode.
- **Styling**: SCSS is retained; the specific UI/component library (keep
  ng-bootstrap, replace it, or go bespoke) is a `plan.md` decision per
  feature, justified against Principle V.
- **State**: Angular services + signals are the default. A dedicated state
  library MUST be justified in `plan.md`'s Complexity Tracking if proposed.
- **Testing**: Karma/Jasmine may be replaced (e.g. with Jest or Vitest) if a
  `plan.md` justifies it; whichever is chosen must run in CI-equivalent
  headless mode.
- **No jQuery, no direct DOM manipulation** in components (e.g. the legacy
  `CellComponent.nativeElement.className` pattern) — use Angular bindings
  (`[class]`, `[ngClass]`, host bindings) instead.
- **Localization**: All existing player-facing copy is Spanish. A feature spec
  MUST state explicitly if it introduces an i18n layer or keeps hardcoded
  Spanish strings; do not silently mix languages.

## Development Workflow

1. Work proceeds through the Spec Kit pipeline: `/speckit-constitution` (this
   file) → `/speckit-specify` → optionally `/speckit-clarify` →
   `/speckit-plan` → optionally `/speckit-checklist` → `/speckit-tasks` →
   optionally `/speckit-analyze` → `/speckit-implement`.
2. Each feature spec MUST cross-reference `game-rules.md` (and, where relevant,
   `legacy-baseline.md` for implementation-level detail) for any gameplay rule
   it touches, explicitly marking it "follows the brief," "preserves a legacy
   behavior (rationale)," or "new improvement (rationale)".
3. This is a solo-maintained project: there is no external PR-approval gate,
   but a change that violates this constitution or skips the spec pipeline
   MUST NOT be merged to `master` — self-review against this document is
   the required check before merging.
4. Commits and PRs should reference the spec/feature directory they implement
   (e.g. `specs/001-angular-modernization/`).

## Governance

This constitution supersedes ad hoc engineering decisions for this project.
Amendments are made via `/speckit-constitution`, which MUST update the
version per semantic versioning (MAJOR: incompatible principle removal/
redefinition; MINOR: new principle or materially expanded guidance; PATCH:
clarification/typo fixes) and MUST re-check `plan-template.md`,
`spec-template.md`, and `tasks-template.md` for consistency as part of the
same amendment. Compliance is self-reviewed against this document before any
merge to `master`.

**Version**: 1.1.0 | **Ratified**: 2026-07-27 | **Last Amended**: 2026-07-27
