import { BoardCoordinate, Cell, Direction } from '../models/game';

/**
 * A cell is unavailable for new features (gold/Wumpus/pits) once it is the escape cell, a pit,
 * holds gold, holds the Wumpus, or sits on the guaranteed clear path to the gold.
 */
export function isCellAlreadyTaken(cell: Cell): boolean {
  return cell.isEscape || cell.isPit || cell.hasGold || cell.isWumpus || cell.isClearPath;
}

export function getAvailableCells(cells: Cell[][]): Cell[] {
  return cells.flat().filter((cell) => !isCellAlreadyTaken(cell));
}

export function findCell(cells: Cell[][], predicate: (cell: Cell) => boolean): Cell | null {
  for (const row of cells) {
    const found = row.find(predicate);
    if (found) {
      return found;
    }
  }
  return null;
}

export function isCoordinateInvalid(
  coordinate: BoardCoordinate,
  boardSizeX: number,
  boardSizeY: number,
): boolean {
  return coordinate.x < 0 || coordinate.x >= boardSizeX || coordinate.y < 0 || coordinate.y >= boardSizeY;
}

export function getAdjacentCoordinate(
  direction: Direction,
  coordinate: BoardCoordinate,
): BoardCoordinate {
  switch (direction) {
    case Direction.North:
      return { x: coordinate.x, y: coordinate.y - 1 };
    case Direction.South:
      return { x: coordinate.x, y: coordinate.y + 1 };
    case Direction.East:
      return { x: coordinate.x + 1, y: coordinate.y };
    case Direction.West:
      return { x: coordinate.x - 1, y: coordinate.y };
  }
}

/** Returns `null` when the neighbor would be off the board — this grid's only "wall" is its edge. */
export function getAdjacentCell(cells: Cell[][], cell: Cell, direction: Direction): Cell | null {
  const boardSizeY = cells.length;
  const boardSizeX = cells[0].length;
  const neighbor = getAdjacentCoordinate(direction, { x: cell.coordinateX, y: cell.coordinateY });
  if (isCoordinateInvalid(neighbor, boardSizeX, boardSizeY)) {
    return null;
  }
  return cells[neighbor.y][neighbor.x];
}

/**
 * Random index among the board's perimeter (wall) cells, used to place the escape cell —
 * game-rules.md §5 / legacy-baseline.md §2 ("Escape Cell must be on a wall").
 */
export function getEscapeRandomIndex(cellsX: number, cellsY: number): number {
  const perimeterCellCount = (cellsX - 1) * 2 + (cellsY - 1) * 2 - 4;
  return Math.floor(Math.random() * perimeterCellCount);
}
