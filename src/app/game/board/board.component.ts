import { ThrowStmt } from '@angular/compiler';
import {
  ChangeDetectionStrategy,
  Component,
  HostListener,
  OnInit,
  ViewChild,
} from '@angular/core';
import { Router } from '@angular/router';
import { faThumbsDown } from '@fortawesome/free-solid-svg-icons';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { getAvailableDirections } from 'src/app/core/helpers/helper-functions';
import { GameConfiguration } from 'src/app/core/models/configuration';
import {
  AxisDirection,
  Board,
  Cell,
  ConsoleMessages,
  KEY_CODE,
} from 'src/app/core/models/game';
import { GameService } from 'src/app/services/game.service';
import { MessagesService } from 'src/app/services/messages.service';
import { PathCreatorService } from 'src/app/services/path-creator.service';
import { PlayerService } from 'src/app/services/player.service';
import { StorageService } from 'src/app/services/storage.service';
import { TrueLiteral } from 'typescript';

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
  isWalking = true;
  modalTitle: string;
  modalMessage: string;

  constructor(
    private storageService: StorageService,
    private gameService: GameService,
    private playerService: PlayerService,
    private pathService: PathCreatorService,
    private modalService: NgbModal,
    private messagesService: MessagesService,
    private route: Router
  ) {}

  ngOnInit(): void {
    this.startGame();
  }

  startGame() {
    this.createBoardMatrix();
    this.addPlayer();
    this.checkBoardStatus();
    this.board.log.push({
      message: 'Entras a la mazmorra...',
      class: 'start',
    });
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

    if (this.board.player.escaped) {
      this.modalTitle = 'HAS GANADO LA PARTIDA';
      this.modalMessage = this.messagesService.getMessage(
        ConsoleMessages.wonGame
      );
      this.openResetModal();
      return;
    }

    if (this.board.player.isAlive) {
      this.checkBoardStatus();
    } else {
      this.modalTitle = 'HAS MUERTO';
      this.modalMessage = this.board?.diedReason || '';
      this.openResetModal();
    }
  }

  shootArrow(direction: AxisDirection) {
    if (this.board.player.arrows < 1) {
      this.board.log[0].message =
        'Buscas en tu mochila pero no encuentras más flechas';
    } else {
      this.playerService.shootArrow(this.board, this.playerCell, direction);
      this.board.player.arrows -= 1;
      this.checkBoardStatus();
    }
  }

  async openResetModal() {
    const res = await this.modalService.open(this.content, {
      centered: true,
      backdrop: 'static',
    }).result;
    this.modalResponse(res);
  }

  modalResponse(res: string) {
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
    switch (event.key) {
      case KEY_CODE.RIGHT_ARROW:
        if (this.isWalking) {
          this.move(AxisDirection.East);
        } else {
          this.shootArrow(AxisDirection.East);
        }
        break;
      case KEY_CODE.LEFT_ARROW:
        if (this.isWalking) {
          this.move(AxisDirection.West);
        } else {
          this.shootArrow(AxisDirection.West);
        }
        break;
      case KEY_CODE.DOWN_ARROW:
        if (this.isWalking) {
          this.move(AxisDirection.South);
        } else {
          this.shootArrow(AxisDirection.South);
        }
        break;
      case KEY_CODE.UP_ARROW:
        if (this.isWalking) {
          this.move(AxisDirection.North);
        } else {
          this.shootArrow(AxisDirection.North);
        }
        break;
    }
  }
}
