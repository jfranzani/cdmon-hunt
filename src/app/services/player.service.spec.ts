import { TestBed } from '@angular/core/testing';

import {
  Board,
  Cell,
  Direction,
  ExitOutcome,
  Wall,
  createBoard,
  createCell,
  createHunter,
} from '../core/models/game';
import { PlayerService } from './player.service';

function buildGrid(sizeX: number, sizeY: number): Cell[][] {
  let number = 1;
  const cells: Cell[][] = [];
  for (let y = 0; y < sizeY; y++) {
    const row: Cell[] = [];
    for (let x = 0; x < sizeX; x++) {
      const wall: Wall = {
        top: y === 0,
        bottom: y === sizeY - 1,
        left: x === 0,
        right: x === sizeX - 1,
      };
      row.push(createCell(number++, y, x, wall));
    }
    cells.push(row);
  }
  return cells;
}

/** 3x3 open grid, hunter at the center (1,1) so it can move/shoot in all four directions. */
function buildBoard(facing: Direction = Direction.North, arrows = 1): Board {
  const cells = buildGrid(3, 3);
  cells[0][0].isEscape = true;
  cells[1][1].hasPlayer = true;
  return createBoard(cells, createHunter(arrows, facing));
}

describe('PlayerService', () => {
  let service: PlayerService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PlayerService);
  });

  describe('turning', () => {
    it('turnLeft rotates facing 90° without moving the hunter', () => {
      const board = buildBoard(Direction.North);
      service.turnLeft(board);
      expect(board.hunter.facing).toBe(Direction.West);
      expect(board.cells[1][1].hasPlayer).toBeTrue();
      expect(board.hunter.movesTaken).toBe(0);
    });

    it('turnRight rotates facing 90° the other way', () => {
      const board = buildBoard(Direction.North);
      service.turnRight(board);
      expect(board.hunter.facing).toBe(Direction.East);
    });

    it('a full turnLeft x4 returns to the original facing', () => {
      const board = buildBoard(Direction.North);
      service.turnLeft(board);
      service.turnLeft(board);
      service.turnLeft(board);
      service.turnLeft(board);
      expect(board.hunter.facing).toBe(Direction.North);
    });
  });

  describe('advance', () => {
    it('moves the hunter one cell in the facing direction when unblocked', () => {
      const board = buildBoard(Direction.East);
      service.advance(board);
      expect(board.cells[1][1].hasPlayer).toBeFalse();
      expect(board.cells[1][2].hasPlayer).toBeTrue();
      expect(board.hunter.movesTaken).toBe(1);
    });

    it('reports "choque" and does not move when advancing into the board edge', () => {
      const board = buildBoard(Direction.North); // hunter at (x:1,y:1) facing North
      service.advance(board); // moves to (x:1,y:0), the top row
      service.advance(board); // North again is off-board — blocked by the top wall
      expect(board.cells[0][1].hasPlayer).toBeTrue(); // cells[y][x]: still at (x:1,y:0)
      expect(board.hunter.movesTaken).toBe(1);
      expect(board.log.map((l) => l.perception)).toEqual(['Choque']);
    });

    it('kills the hunter when advancing onto the Wumpus', () => {
      const board = buildBoard(Direction.East);
      board.cells[1][2].isWumpus = true;
      service.advance(board);
      expect(board.hunter.isAlive).toBeFalse();
      expect(board.diedReason).toBeTruthy();
      expect(board.cells[1][1].hasPlayer).toBeTrue(); // never actually moved onto the Wumpus cell
    });

    it('kills the hunter when advancing into a pit', () => {
      const board = buildBoard(Direction.East);
      board.cells[1][2].isPit = true;
      service.advance(board);
      expect(board.hunter.isAlive).toBeFalse();
    });

    it('reports breeze, stench, and glimmer together when all apply to the destination', () => {
      const board = buildBoard(Direction.East);
      board.cells[1][2].hasBreeze = true;
      board.cells[1][2].hasStink = true;
      board.cells[1][2].hasGold = true;
      service.advance(board);
      const perceptions = board.log.map((l) => l.perception);
      expect(perceptions).toContain('Breeze');
      expect(perceptions).toContain('Stench');
      expect(perceptions).toContain('Glimmer');
      expect(board.hunter.hasGold).toBeTrue();
    });

    it('reports an empty cell when nothing is perceived', () => {
      const board = buildBoard(Direction.East);
      service.advance(board);
      expect(board.log.map((l) => l.perception)).toEqual(['EmptyCell']);
    });
  });

  describe('shoot', () => {
    it('kills the Wumpus in the facing direction, clears its stench, and reports the scream', () => {
      const board = buildBoard(Direction.East, 1);
      board.cells[1][2].isWumpus = true;
      // Neighbors of the Wumpus cell that real generation would have marked with stench.
      board.cells[0][2].hasStink = true; // north of the Wumpus
      board.cells[2][2].hasStink = true; // south of the Wumpus

      service.shoot(board);

      expect(board.cells[1][2].isWumpus).toBeFalse();
      expect(board.cells[0][2].hasStink).toBeFalse();
      expect(board.cells[2][2].hasStink).toBeFalse();
      expect(board.log.map((l) => l.perception)).toEqual(['Grito']);
      expect(board.hunter.arrows).toBe(0);
      expect(board.hunter.arrowsUsed).toBe(1);
    });

    it('stops at a wall and reports the arrow-hit-wall message', () => {
      const board = buildBoard(Direction.North, 1); // hunter at (1,1), nothing between it and the top wall
      service.shoot(board);
      expect(board.log.map((l) => l.perception)).toEqual(['ArrowHitWall']);
      expect(board.hunter.arrows).toBe(0);
    });

    it('is unaffected by a pit between the hunter and the Wumpus', () => {
      const board = buildBoard(Direction.East, 1);
      board.cells[1][2].isPit = true; // adjacent cell has a pit but no wall/Wumpus
      // 3x3 board: east of (1,2) is off-board, so the arrow should hit the wall past the pit.
      service.shoot(board);
      expect(board.log.map((l) => l.perception)).toEqual(['ArrowHitWall']);
    });

    it('does nothing and reports no arrows left when the hunter has zero arrows', () => {
      const board = buildBoard(Direction.East, 0);
      service.shoot(board);
      expect(board.log.map((l) => l.perception)).toEqual(['NoArrows']);
      expect(board.hunter.arrowsUsed).toBe(0);
    });
  });

  describe('exit', () => {
    it('is only available while the hunter is on the escape cell', () => {
      const board = buildBoard(); // hunter at (1,1), escape at (0,0)
      expect(service.canExit(board)).toBeFalse();
    });

    it('wins the round when exiting the escape cell with the gold', () => {
      const board = buildBoard();
      board.cells[1][1].hasPlayer = false;
      board.cells[0][0].hasPlayer = true;
      board.hunter.hasGold = true;

      expect(service.canExit(board)).toBeTrue();
      service.exit(board);

      expect(board.hunter.exitOutcome).toBe(ExitOutcome.Won);
    });

    it('ends the round without a win when exiting the escape cell without the gold', () => {
      const board = buildBoard();
      board.cells[1][1].hasPlayer = false;
      board.cells[0][0].hasPlayer = true;

      service.exit(board);

      expect(board.hunter.exitOutcome).toBe(ExitOutcome.ExitedWithoutGold);
    });

    it('does nothing when called off the escape cell', () => {
      const board = buildBoard();
      service.exit(board);
      expect(board.hunter.exitOutcome).toBeNull();
    });
  });
});
