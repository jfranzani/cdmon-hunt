import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
  computed,
  inject,
  signal,
  viewChild,
} from '@angular/core';
import { Router } from '@angular/router';

import { findCell } from '../../core/helpers/helper-functions';
import { getDefaultGameConfiguration } from '../../core/models/configuration';
import { ArrowShot, Board, Direction, ExitOutcome, Perception } from '../../core/models/game';
import { GameService } from '../../services/game.service';
import { MessagesService } from '../../services/messages.service';
import { PlayerService } from '../../services/player.service';
import { StorageService } from '../../services/storage.service';
import { CellComponent } from '../cell/cell.component';

/**
 * Optional keyboard layer on top of the required buttons (FR-008): arrow keys move/turn the
 * hunter, Enter shoots. There's no "turn around"/backward action in game-rules.md §3, so the
 * down arrow is intentionally left unbound rather than inventing new game logic for it.
 */
const KEY_ACTIONS: Readonly<Record<string, 'advance' | 'turnLeft' | 'turnRight' | 'shoot'>> = {
  ArrowUp: 'advance',
  ArrowLeft: 'turnLeft',
  ArrowRight: 'turnRight',
  Enter: 'shoot',
};

/** Must match `$cell-size` in `src/app/styles/_board.scss` — see that file's comment. */
const CELL_SIZE_PX = 48;

const ROTATION_DEG: Readonly<Record<Direction, number>> = {
  [Direction.North]: 0,
  [Direction.East]: 90,
  [Direction.South]: 180,
  [Direction.West]: 270,
};

/** Presentation-only icons for the log — kept out of MessagesService, which owns the Spanish text. */
const PERCEPTION_ICONS: Readonly<Partial<Record<Perception, string>>> = {
  [Perception.Stench]: '👃',
  [Perception.Breeze]: '🌬️',
  [Perception.Glimmer]: '✨',
  [Perception.Choque]: '💥',
  [Perception.Grito]: '😱',
  [Perception.WumpusDeath]: '💀',
  [Perception.PitDeath]: '🕳️',
  [Perception.Won]: '🏆',
  [Perception.ExitedWithoutGold]: '🚪',
  [Perception.NoArrows]: '🎯',
  [Perception.ArrowHitWall]: '🏹',
  [Perception.Start]: '🕯️',
};

/**
 * The play screen: signals-driven board state, the five required command buttons, and the
 * text/log output area — the minimal interface game-rules.md §7 requires (FR-008) — plus the
 * animation layer from FR-012a. The hunter and the in-flight arrow are rendered as overlay
 * elements positioned by `CELL_SIZE_PX` math rather than per-cell, so each is a single persistent
 * DOM node CSS/WAAPI can animate between positions (see `cell.component.ts`'s doc comment).
 */
@Component({
  selector: 'app-board',
  standalone: true,
  imports: [CellComponent],
  templateUrl: './board.component.html',
  styleUrl: './board.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '(document:keydown)': 'handleKeydown($event)',
  },
})
export class BoardComponent {
  private readonly gameService = inject(GameService);
  private readonly playerService = inject(PlayerService);
  private readonly messages = inject(MessagesService);
  private readonly storage = inject(StorageService);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);

  private readonly arrowEl = viewChild<ElementRef<HTMLElement>>('arrowEl');

  readonly board = signal<Board | null>(null);
  readonly isBumping = signal(false);
  private actionCounter = signal(0);
  readonly actionCount = this.actionCounter.asReadonly();

  readonly isGameOver = computed(() => {
    const board = this.board();
    return !!board && (!board.hunter.isAlive || board.hunter.exitOutcome !== null);
  });

  readonly canExit = computed(() => {
    const board = this.board();
    return !!board && this.playerService.canExit(board);
  });

  readonly outcomeClass = computed(() => {
    const board = this.board();
    if (!board) return '';
    if (!board.hunter.isAlive) return 'outcome-death';
    if (board.hunter.exitOutcome === ExitOutcome.Won) return 'outcome-won';
    if (board.hunter.exitOutcome === ExitOutcome.ExitedWithoutGold) return 'outcome-exited';
    return '';
  });

  readonly endOfRoundTitle = computed(() => {
    const board = this.board();
    if (!board) return '';
    if (!board.hunter.isAlive) return 'HAS MUERTO';
    if (board.hunter.exitOutcome === ExitOutcome.Won) return 'HAS GANADO LA PARTIDA';
    return 'HAS SALIDO SIN EL ORO';
  });

  readonly endOfRoundMessage = computed(() => {
    const board = this.board();
    if (!board) return '';
    return board.diedReason ?? board.log.at(-1)?.message ?? '';
  });

  readonly hunterTransform = computed(() => {
    const board = this.board();
    if (!board) return '';
    const hunterCell = findCell(board.cells, (cell) => cell.hasPlayer);
    if (!hunterCell) return '';
    const x = hunterCell.coordinateX * CELL_SIZE_PX;
    const y = hunterCell.coordinateY * CELL_SIZE_PX;
    const rotation = ROTATION_DEG[board.hunter.facing];
    return `translate(${x}px, ${y}px) rotate(${rotation}deg)`;
  });

  readonly gridTemplateColumns = computed(() => {
    const board = this.board();
    return board ? `repeat(${board.cells[0].length}, ${CELL_SIZE_PX}px)` : '';
  });

  private bumpTimeoutId?: ReturnType<typeof setTimeout>;

  constructor() {
    this.startNewGame();
    this.destroyRef.onDestroy(() => clearTimeout(this.bumpTimeoutId));
  }

  perceptionIcon(perception: Perception): string {
    return PERCEPTION_ICONS[perception] ?? '';
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

  handleKeydown(event: KeyboardEvent): void {
    const action = KEY_ACTIONS[event.key];
    if (!action) {
      return;
    }
    event.preventDefault(); // stop the arrow keys/Enter from scrolling or resubmitting anything
    this[action]();
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
    const facingBeforeAction = board.hunter.facing;
    action(board);
    this.board.set({ ...board });
    this.actionCounter.update((n) => n + 1);

    if (board.log.some((entry) => entry.perception === Perception.Choque)) {
      this.triggerBump();
    }
    if (board.lastShot) {
      this.animateArrow(board.lastShot, facingBeforeAction);
    }
  }

  private triggerBump(): void {
    // Force a false -> true -> false cycle so the CSS animation restarts even on back-to-back
    // wall bumps, where the class would otherwise never actually leave the "on" state.
    this.isBumping.set(false);
    clearTimeout(this.bumpTimeoutId);
    this.bumpTimeoutId = setTimeout(() => {
      this.isBumping.set(true);
      this.bumpTimeoutId = setTimeout(() => this.isBumping.set(false), 300);
    });
  }

  private animateArrow(shot: ArrowShot, facingAtShotTime: Direction): void {
    const element = this.arrowEl()?.nativeElement;
    if (!element) {
      return;
    }
    const dx = shot.to.x - shot.from.x;
    const dy = shot.to.y - shot.from.y;
    const rotation = dx !== 0 || dy !== 0 ? this.rotationFromDelta(dx, dy) : ROTATION_DEG[facingAtShotTime];
    // The overlay box is a full cell (like the hunter's), with its glyph centered inside via the
    // ::before's `inset` — so it's positioned the same way the hunter is, top-left-to-top-left,
    // not offset by half a cell. (That offset was the bug: it put the box's corner, not its
    // already-centered glyph, at the cell's center, visually pushing the arrow toward the grid
    // lines instead of through the middle of each square.)
    const startTransform = `translate(${shot.from.x * CELL_SIZE_PX}px, ${shot.from.y * CELL_SIZE_PX}px) rotate(${rotation}deg)`;
    const endTransform = `translate(${shot.to.x * CELL_SIZE_PX}px, ${shot.to.y * CELL_SIZE_PX}px) rotate(${rotation}deg)`;
    const distanceCells = Math.max(Math.abs(dx), Math.abs(dy), 1);

    element.style.opacity = '1';
    const animation = element.animate([{ transform: startTransform }, { transform: endTransform }], {
      duration: Math.min(600, 120 * distanceCells),
      easing: 'linear',
      fill: 'forwards',
    });
    animation.finished
      .then(() => {
        element.style.opacity = '0';
      })
      .catch(() => {
        // Animation was canceled (e.g. a rapid re-shoot) — nothing to clean up.
      });
  }

  private rotationFromDelta(dx: number, dy: number): number {
    if (dx > 0) return ROTATION_DEG[Direction.East];
    if (dx < 0) return ROTATION_DEG[Direction.West];
    return dy > 0 ? ROTATION_DEG[Direction.South] : ROTATION_DEG[Direction.North];
  }
}
