import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { Board } from 'src/app/core/models/game';
import { GameService } from 'src/app/services/game.service';
import { PathCreatorService } from 'src/app/services/path-creator.service';
import { PlayerService } from 'src/app/services/player.service';
import { StorageService } from 'src/app/services/storage.service';
import * as helper from 'src/app/core/helpers/helper-functions';

import { BoardComponent } from './board.component';

describe('BoardComponent', () => {
  let component: BoardComponent;
  let fixture: ComponentFixture<BoardComponent>;
  let gameService: GameService;
  let storageService: StorageService;
  let pathService: PathCreatorService;
  let playerService: PlayerService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [BoardComponent],
      imports: [RouterTestingModule],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(BoardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('ngOninit', () => {
    it('should call startGame function', () => {
      spyOn(component, 'startGame');
      component.ngOnInit();
      expect(component.startGame).toHaveBeenCalled();
    });
  });

  describe('startGame', () => {
    it('should call all the functions that starts the game and set the initial log', () => {
      //Arrange
      spyOn(component, 'createBoardMatrix');
      spyOn(component, 'addPlayer');
      spyOn(component, 'checkBoardStatus');
      component.board = new Board();
      component.board.log = [];
      //Action
      component.startGame();
      // Assert
      expect(component.createBoardMatrix).toHaveBeenCalled();
      expect(component.addPlayer).toHaveBeenCalled();
      expect(component.checkBoardStatus).toHaveBeenCalled();
      expect(component.board.log[0]).toEqual({
        message: 'Entras a la mazmorra...',
        class: 'start',
      });
    });
  });

  describe('createBoardMatrix', () => {
    it('should call all the functions in game service that set up the board for the first time', () => {
      //Arrange
      gameService = TestBed.inject(GameService);
      storageService = TestBed.inject(StorageService);
      pathService = TestBed.inject(PathCreatorService);
      spyOn(storageService, 'getGameSettings').and.returnValue({
        cellsX: 8,
        cellsY: 8,
        pits: 1,
        arrows: 1,
      });
      spyOn(gameService, 'createEmptyBoard').and.returnValue(new Board());
      spyOn(gameService, 'addEscapeCell');
      spyOn(gameService, 'addGold');
      spyOn(gameService, 'addWumpus');
      spyOn(pathService, 'createCleanPathToGold');
      spyOn(gameService, 'addPits');
      //Action
      component.createBoardMatrix();
      // Assert
      expect(storageService.getGameSettings).toHaveBeenCalled();
      expect(gameService.createEmptyBoard).toHaveBeenCalled();
      expect(gameService.addEscapeCell).toHaveBeenCalled();
      expect(gameService.addEscapeCell).toHaveBeenCalled();
      expect(gameService.addGold).toHaveBeenCalled();
      expect(gameService.addWumpus).toHaveBeenCalled();
      expect(gameService.addPits).toHaveBeenCalled();
      expect(pathService.createCleanPathToGold).toHaveBeenCalled();
    });
  });

  describe('checkBoardStatus', () => {
    it('should get PlayerCell and update the status', () => {
      //Arrange
      playerService = TestBed.inject(PlayerService);
      spyOn(playerService, 'getPlayerCell');
      spyOn(helper, 'getAvailableDirections');
      //Action
      component.checkBoardStatus();
      // Assert
      expect(playerService.getPlayerCell).toHaveBeenCalled();
      expect(helper.getAvailableDirections).toHaveBeenCalled();
    });
  });

  describe('addPlayer', () => {
    it('should call addPlayerToItsInitialCell from playerService', () => {
      //Arrange
      playerService = TestBed.inject(PlayerService);
      spyOn(playerService, 'addPlayerToItsInitialCell');
      //Action
      component.addPlayer();
      // Assert
      expect(playerService.addPlayerToItsInitialCell).toHaveBeenCalled();
    });
  });

  describe('move function', () => {
    it('should win the match', () => {
      // //Arrange
      // playerService = TestBed.inject(PlayerService);
      // spyOn(playerService, 'addPlayerToItsInitialCell');
      // //Action
      // component.addPlayer();
      // // Assert
      // expect(playerService.addPlayerToItsInitialCell).toHaveBeenCalled();
    });
  });
});
