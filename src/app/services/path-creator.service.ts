import { Injectable } from '@angular/core';

import {
  getAdjacentCoordinate,
  isCellAlreadyTaken,
  isCoordinateInvalid,
} from '../core/helpers/helper-functions';
import { ALL_DIRECTIONS, BoardCoordinate, Cell } from '../core/models/game';

function coordinateKey(coordinate: BoardCoordinate): string {
  return `${coordinate.x},${coordinate.y}`;
}

/**
 * Finds the shortest orthogonal path from the escape cell to the gold cell and marks the
 * intermediate cells `isClearPath`, so board generation can guarantee pits never block it
 * (game-rules.md §5 / legacy-baseline.md §2).
 *
 * Rewritten per research.md §11 / Constitution Principle VII: the original hand-written BFS set
 * a "visited" flag that was never actually read, so it could re-enqueue the same cell an unbounded
 * number of times on open/large boards. This version tracks visited cells explicitly, enqueues
 * with an index cursor instead of `Array.shift()`, and reconstructs the path via parent pointers
 * instead of copying a growing path array into every queued entry.
 */
@Injectable({
  providedIn: 'root',
})
export class PathCreatorService {
  /**
   * Returns the path from (but excluding) the escape cell to (and including) the gold cell, or
   * `null` if no path exists.
   */
  findClearPath(cells: Cell[][], escapeCell: Cell): BoardCoordinate[] | null {
    const boardSizeY = cells.length;
    const boardSizeX = cells[0].length;
    const start: BoardCoordinate = { x: escapeCell.coordinateX, y: escapeCell.coordinateY };

    const visited = new Set<string>([coordinateKey(start)]);
    const parents = new Map<string, BoardCoordinate | null>([[coordinateKey(start), null]]);
    const queue: BoardCoordinate[] = [start];
    let head = 0;

    while (head < queue.length) {
      const current = queue[head++];
      const currentCell = cells[current.y][current.x];

      if (currentCell.hasGold) {
        return this.reconstructPath(parents, current).slice(1);
      }

      for (const direction of ALL_DIRECTIONS) {
        const next = getAdjacentCoordinate(direction, current);
        if (isCoordinateInvalid(next, boardSizeX, boardSizeY)) {
          continue;
        }
        const nextKey = coordinateKey(next);
        if (visited.has(nextKey)) {
          continue;
        }
        const nextCell = cells[next.y][next.x];
        if (!nextCell.hasGold && isCellAlreadyTaken(nextCell)) {
          continue;
        }
        visited.add(nextKey);
        parents.set(nextKey, current);
        queue.push(next);
      }
    }

    return null;
  }

  /** Marks every cell on the clear path (excluding the gold cell itself) `isClearPath = true`. */
  markClearPath(cells: Cell[][], escapeCell: Cell): BoardCoordinate[] | null {
    const path = this.findClearPath(cells, escapeCell);
    if (!path) {
      return null;
    }
    for (const coordinate of path.slice(0, -1)) {
      cells[coordinate.y][coordinate.x].isClearPath = true;
    }
    return path;
  }

  private reconstructPath(
    parents: ReadonlyMap<string, BoardCoordinate | null>,
    goal: BoardCoordinate,
  ): BoardCoordinate[] {
    const path: BoardCoordinate[] = [];
    let current: BoardCoordinate | null = goal;
    while (current) {
      path.push(current);
      current = parents.get(coordinateKey(current)) ?? null;
    }
    return path.reverse();
  }
}
