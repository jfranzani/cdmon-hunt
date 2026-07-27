import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';

import { getDefaultGameConfiguration } from '../../core/models/configuration';
import {
  Board,
  Cell,
  Direction,
  Wall,
  createBoard,
  createCell,
  createHunter,
} from '../../core/models/game';
import { GameService } from '../../services/game.service';
import { StorageService } from '../../services/storage.service';
import { BoardComponent } from './board.component';

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

function buildBoard(): Board {
  const cells = buildGrid(3, 3);
  cells[0][0].isEscape = true;
  cells[1][1].hasPlayer = true;
  return createBoard(cells, createHunter(1, Direction.East));
}

describe('BoardComponent', () => {
  let fixture: ComponentFixture<BoardComponent>;
  let component: BoardComponent;
  let gameService: GameService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BoardComponent],
      providers: [provideRouter([])],
    }).compileComponents();

    gameService = TestBed.inject(GameService);
    spyOn(gameService, 'generateBoard').and.callFake(() => buildBoard());
    spyOn(TestBed.inject(StorageService), 'getGameSettings').and.returnValue(
      getDefaultGameConfiguration(),
    );

    fixture = TestBed.createComponent(BoardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('generates a board and logs the start message on init', () => {
    expect(component.board()).toBeTruthy();
    expect(component.board()!.log[0].perception).toBe('Start');
  });

  it('advance() moves the hunter and re-renders the board grid', () => {
    component.advance();
    expect(component.board()!.cells[1][2].hasPlayer).toBeTrue();
  });

  it('turnLeft()/turnRight() change facing without moving', () => {
    component.turnRight();
    expect(component.board()!.hunter.facing).toBe(Direction.South);
    component.turnLeft();
    component.turnLeft();
    expect(component.board()!.hunter.facing).toBe(Direction.North);
  });

  it('exit is disabled off the escape cell and enabled once there', () => {
    expect(component.canExit()).toBeFalse();

    component.turnLeft(); // face North
    component.advance(); // (1,1) -> (1,0)
    component.turnLeft(); // face West
    component.advance(); // (1,0) -> (0,0), the escape cell

    expect(component.canExit()).toBeTrue();
  });

  it('ending the round (death) surfaces isGameOver() and disables further actions', () => {
    component.board()!.cells[1][2].isWumpus = true;
    component.advance(); // walks east into the Wumpus

    expect(component.isGameOver()).toBeTrue();
    expect(component.endOfRoundTitle()).toBe('HAS MUERTO');

    const beforeMoves = component.board()!.hunter.movesTaken;
    component.advance(); // further actions are ignored once the round is over
    expect(component.board()!.hunter.movesTaken).toBe(beforeMoves);
  });

  it('playAgain() starts a fresh round', () => {
    component.board()!.cells[1][2].isPit = true;
    component.advance();
    expect(component.isGameOver()).toBeTrue();

    component.playAgain();

    expect(component.isGameOver()).toBeFalse();
    expect(component.board()!.hunter.isAlive).toBeTrue();
  });

  it('goToSettings() navigates back to the configuration screen', () => {
    const router = TestBed.inject(Router);
    spyOn(router, 'navigate');
    component.goToSettings();
    expect(router.navigate).toHaveBeenCalledWith(['/']);
  });

  describe('keyboard shortcuts (FR-008: optional, layered on top of the buttons)', () => {
    function press(key: string): void {
      document.dispatchEvent(new KeyboardEvent('keydown', { key }));
    }

    it('ArrowUp advances, ArrowLeft/ArrowRight turn, Enter shoots', () => {
      press('ArrowRight');
      expect(component.board()!.hunter.facing).toBe(Direction.South);

      press('ArrowLeft');
      expect(component.board()!.hunter.facing).toBe(Direction.East);

      press('ArrowUp');
      expect(component.board()!.cells[1][2].hasPlayer).toBeTrue();

      press('Enter');
      expect(component.board()!.hunter.arrowsUsed).toBe(1);
    });

    it('ignores unmapped keys, including ArrowDown (no backward/turn-around action exists)', () => {
      const before = component.board();
      press('ArrowDown');
      press(' ');
      expect(component.board()).toBe(before); // no new board reference — nothing acted on it
    });

    it('does nothing once the round is over', () => {
      component.board()!.cells[1][2].isWumpus = true;
      component.advance(); // dies
      const movesBefore = component.board()!.hunter.movesTaken;

      press('ArrowUp');

      expect(component.board()!.hunter.movesTaken).toBe(movesBefore);
    });
  });
});
