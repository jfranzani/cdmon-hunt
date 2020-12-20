import {
  ChangeDetectionStrategy,
  Component,
  HostListener,
  OnInit,
  ViewChild,
} from '@angular/core';
import { Router } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { getAvailableDirections } from 'src/app/core/helpers/helper-functions';
import { GameConfiguration } from 'src/app/core/models/configuration';
import { AxisDirection, Board, Cell, KEY_CODE } from 'src/app/core/models/game';
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
  @ViewChild('content', { static: false }) private content;

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
    private modalService: NgbModal,
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

    if (this.board.player.isAlive) {
      this.checkBoardStatus();
    } else {
      this.hunterDied();
    }
  }

  async hunterDied() {
    const res = await this.modalService.open(this.content, {
      centered: true,
      backdrop: 'static',
    }).result;
    if (res === 'settings') {
      this.goBack();
    } else {
      this.resetBoard();
    }
  }

  resetBoard() {
    this.startGame();
  }

  goBack() {
    this.route.navigate(['']);
  }

  @HostListener('window:keyup', ['$event'])
  keyEvent(event: KeyboardEvent) {
    if (event.key === KEY_CODE.RIGHT_ARROW) {
      this.move(AxisDirection.East);
    }
    if (event.key === KEY_CODE.LEFT_ARROW) {
      this.move(AxisDirection.West);
    }
    if (event.key === KEY_CODE.DOWN_ARROW) {
      this.move(AxisDirection.South);
    }
    if (event.key === KEY_CODE.UP_ARROW) {
      this.move(AxisDirection.North);
    }
  }
}
