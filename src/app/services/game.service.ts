import { Injectable } from '@angular/core';
import {
  getAdjacentCell,
  getAvailableCells,
  getEscapeRandomNumber,
  isCellAlreadyTaken,
  isWall,
} from '../core/helpers/helper-functions';
import { GameConfiguration } from '../core/models/configuration';
import {
  AxisDirection,
  Board,
  Cell,
  CellAttributeToActive,
  Wall,
} from '../core/models/game';

@Injectable({
  providedIn: 'root',
})
export class GameService {
  private _board: Board;
  constructor() {}

  get board() {
    return this._board;
  }
  set board(board: Board) {
    this._board = board;
  }

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
    board.player.arrows = gameSetting.arrows;
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
    this.board = board;
    return board;
  }

  addEscapeCell(cells: Cell[][]) {
    let escapeIndex = getEscapeRandomNumber(cells.length, cells[0].length);
    let wallIndex = 0;
    for (let i = 0; i < cells.length; i++) {
      for (let j = 0; j < cells[i].length; j++) {
        let cube = cells[i][j];
        if (isWall(cube.wall)) {
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
    for (let i = 0; i < amountOfPits; i++) {
      this.addPit(cells);
    }
    this.addBreezeToPits(cells);
  }

  /**
   * Add the cell gold
   * @param cells
   */
  addGold(cells: Cell[][]): void {
    let availableCells = getAvailableCells(cells);
    let goldNumber = Math.floor(Math.random() * availableCells.length);
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
    let availableCells = getAvailableCells(cells);
    let wumpusNumber = Math.floor(Math.random() * availableCells.length);
    let selectedCell = availableCells.find(
      (cell, index) => index === wumpusNumber
    );
    selectedCell.isWumpus = true;
    this.activeAdjacentProps(
      cells,
      selectedCell,
      CellAttributeToActive.hasStink
    );
  }

  /**
   * Add a Pit
   * @param cells
   */
  addPit(cells: Cell[][]): void {
    let availableCells = getAvailableCells(cells);
    let pitNumber = Math.floor(Math.random() * availableCells.length);
    let selectedCell = availableCells.find(
      (cell, index) => index === pitNumber
    );
    selectedCell.isPit = true;
  }

  addBreezeToPits(cells: Cell[][]) {
    let availableCells = [];
    for (let i: number = 0; i < cells.length; i++) {
      for (let j: number = 0; j < cells[i].length; j++) {
        let currentCell = cells[i][j];
        if (currentCell.isPit) {
          this.activeAdjacentProps(
            cells,
            currentCell,
            CellAttributeToActive.hasBreeze
          );
        }
      }
    }
    return availableCells;
  }

  /**
   * Function to set to true any prop for any adjacent
   * free cell
   * @param cells
   * @param selectedCell
   * @param attributeToActivate
   */
  activeAdjacentProps(
    cells: Cell[][],
    selectedCell: Cell,
    attributeToActivate: CellAttributeToActive
  ) {
    let northCell = getAdjacentCell(cells, selectedCell, AxisDirection.North);
    let southCell = getAdjacentCell(cells, selectedCell, AxisDirection.South);
    let eastCell = getAdjacentCell(cells, selectedCell, AxisDirection.East);
    let westCell = getAdjacentCell(cells, selectedCell, AxisDirection.West);
    if (northCell && !isCellAlreadyTaken(northCell)) {
      northCell[attributeToActivate] = true;
    }
    if (southCell && !isCellAlreadyTaken(southCell)) {
      southCell[attributeToActivate] = true;
    }
    if (eastCell && !isCellAlreadyTaken(eastCell)) {
      eastCell[attributeToActivate] = true;
    }
    if (westCell && !isCellAlreadyTaken(westCell)) {
      westCell[attributeToActivate] = true;
    }
  }
}
