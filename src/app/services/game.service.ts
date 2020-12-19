import { PathLocationStrategy } from '@angular/common';
import { Injectable } from '@angular/core';
import { GameConfiguration } from '../core/models/configuration';
import {
  AxisDirection,
  Board,
  BoardCoordenate,
  Cell,
  LocationPath,
  PathFinderStatus,
  SearchebleCellAttr,
  Wall,
} from '../core/models/game';
import { SeedService } from './seed.service';

@Injectable({
  providedIn: 'root',
})
export class GameService {
  constructor(private seedService: SeedService) {}

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
    let escapeIndex = this.seedService.getEscapeRandomNumber(
      cells.length,
      cells[0].length
    );
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
        if (!this.isCellAlreadyTaken(cube)) {
          availableCells.push(cube);
        }
      }
    }
    return availableCells;
  }

  createaPathToGold(cells: Cell[][]) {
    let gold;
  }

  /**
   * Cell will be considered taken when one of
   * the following statements it is true:
   * Has the Wumpus
   * Has a Pit
   * Has the escapeCell
   * Has gold
   */
  isCellAlreadyTaken(cell: Cell): boolean {
    return cell.isEscape || cell.isPit || cell.hasGold || cell.isWumpus;
  }

  createCleanPathToGold(cells: Cell[][]) {
    let escapeCell = this.findSpecificCell(cells, SearchebleCellAttr.isEscape);
    let path = this.findPath(cells, escapeCell);
    console.log('PATH: ', path);
  }

  findSpecificCell(board: Cell[][], attr): Cell {
    for (let i: number = 0; i < board.length; i++) {
      for (let j: number = 0; j < board[i].length; j++) {
        let cube = board[i][j];
        if (cube[attr]) {
          return cube;
        }
      }
    }
    return null;
  }

  findPath(board: Cell[][], escapeCell: Cell) {
    let distanceFromTop = escapeCell.coordinateY;
    let distanceFromLeft = escapeCell.coordinateX;

    // Each "location" will store its coordinates
    // and the shortest path required to arrive there
    let location: LocationPath = {
      distanceFromTop: distanceFromTop,
      distanceFromLeft: distanceFromLeft,
      path: [],
      status: PathFinderStatus.Start,
    };

    // Initialize the queue with the start location already inside
    let queue = [location];

    // Loop through the board searching for the gold
    while (queue.length > 0) {
      // Take the first location off the queue
      let currentLocation = queue.shift();

      let newLocation;
      // Explore North
      newLocation = this.exploreInDirection(
        currentLocation,
        AxisDirection.North,
        board
      );
      if (newLocation.status === PathFinderStatus.Gold) {
        return newLocation.path;
      }
      this.checkPushLocationToQueue(newLocation, queue);

      // Explore East
      newLocation = this.exploreInDirection(
        currentLocation,
        AxisDirection.East,
        board
      );
      if (newLocation.status === PathFinderStatus.Gold) {
        return newLocation.path;
      }
      this.checkPushLocationToQueue(newLocation, queue);

      // Explore South
      newLocation = this.exploreInDirection(
        currentLocation,
        AxisDirection.South,
        board
      );
      if (newLocation.status === PathFinderStatus.Gold) {
        return newLocation.path;
      }
      this.checkPushLocationToQueue(newLocation, queue);

      // Explore West
      newLocation = this.exploreInDirection(
        currentLocation,
        AxisDirection.West,
        board
      );
      if (newLocation.status === PathFinderStatus.Gold) {
        return newLocation.path;
      }
      this.checkPushLocationToQueue(newLocation, queue);
    }

    // No valid path found
    return false;
  }

  checkPushLocationToQueue(newLocation: LocationPath, queue: LocationPath[]) {
    if (newLocation.status === PathFinderStatus.Valid) {
      queue.push(newLocation);
    }
  }

  // This function will check a location's status
  // (a location is "valid" if it is on the board, is not an "obstacle",
  // and has not yet been visited by our algorithm)
  locationStatus(location: LocationPath, board: Cell[][]): PathFinderStatus {
    let boardSize = board.length;
    let coordY = location.distanceFromTop;
    let coordX = location.distanceFromLeft;
    // Out of the limits of the board
    if (
      location.distanceFromLeft < 0 ||
      location.distanceFromLeft >= boardSize ||
      location.distanceFromTop < 0 ||
      location.distanceFromTop >= boardSize
    ) {
      return PathFinderStatus.Invalid;
    }

    if (board[coordY][coordX].hasGold) {
      return PathFinderStatus.Gold;
    }

    if (this.isCellAlreadyTaken(board[coordY][coordX])) {
      // location is either an obstacle or has been visited
      return PathFinderStatus.Blocked;
    }

    return PathFinderStatus.Valid;
  }

  // Explores the grid from the given location in the given
  // direction
  exploreInDirection(
    currentLocation: LocationPath,
    direction: AxisDirection,
    board: Cell[][]
  ) {
    let newPath = currentLocation.path.slice();
    let dft = currentLocation.distanceFromTop;
    let dfl = currentLocation.distanceFromLeft;

    switch (direction) {
      case AxisDirection.North:
        dft -= 1;
        break;
      case AxisDirection.East:
        dfl += 1;
        break;
      case AxisDirection.South:
        dft += 1;
        break;
      case AxisDirection.West:
        dfl -= 1;
        break;
    }

    newPath.push({ X: dfl, Y: dft });

    let newLocation = {
      distanceFromTop: dft,
      distanceFromLeft: dfl,
      path: newPath,
      status: PathFinderStatus.Unknown,
    };

    newLocation.status = this.locationStatus(newLocation, board);

    // If this new location is valid, mark it as 'Visited'
    if (newLocation.status === PathFinderStatus.Valid) {
      board[newLocation.distanceFromTop][newLocation.distanceFromLeft].status =
        PathFinderStatus.Valid;
    }

    return newLocation;
  }
}
