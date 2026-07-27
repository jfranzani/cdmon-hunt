import { TestBed } from '@angular/core/testing';

import { Cell, Wall, createCell } from '../core/models/game';
import { PathCreatorService } from './path-creator.service';

function buildGrid(sizeX: number, sizeY: number): Cell[][] {
  let number = 1;
  const cells: Cell[][] = [];
  for (let y = 0; y < sizeY; y++) {
    const row: Cell[] = [];
    for (let x = 0; x < sizeX; x++) {
      const wall: Wall = {
        top: y === 0,
        bottom: y === sizeY - 1,
        left: x === 0,
        right: x === sizeX - 1,
      };
      row.push(createCell(number++, y, x, wall));
    }
    cells.push(row);
  }
  return cells;
}

describe('PathCreatorService', () => {
  let service: PathCreatorService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PathCreatorService);
  });

  it('finds the true shortest path on an open board without hanging', () => {
    // research.md §11: the legacy BFS had no working visited-set, so it could requeue the same
    // cell an unbounded number of times on an open board like this one. This is a regression
    // guard: on the fixed implementation this must return quickly with the exact Manhattan
    // distance as the path length.
    const cells = buildGrid(10, 10);
    const escapeCell = cells[0][0];
    escapeCell.isEscape = true;
    const goldCell = cells[9][9];
    goldCell.hasGold = true;

    const start = performance.now();
    const path = service.findClearPath(cells, escapeCell);
    const elapsedMs = performance.now() - start;

    expect(path).not.toBeNull();
    expect(path!.length).toBe(18); // Manhattan distance from (0,0) to (9,9), gold cell included
    expect(path!.at(-1)).toEqual({ x: 9, y: 9 });
    expect(elapsedMs).toBeLessThan(500);
  });

  it('does not revisit a cell already reached by a shorter path (a board with a loop)', () => {
    // A 3x3 ring around a blocked center cell gives the search multiple ways back to the same
    // cells; the shortest path must still be found correctly.
    const cells = buildGrid(3, 3);
    const escapeCell = cells[0][0];
    escapeCell.isEscape = true;
    const goldCell = cells[2][2];
    goldCell.hasGold = true;
    cells[1][1].isPit = true; // center blocked, forces travel around the ring

    const path = service.findClearPath(cells, escapeCell);

    expect(path).not.toBeNull();
    expect(path!.length).toBe(4); // shortest route around the blocked center
    expect(path!.at(-1)).toEqual({ x: 2, y: 2 });
  });

  it('returns null instead of throwing when the gold cell is unreachable', () => {
    const cells = buildGrid(4, 4);
    const escapeCell = cells[0][0];
    escapeCell.isEscape = true;
    const goldCell = cells[3][3];
    goldCell.hasGold = true;
    // Wall off the gold cell completely with pits.
    cells[2][3].isPit = true;
    cells[3][2].isPit = true;

    expect(() => service.findClearPath(cells, escapeCell)).not.toThrow();
    expect(service.findClearPath(cells, escapeCell)).toBeNull();
  });

  it('markClearPath flags every cell on the path except the gold cell itself', () => {
    const cells = buildGrid(4, 1);
    const escapeCell = cells[0][0];
    escapeCell.isEscape = true;
    const goldCell = cells[0][3];
    goldCell.hasGold = true;

    service.markClearPath(cells, escapeCell);

    expect(cells[0][1].isClearPath).toBeTrue();
    expect(cells[0][2].isClearPath).toBeTrue();
    expect(cells[0][3].isClearPath).toBeFalse(); // the gold cell itself is not marked
  });
});
