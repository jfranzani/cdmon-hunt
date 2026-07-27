import { TestBed } from '@angular/core/testing';

import { GameConfiguration } from '../core/models/configuration';
import { Cell, isWall } from '../core/models/game';
import { GameService } from './game.service';

describe('GameService', () => {
  let service: GameService;

  const config: GameConfiguration = { cellsX: 8, cellsY: 8, pits: 3, arrows: 2 };

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(GameService);
  });

  function flat(cells: Cell[][]): Cell[] {
    return cells.flat();
  }

  // legacy-baseline.md §8 invariants (FR-001), run repeatedly since generation is randomized.
  for (let run = 0; run < 25; run++) {
    it(`generates a board satisfying every invariant (run ${run})`, () => {
      const board = service.generateBoard(config);
      const cells = flat(board.cells);

      const escapeCell = cells.find((c) => c.isEscape);
      const goldCell = cells.find((c) => c.hasGold);
      const wumpusCell = cells.find((c) => c.isWumpus);
      const pitCells = cells.filter((c) => c.isPit);

      expect(escapeCell).withContext('escape cell exists').toBeTruthy();
      expect(isWall(escapeCell!.wall)).withContext('escape cell is on a wall').toBeTrue();

      expect(goldCell).withContext('gold cell exists').toBeTruthy();
      expect(wumpusCell).withContext('wumpus cell exists').toBeTruthy();
      expect(goldCell).not.toBe(wumpusCell);
      expect(goldCell).not.toBe(escapeCell);
      expect(wumpusCell).not.toBe(escapeCell);

      expect(pitCells.length).toBe(config.pits);
      for (const pit of pitCells) {
        expect(pit.isEscape).withContext('pit not on escape cell').toBeFalse();
        expect(pit.hasGold).withContext('pit not on gold cell').toBeFalse();
        expect(pit.isWumpus).withContext('pit not on wumpus cell').toBeFalse();
        expect(pit.isClearPath).withContext('pit not on the clear path').toBeFalse();
      }

      expect(board.cells[escapeCell!.coordinateY][escapeCell!.coordinateX].hasPlayer).toBeTrue();
      expect(board.hunter.arrows).toBe(config.arrows);
    });
  }
});
