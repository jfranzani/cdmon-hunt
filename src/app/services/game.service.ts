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

  getEscapeRandomNumber(colsAmunt: number, rowsAmount: number): number {
    let totalRows = (colsAmunt - 1) * 2 + (rowsAmount - 1) * 2 - 4;
    return Math.floor(Math.random() * totalRows);
  }

  addEscapeCell(cells: Cell[][], escapeIndex: number) {
    let wallIndex = 0;
    for (let i = 0; i < cells.length; i++) {
      for (let j = 0; j < cells[i].length; j++) {
        let cube = cells[i][j];
        if (this.isWall(cube.wall)) {
          if (wallIndex === escapeIndex) {
            cube.isEscape = true;
            return;
          } else {
            wallIndex++;
          }
        }
      }
    }
  }

  isWall(wall: Wall) {
    return wall.top || wall.bottom || wall.left || wall.right;
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
    if (indexRow === totalRows - 1) {
      wall.bottom = true;
    }
    // Left Wall
    if (indexCol === 0) {
      wall.left = true;
    }
    // Right Wall
    if (indexCol === totalColumns - 1) {
      wall.right = true;
    }
    return wall;
  }

  addPits(amountOfPits) {}
}
