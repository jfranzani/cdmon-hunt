import { Injectable } from '@angular/core';
import {
  findSpecificCell,
  getEscapeRandomNumber,
  isCellAlreadyTaken,
} from '../core/helpers/helper-functions';
import { GameConfiguration } from '../core/models/configuration';
import { Board, Cell, SearcheableCellAttr, Wall } from '../core/models/game';
import { PathCreatorService } from './path-creator.service';

@Injectable({
  providedIn: 'root',
})
export class GameService {
  constructor(private pathCreatorService: PathCreatorService) {}

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
        cells[i][j] = new Cell(number, i, j, wall);
        number++;
      }
    }
    board.cells = cells;
    return board;
  }

  addEscapeCell(cells: Cell[][]) {
    let escapeIndex = getEscapeRandomNumber(cells.length, cells[0].length);
    console.log('ESCAPE INDEX ', escapeIndex);
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

  /**
   * Pits
   * @param cells
   * @param amountOfPits
   */
  addPits(cells: Cell[][], amountOfPits: number) {
    for (let i: number = 0; i < cells.length; i++) {
      cells[i] = [];
      for (let j: number = 0; j < cells[i].length; j++) {}
    }
  }

  /**
   * Add the cell gold
   * @param cells
   */
  addGold(cells: Cell[][]): void {
    let availableCells = this.getAvailableCells(cells);
    console.log('availableCells:', availableCells);
    let goldNumber = Math.floor(Math.random() * availableCells.length);
    console.log('GOLD NUMBER: ', goldNumber);
    let selectedCell = availableCells.find(
      (cell, index) => index === goldNumber
    );
    selectedCell.hasGold = true;
  }

  /**
   * Add the wumpus
   * @param cells
   */
  addWumpus(cells: Cell[][]): void {
    let availableCells = this.getAvailableCells(cells);
    console.log('availableCells:', availableCells);
    let wumpusNumber = Math.floor(Math.random() * availableCells.length);
    console.log('WUMPUS NUMBER: ', wumpusNumber);
    let selectedCell = availableCells.find(
      (cell, index) => index === wumpusNumber
    );
    selectedCell.isWumpus = true;
  }

  /**
   * Get all the cells that can be occupied on the board
   * @param cells
   */
  getAvailableCells(cells: Cell[][]): Cell[] {
    let availableCells = [];
    for (let i: number = 0; i < cells.length; i++) {
      for (let j: number = 0; j < cells[i].length; j++) {
        let cube = cells[i][j];
        if (!isCellAlreadyTaken(cube)) {
          availableCells.push(cube);
        }
      }
    }
    return availableCells;
  }

  createCleanPathToGold(cells: Cell[][]) {
    let escapeCell = findSpecificCell(cells, SearcheableCellAttr.isEscape);
    let path = this.pathCreatorService.findPath(cells, escapeCell);
    console.log('PATH: ', path);
    for (let coordinate of path.slice(0, path.length - 1)) {
      let cube = cells[coordinate.Y][coordinate.X];
      cube.isClearPath = true;
    }
  }
}
