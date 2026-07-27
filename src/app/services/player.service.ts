import { Injectable, inject } from '@angular/core';

import { findCell, getAdjacentCell } from '../core/helpers/helper-functions';
import {
  ALL_DIRECTIONS,
  Board,
  Cell,
  Direction,
  ExitOutcome,
  Perception,
  TURN_LEFT,
  TURN_RIGHT,
} from '../core/models/game';
import { MessagesService } from './messages.service';

/**
 * The hunter's actions — turn, advance, shoot, exit — implementing game-rules.md §2–§4 (FR-002,
 * FR-004, FR-005, FR-006). Every method takes the `Board` for the round it acts on and mutates it
 * in place; the caller (`BoardComponent`) is responsible for publishing the change to its signal.
 */
@Injectable({
  providedIn: 'root',
})
export class PlayerService {
  private readonly messages = inject(MessagesService);

  turnLeft(board: Board): void {
    board.log = [];
    board.lastShot = null;
    board.hunter.facing = TURN_LEFT[board.hunter.facing];
  }

  turnRight(board: Board): void {
    board.log = [];
    board.lastShot = null;
    board.hunter.facing = TURN_RIGHT[board.hunter.facing];
  }

  /** Moves the hunter one cell in its current facing, or reports "choque" if blocked. */
  advance(board: Board): void {
    board.log = [];
    board.lastShot = null;
    const hunterCell = this.findHunterCell(board.cells);
    const nextCell = getAdjacentCell(board.cells, hunterCell, board.hunter.facing);

    if (!nextCell) {
      this.pushLog(board, Perception.Choque);
      return;
    }
    if (nextCell.isWumpus) {
      this.die(board, Perception.WumpusDeath);
      return;
    }
    if (nextCell.isPit) {
      this.die(board, Perception.PitDeath);
      return;
    }

    hunterCell.hasPlayer = false;
    nextCell.hasPlayer = true;
    board.hunter.movesTaken++;

    let perceivedSomething = false;
    if (nextCell.hasBreeze) {
      this.pushLog(board, Perception.Breeze);
      perceivedSomething = true;
    }
    if (nextCell.hasStink) {
      this.pushLog(board, Perception.Stench);
      perceivedSomething = true;
    }
    if (nextCell.hasGold) {
      this.pushLog(board, Perception.Glimmer);
      board.hunter.hasGold = true;
      perceivedSomething = true;
    }
    if (!perceivedSomething) {
      this.pushLog(board, Perception.EmptyCell);
    }
  }

  /** Fires an arrow in the hunter's current facing; pits don't affect its travel. */
  shoot(board: Board): void {
    board.log = [];
    board.lastShot = null;
    if (board.hunter.arrows < 1) {
      this.pushLog(board, Perception.NoArrows);
      return;
    }
    board.hunter.arrows--;
    board.hunter.arrowsUsed++;
    const hunterCell = this.findHunterCell(board.cells);
    const { cell: impactCell, hitWumpus } = this.fireArrow(board, hunterCell, board.hunter.facing);
    board.lastShot = {
      from: { x: hunterCell.coordinateX, y: hunterCell.coordinateY },
      to: { x: impactCell.coordinateX, y: impactCell.coordinateY },
      hitWumpus,
    };
  }

  /** Only valid on the escape cell — the control is also disabled in the UI (FR-005). */
  canExit(board: Board): boolean {
    return this.findHunterCell(board.cells).isEscape;
  }

  exit(board: Board): void {
    board.log = [];
    board.lastShot = null;
    if (!this.canExit(board)) {
      return;
    }
    if (board.hunter.hasGold) {
      board.hunter.exitOutcome = ExitOutcome.Won;
      this.pushLog(board, Perception.Won);
    } else {
      board.hunter.exitOutcome = ExitOutcome.ExitedWithoutGold;
      this.pushLog(board, Perception.ExitedWithoutGold);
    }
  }

  private fireArrow(
    board: Board,
    fromCell: Cell,
    direction: Direction,
  ): { cell: Cell; hitWumpus: boolean } {
    const nextCell = getAdjacentCell(board.cells, fromCell, direction);
    if (!nextCell) {
      this.pushLog(board, Perception.ArrowHitWall);
      return { cell: fromCell, hitWumpus: false };
    }
    if (nextCell.isWumpus) {
      this.killWumpus(board.cells, nextCell);
      this.pushLog(board, Perception.Grito);
      return { cell: nextCell, hitWumpus: true };
    }
    return this.fireArrow(board, nextCell, direction);
  }

  private killWumpus(cells: Cell[][], wumpusCell: Cell): void {
    wumpusCell.isWumpus = false;
    for (const direction of ALL_DIRECTIONS) {
      const neighbor = getAdjacentCell(cells, wumpusCell, direction);
      if (neighbor) {
        neighbor.hasStink = false;
      }
    }
  }

  private die(board: Board, perception: typeof Perception.WumpusDeath | typeof Perception.PitDeath): void {
    board.hunter.isAlive = false;
    board.diedReason = this.messages.getMessage(perception);
    this.pushLog(board, perception);
  }

  private pushLog(board: Board, perception: Perception): void {
    board.log.push({ message: this.messages.getMessage(perception), perception });
  }

  private findHunterCell(cells: Cell[][]): Cell {
    const hunterCell = findCell(cells, (cell) => cell.hasPlayer);
    if (!hunterCell) {
      throw new Error('No cell currently holds the hunter — board is in an invalid state.');
    }
    return hunterCell;
  }
}
