import { Cell, SearcheableCellAttr } from '../models/game';

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
  return cell.isEscape || cell.isPit || cell.hasGold || cell.isWumpus;
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
