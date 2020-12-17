import { Injectable } from '@angular/core';
import { GameConfiguration } from '../core/models/configuration';
import { Board, Cell, Wall } from '../core/models/game';

@Injectable({
  providedIn: 'root',
})
export class GameService {
  private arrows: number;
  private pits: number;
  private wumpus = 1;

  constructor() {}

  getDefaultGameSettings(): GameConfiguration {
    return {
      cellsX: 8,
      cellsY: 8,
      pits: 1,
      arrows: 1,
    };
  }

  createEmptyBoard(gameSetting: GameConfiguration): Board {
    const cells: Cell[][] = [];
    const colsY = +gameSetting.cellsY;
    const colsX = +gameSetting.cellsX;
    let board: Board = new Board();
    let wall: Wall;
    let number = 1;
    for (let i: number = 0; i < colsX; i++) {
      cells[i] = [];
      for (let j: number = 0; j < colsY; j++) {
        wall = this.createWall(colsY, colsX, i, j);
        cells[i][j] = new Cell(number, wall);
        number++;
      }
    }
    board.cells = cells;
    return board;
  }

  /**
   * Create the walls of the board
   * @param totalColumns
   * @param totalRows
   * @param indexRow
   * @param indexCol
   */
  createWall(
    totalColumns: number,
    totalRows: number,
    indexRow: number,
    indexCol: number
  ) {
    let wall = new Wall();
    // Top Wall
    if (indexRow === 0) {
      wall.top = true;
    }
    // Bottom Wall
    if (indexRow === totalRows) {
      wall.bottom = true;
    }
    // Left Wall
    if (indexCol === 0) {
      wall.left = true;
    }
    // Right Wall
    if (indexCol === totalColumns) {
      wall.right = true;
    }
    return wall;
  }

  addEscapeCell(cells: Cell[][]) {
    for (var i = 0; i < cells.length; i++) {
      var cube = cells[i];
      for (var j = 0; j < cube.length; j++) {
        cells[i][j] = cube[j];
      }
    }
  }

  addPits(amountOfPits) {}
}
