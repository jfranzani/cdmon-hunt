import { Injectable, inject } from '@angular/core';

import {
  getAdjacentCell,
  getAvailableCells,
  getEscapeRandomIndex,
  isCellAlreadyTaken,
} from '../core/helpers/helper-functions';
import { GameConfiguration } from '../core/models/configuration';
import {
  ALL_DIRECTIONS,
  Board,
  Cell,
  Direction,
  Wall,
  createBoard,
  createCell,
  createHunter,
} from '../core/models/game';
import { PathCreatorService } from './path-creator.service';

type PerceptionFlag = 'hasBreeze' | 'hasStink';

/**
 * Board generation: escape cell on a wall, gold and Wumpus on distinct available cells, a
 * guaranteed clear path from escape to gold, and pits only where they can't block that path or
 * sit on the escape/gold/Wumpus cell — legacy-baseline.md §2, game-rules.md §5 (FR-001).
 */
@Injectable({
  providedIn: 'root',
})
export class GameService {
  private readonly pathCreator = inject(PathCreatorService);

  generateBoard(config: GameConfiguration): Board {
    const cells = this.createEmptyGrid(config.cellsX, config.cellsY);

    const escapeCell = this.placeEscapeCell(cells);
    const goldCell = this.pickAvailableCell(cells);
    goldCell.hasGold = true;

    const wumpusCell = this.pickAvailableCell(cells);
    wumpusCell.isWumpus = true;
    this.activateAdjacentPerception(cells, wumpusCell, 'hasStink');

    this.pathCreator.markClearPath(cells, escapeCell);

    for (let i = 0; i < config.pits; i++) {
      const pitCell = this.pickAvailableCell(cells);
      pitCell.isPit = true;
    }
    for (const row of cells) {
      for (const cell of row) {
        if (cell.isPit) {
          this.activateAdjacentPerception(cells, cell, 'hasBreeze');
        }
      }
    }

    escapeCell.hasPlayer = true;
    const hunter = createHunter(config.arrows, this.computeInitialFacing(escapeCell.wall));

    return createBoard(cells, hunter);
  }

  private createEmptyGrid(cellsX: number, cellsY: number): Cell[][] {
    const cells: Cell[][] = [];
    let number = 1;
    for (let y = 0; y < cellsY; y++) {
      const row: Cell[] = [];
      for (let x = 0; x < cellsX; x++) {
        row.push(createCell(number++, y, x, this.createWall(cellsX, cellsY, x, y)));
      }
      cells.push(row);
    }
    return cells;
  }

  private createWall(cellsX: number, cellsY: number, x: number, y: number): Wall {
    return {
      top: y === 0,
      bottom: y === cellsY - 1,
      left: x === 0,
      right: x === cellsX - 1,
    };
  }

  private placeEscapeCell(cells: Cell[][]): Cell {
    const escapeIndex = getEscapeRandomIndex(cells[0].length, cells.length);
    let wallIndex = 0;
    for (const row of cells) {
      for (const cell of row) {
        if (this.isWallCell(cell.wall)) {
          if (wallIndex === escapeIndex) {
            cell.isEscape = true;
            return cell;
          }
          wallIndex++;
        }
      }
    }
    throw new Error('No wall cell available to place the escape cell.');
  }

  private isWallCell(wall: Wall): boolean {
    return wall.top || wall.bottom || wall.left || wall.right;
  }

  private pickAvailableCell(cells: Cell[][]): Cell {
    const available = getAvailableCells(cells);
    if (available.length === 0) {
      throw new Error('No available cells left on the board for this configuration.');
    }
    return available[Math.floor(Math.random() * available.length)];
  }

  private activateAdjacentPerception(cells: Cell[][], cell: Cell, flag: PerceptionFlag): void {
    for (const direction of ALL_DIRECTIONS) {
      const neighbor = getAdjacentCell(cells, cell, direction);
      if (neighbor && !isCellAlreadyTaken(neighbor)) {
        neighbor[flag] = true;
      }
    }
  }

  /** research.md §10: face into the board from the escape cell; top/bottom wall wins on a corner. */
  private computeInitialFacing(wall: Wall): Direction {
    if (wall.top) return Direction.South;
    if (wall.bottom) return Direction.North;
    if (wall.left) return Direction.East;
    return Direction.West;
  }
}
