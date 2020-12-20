import { Injectable } from '@angular/core';
import {
  findSpecificCell,
  getAdjacentCell,
} from '../core/helpers/helper-functions';
import {
  AvailableDirections,
  AxisDirection,
  Board,
  Cell,
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
    let nextCell = getAdjacentCell(board.cells, currentCell, direction);
    if (nextCell.isPit) {
      board.log.push(this.messagesService.getMessage(ConsoleMessages.pitDead));
      board.log.push(
        this.messagesService.getMessage(ConsoleMessages.playerDead)
      );
      board.player.isAlive = false;
      return null;
    }
    currentCell.hasPlayer = false;
    nextCell.hasPlayer = true;
    return nextCell;
  }
}
