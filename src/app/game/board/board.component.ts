import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { getAvailableDirections } from 'src/app/core/helpers/helper-functions';
import { GameConfiguration } from 'src/app/core/models/configuration';
import { AxisDirection, Board, Cell } from 'src/app/core/models/game';
import { GameService } from 'src/app/services/game.service';
import { PathCreatorService } from 'src/app/services/path-creator.service';
import { PlayerService } from 'src/app/services/player.service';
import { StorageService } from 'src/app/services/storage.service';

@Component({
  selector: 'app-board',
  templateUrl: './board.component.html',
  styleUrls: ['./board.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BoardComponent implements OnInit {
  gameSettings: GameConfiguration;
  board: Board;
  playerCell: Cell;
  cells: Cell[][];
  // Store a reference to the enum to use in template
  AxisDirection = AxisDirection;

  constructor(
    private storageService: StorageService,
    private gameService: GameService,
    private playerService: PlayerService,
    private pathService: PathCreatorService,
    private route: Router
  ) {}

  ngOnInit(): void {
    this.startGame();
  }

  startGame() {
    this.createBoardMatrix();
    this.addPlayer();
    this.checkBoardStatus();
    console.log(this.board);
  }

  createBoardMatrix() {
    let cells: Cell[][];
    this.gameSettings = this.storageService.getGameSettings();
    this.board = this.gameService.createEmptyBoard(this.gameSettings);
    cells = this.board.cells;
    this.gameService.addEscapeCell(cells);
    this.gameService.addGold(cells);
    this.gameService.addWumpus(cells);
    this.pathService.createCleanPathToGold(cells);
    this.gameService.addPits(cells, this.gameSettings.pits);
  }

  checkBoardStatus() {
    this.playerCell = this.playerService.getPlayerCell(this.board.cells);
    this.board.availableDirections = getAvailableDirections(
      this.board,
      this.playerCell
    );
  }

  addPlayer() {
    this.playerService.addPlayerToItsInitialCell(this.board.cells);
  }

  move(direction: AxisDirection) {
    this.playerCell = this.playerService.movePlayer(
      this.board,
      this.playerCell,
      direction
    );

    if (!this.playerCell) {
      this.hunterDied();
    } else {
      this.checkBoardStatus();
    }
  }

  hunterDied() {
    console.log('DEADDDD');
  }

  resetBoard() {
    this.startGame();
  }

  goBack() {
    this.route.navigate(['']);
  }
}
