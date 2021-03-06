import { Injectable } from '@angular/core';
import {
  findSpecificCell,
  getAdjacentCell,
  isWall,
} from '../core/helpers/helper-functions';
import {
  ArrowLog,
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

  shootArrow(board: Board, currentCell: Cell, direction: AxisDirection) {
    board.log = [];
    let nextCell = getAdjacentCell(board.cells, currentCell, direction);
    let arrowLog = this.checkArrowColission(board, nextCell, direction);
    board.log.push({ message: arrowLog.message });
  }

  checkArrowColission(
    board: Board,
    cell: Cell,
    direction: AxisDirection
  ): ArrowLog {
    let arrowLog: ArrowLog = {
      hitWumpus: false,
      message: this.messagesService.getMessage(ConsoleMessages.arrowHitWall),
    };
    if (!cell) {
      return arrowLog;
    }
    if (cell.isWumpus) {
      this.killWumpus(board, cell);
      arrowLog.hitWumpus = true;
      arrowLog.message = this.messagesService.getMessage(
        ConsoleMessages.arrowHitWumpus
      );
      return arrowLog;
    }
    if (isWall(cell.wall)) {
      return arrowLog;
    }
    let nextCell = getAdjacentCell(board.cells, cell, direction);
    return this.checkArrowColission(board, nextCell, direction);
  }

  /**
   * Kill the wumpus and remove the smell cells
   * @param board
   * @param wumpusCell
   */
  killWumpus(board: Board, wumpusCell: Cell) {
    wumpusCell.isWumpus = false;
    let northCell = getAdjacentCell(
      board.cells,
      wumpusCell,
      AxisDirection.North
    );
    let southCell = getAdjacentCell(
      board.cells,
      wumpusCell,
      AxisDirection.South
    );
    let eastCell = getAdjacentCell(board.cells, wumpusCell, AxisDirection.East);
    let westCell = getAdjacentCell(board.cells, wumpusCell, AxisDirection.West);
    this.removeWumpusSmell(northCell);
    this.removeWumpusSmell(southCell);
    this.removeWumpusSmell(eastCell);
    this.removeWumpusSmell(westCell);
  }

  removeWumpusSmell(cell: Cell) {
    if (cell && cell.hasStink) {
      cell.hasStink = false;
    }
  }

  movePlayer(board: Board, currentCell: Cell, direction: AxisDirection): Cell {
    board.log = [];
    let nextCell = getAdjacentCell(board.cells, currentCell, direction);
    if (nextCell) {
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
      if (nextCell.isEscape && board.player.hasGold) {
        this.wonGame(board);
        nextCell.hasGold = false;
      }
      if (board.log.length === 0) {
        this.fellInEmptyCell(board);
      }
      currentCell.hasPlayer = false;
      nextCell.hasPlayer = true;
      return nextCell;
    } else {
      return null;
    }
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

  wonGame(board: Board) {
    board.player.escaped = true;
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
