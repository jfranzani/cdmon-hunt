import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { Router } from '@angular/router';

import { getDefaultGameConfiguration } from '../../core/models/configuration';
import { Board, Perception } from '../../core/models/game';
import { GameService } from '../../services/game.service';
import { MessagesService } from '../../services/messages.service';
import { PlayerService } from '../../services/player.service';
import { StorageService } from '../../services/storage.service';
import { CellComponent } from '../cell/cell.component';

/**
 * The play screen: signals-driven board state, the five required command buttons, and the
 * text/log output area — the minimal interface game-rules.md §7 requires (FR-008).
 */
@Component({
  selector: 'app-board',
  standalone: true,
  imports: [CellComponent],
  templateUrl: './board.component.html',
  styleUrl: './board.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BoardComponent {
  private readonly gameService = inject(GameService);
  private readonly playerService = inject(PlayerService);
  private readonly messages = inject(MessagesService);
  private readonly storage = inject(StorageService);
  private readonly router = inject(Router);

  readonly board = signal<Board | null>(null);

  readonly isGameOver = computed(() => {
    const board = this.board();
    return !!board && (!board.hunter.isAlive || board.hunter.exitOutcome !== null);
  });

  readonly canExit = computed(() => {
    const board = this.board();
    return !!board && this.playerService.canExit(board);
  });

  readonly endOfRoundTitle = computed(() => {
    const board = this.board();
    if (!board) return '';
    if (!board.hunter.isAlive) return 'HAS MUERTO';
    if (board.hunter.exitOutcome === 'Won') return 'HAS GANADO LA PARTIDA';
    return 'HAS SALIDO SIN EL ORO';
  });

  readonly endOfRoundMessage = computed(() => {
    const board = this.board();
    if (!board) return '';
    return board.diedReason ?? board.log.at(-1)?.message ?? '';
  });

  constructor() {
    this.startNewGame();
  }

  advance(): void {
    this.act((board) => this.playerService.advance(board));
  }

  turnLeft(): void {
    this.act((board) => this.playerService.turnLeft(board));
  }

  turnRight(): void {
    this.act((board) => this.playerService.turnRight(board));
  }

  shoot(): void {
    this.act((board) => this.playerService.shoot(board));
  }

  exit(): void {
    this.act((board) => this.playerService.exit(board));
  }

  playAgain(): void {
    this.startNewGame();
  }

  goToSettings(): void {
    this.router.navigate(['/']);
  }

  private startNewGame(): void {
    const config = this.storage.getGameSettings() ?? getDefaultGameConfiguration();
    const board = this.gameService.generateBoard(config);
    board.log.push({ message: this.messages.getMessage(Perception.Start), perception: Perception.Start });
    this.board.set(board);
  }

  private act(action: (board: Board) => void): void {
    const board = this.board();
    if (!board || this.isGameOver()) {
      return;
    }
    action(board);
    this.board.set({ ...board });
  }
}
