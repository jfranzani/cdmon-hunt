import { Injectable } from '@angular/core';
import {
  findSpecificCell,
  getAdjacentCell,
} from '../core/helpers/helper-functions';
import {
  AxisDirection,
  Board,
  Cell,
  CellLog,
  ConsoleMessages,
  SearcheableCellAttr,
} from '../core/models/game';
import { MessagesService } from './messages.service';

@Injectable({
  providedIn: 'root',
})
export class PlayerService {
  constructor(private messagesService: MessagesService) {}

  addPlayerToItsInitialCell(cells: Cell[][]) {
    let escapeCell = findSpecificCell(cells, SearcheableCellAttr.isEscape);
    escapeCell.hasPlayer = true;
  }

  getPlayerCell(cells: Cell[][]) {
    let playerCell = findSpecificCell(cells, SearcheableCellAttr.hasPlayer);
    return playerCell;
  }

  movePlayer(board: Board, currentCell: Cell, direction: AxisDirection): Cell {
    board.log = [];
    let nextCell = getAdjacentCell(board.cells, currentCell, direction);
    if (nextCell.isWumpus) {
      this.fellInWumpus(board);
      return null;
    }
    if (nextCell.isPit) {
      this.fellInPit(board);
      return null;
    }
    if (nextCell.hasBreeze) {
      this.fellInBreeze(board);
    }
    if (nextCell.hasStink) {
      this.fellInStink(board);
    }
    if (nextCell.hasGold) {
      this.fellInGold(board);
      nextCell.hasGold = false;
    }
    if (board.log.length === 0) {
      this.fellInEmptyCell(board);
    }
    currentCell.hasPlayer = false;
    nextCell.hasPlayer = true;
    return nextCell;
  }

  fellInEmptyCell(board: Board) {
    let message: CellLog = {
      message: this.messagesService.getMessage(ConsoleMessages.emptyCell),
    };
    board.log.push(message);
  }

  fellInPit(board: Board) {
    board.player.isAlive = false;
    board.diedReason = this.messagesService.getMessage(ConsoleMessages.pitDead);
  }

  fellInWumpus(board: Board) {
    board.player.isAlive = false;
    board.diedReason = this.messagesService.getMessage(
      ConsoleMessages.wumpusWon
    );
  }

  fellInBreeze(board: Board) {
    let message: CellLog = {
      message: this.messagesService.getMessage(ConsoleMessages.pitBreeze),
      class: 'breeze',
    };
    board.log.push(message);
  }
  fellInStink(board: Board) {
    let message: CellLog = {
      message: this.messagesService.getMessage(ConsoleMessages.wumpusStink),
      class: 'stink',
    };
    board.log.push(message);
  }
  fellInGold(board: Board) {
    let message: CellLog = {
      message: this.messagesService.getMessage(ConsoleMessages.goldenFound),
      class: 'gold',
    };
    board.log.push(message);
    board.player.hasGold = true;
  }
}
