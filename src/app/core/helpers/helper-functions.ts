import {
  AxisDirection,
  BoardCoordinate,
  Cell,
  SearcheableCellAttr,
} from '../models/game';

/**
 * Get the random number to locate the escape cell
 * @param colsAmount
 * @param rowsAmount
 */
export function getEscapeRandomNumber(
  colsAmount: number,
  rowsAmount: number
): number {
  let totalRows = (colsAmount - 1) * 2 + (rowsAmount - 1) * 2 - 4;
  return Math.floor(Math.random() * totalRows);
}

/**
 * Cell will be considered taken when one of
 * the following statements it is true:
 * Has the Wumpus
 * Has a Pit
 * Has the escapeCell
 * Has gold
 */
export function isCellAlreadyTaken(cell: Cell): boolean {
  return (
    cell.isEscape ||
    cell.isPit ||
    cell.hasGold ||
    cell.isWumpus ||
    cell.isClearPath
  );
}

/**
 * Find a specific cell given an valid attribute
 * @param board cells in the board
 * @param attr
 */
export function findSpecificCell(
  board: Cell[][],
  attr: SearcheableCellAttr
): Cell {
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

/**
 * Get all the cells that can be occupied on the board
 * @param cells
 */
export function getAvailableCells(cells: Cell[][]): Cell[] {
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

/**
 * Get the coordinates for an adjacent cell given a specifc coordinate
 * @param direction
 * @param coordinate
 */
export function getAdjancentCoordinateBasedOnDirection(
  direction: AxisDirection,
  coordinate: BoardCoordinate
): BoardCoordinate {
  let newCoordinate: BoardCoordinate = { ...coordinate };
  switch (direction) {
    case AxisDirection.North:
      newCoordinate.Y -= 1;
      break;
    case AxisDirection.East:
      newCoordinate.X += 1;
      break;
    case AxisDirection.South:
      newCoordinate.Y += 1;
      break;
    case AxisDirection.West:
      newCoordinate.X -= 1;
      break;
  }
  return newCoordinate;
}

/**
 * Check the current coordinates are valid
 * @param coordinateX
 * @param coordinateY
 * @param boardSize
 */
export function isCoordinateInvalid(
  coordinateX: number,
  coordinateY: number,
  boardSize: number
) {
  return (
    coordinateX < 0 ||
    coordinateX >= boardSize ||
    coordinateY < 0 ||
    coordinateY >= boardSize
  );
}

/**
 * It will return an adjacent cell given a specific cell and direction
 * @param cells
 * @param currentCell
 * @param direction
 */
export function getAdjacentCell(
  cells: Cell[][],
  currentCell: Cell,
  direction: AxisDirection
): Cell {
  let coordinate: BoardCoordinate = {
    X: currentCell.coordinateX,
    Y: currentCell.coordinateY,
  };
  let newCoordinate = getAdjancentCoordinateBasedOnDirection(
    direction,
    coordinate
  );
  if (!isCoordinateInvalid(newCoordinate.X, newCoordinate.Y, cells.length)) {
    return cells[newCoordinate.Y][newCoordinate.X];
  } else {
    return null;
  }
}
