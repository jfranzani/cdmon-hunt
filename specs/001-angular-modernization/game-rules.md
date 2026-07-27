# Canonical Game Rules: Hunt the Wumpus Technical Test

**Purpose**: This document is a structured, English-language rendering of the original assignment
brief for this project (a technical test, apparently for CDMON, given the repo name). It is the
**authoritative source of truth for gameplay rules** — it outranks `legacy-baseline.md`, which only
documents what the shipped Angular 10 code happens to do. Where the legacy code diverges from this
brief (and it does, in a few places — see §6), the divergence is a **defect to fix**, not a rule to
preserve, unless a spec explicitly decides otherwise and records why.

The original brief is in Spanish; each rule below is translated/restated, with the Spanish game term
kept in parentheses on first use since it also names the in-game perception/message the player sees.

## 1. Premise

The player character is a hunter (**el cazador**) searching for a gold ingot (**un lingote de oro**)
on an n×n grid. Hazards along the way:

- **Bottomless pits** (**pozos sin fondo**): stepping into one kills the hunter.
- **The Wumpus**: a monster that kills the hunter if they ever occupy the same cell.

The program must let the user issue commands to the hunter and print what the hunter perceives after
each action.

## 2. Perceptions (restricted to the hunter's current cell)

1. The hunter perceives if the Wumpus is in their cell (i.e., this is how/why they die there).
2. In cells adjacent to the Wumpus, the hunter perceives its **stench** (**hedor**).
3. In cells adjacent to a pit, the hunter perceives a **breeze** (**brisa**).
4. In the cell where the gold is, the hunter perceives its **glimmer** (**brillo**).
5. If the hunter advances into a wall, they perceive the **impact/bump** (**choque**).
6. When the hunter kills the Wumpus, they perceive its **scream** (**grito**).

## 3. Actions available to the user

a. **Advance** (**Avanzar**) — move one cell forward in the direction the hunter is currently facing.
b. **Turn** (**Girar**) 90° left or right — changes the hunter's facing direction; does not move them.
c. **Shoot an arrow** (**Lanzar una flecha**) — the arrow travels, in the hunter's current facing
   direction, until it reaches the Wumpus or hits a wall.
d. **Exit** (**Salir**) — only valid while the hunter is standing on the starting/exit cell.

This is a **facing-direction movement model** (classic Wumpus World), not free omnidirectional
movement: the hunter has a heading (N/E/S/W) that only changes via "turn," and "advance"/"shoot" both
act relative to that heading. This is a deliberate divergence from the legacy Angular 10 code, which
lets the player move in any of the 4 absolute directions directly and has no facing/turning/exit
concept at all (see `legacy-baseline.md` §3, §7).

## 4. Death & win conditions

- The hunter dies if they enter a pit, or occupy a cell where the Wumpus is alive.
- **Hypothetical objective**: find the gold and return to the exit cell as fast as possible — alive.
- "Exit" (action d) is only usable on the exit cell, and is how a round formally ends. Whether the
  hunter is carrying the gold at that moment determines whether the round counts as a win — see the
  Clarifications in `spec.md` for the exact behavior chosen (the brief states the objective but does
  not spell out what happens if the hunter exits without the gold).

## 5. Configuration parameters

- Number of cells on the board (**n×n** — square, per the brief).
- Number of pits.
- Number of arrows available to the hunter.

## 6. How this differs from the legacy Angular 10 code

`legacy-baseline.md` documents the actual shipped behavior of the original app. Comparing it against
this brief, the legacy code took shortcuts that this modernization is expected to correct, not
preserve, unless a spec explicitly says otherwise:

1. **No facing/turning.** Legacy movement is 4 absolute directions via arrow keys; there is no hunter
   heading, no "turn left/right" action. **Must be added per §3.**
2. **No explicit "Exit" action.** Legacy wins automatically the instant the player steps onto the
   escape cell while carrying gold; there's no separate "Salir" command, and no path to end a round by
   exiting the cave without the gold. **Must be added per §3–§4.**
3. **Shooting direction.** Legacy lets the player pick any of the 4 directions to shoot, independent of
   movement mode. Under the facing model, the arrow travels in the hunter's current facing direction
   (§3c) — no separate direction picker is needed once facing/turning exists.
4. **Wall-bump perception is dead code.** `ConsoleMessages.wallAhead` exists in the legacy model but is
   never triggered — advancing into a wall is silently a no-op. The brief explicitly requires a
   "choque" perception (§2.5). **Must be fixed** (this was already flagged as baseline §7.1; this
   document makes it a hard requirement, not just a nice-to-have cleanup).
5. **Board shape.** The brief specifies a square n×n board; the legacy code supports independent
   `cellsX`/`cellsY`. Kept as a superset (still configurable width/height, defaulting to square) rather
   than a strict restriction — see `spec.md` Assumptions.
6. **Rest of the ruleset matches.** Pit/Wumpus death, arrow-kills-Wumpus-and-clears-stench, breeze/
   stench/glimmer perceptions, and the configurable pit/arrow/board-size parameters are consistent
   between the brief and the legacy code (see `legacy-baseline.md` §2, §4, §8) and are preserved.

## 7. Deliverable requirements (process, not gameplay — see `constitution.md` / `plan.md`)

- Single Page Application, front-end only, in one of the latest Angular versions — no backend
  interaction; all game logic runs client-side.
- Two screens: (1) start a new game / configure parameters, (2) play the game.
- The play screen's required UI is **minimal**: simple buttons for each user command (a–d above) and
  a text box for system output (the perceptions/log). Any other visual element is optional — i.e. it's
  a floor, not a ceiling: richer graphics are allowed and desired (this modernization's User Story 2),
  as long as the buttons + text-output floor still works.
- Unit tests for all game components, in the candidate's (here: the project's) preferred testing
  framework.
- Source published to the given git repository, including instructions to run the application.
