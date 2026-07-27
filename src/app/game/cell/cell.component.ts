import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';

import { Cell, Direction } from '../../core/models/game';

/**
 * Renders one cell's walls, escape marker, and (when occupied) the hunter with its facing
 * direction — purely via template bindings, no `nativeElement` mutation (FR-010, fixes
 * legacy-baseline.md §7.5). Perceptions (breeze/stench/glimmer) are intentionally not rendered
 * spatially here — game-rules.md §2 restricts them to the hunter's own cell, reported via the log.
 */
@Component({
  selector: 'app-cell',
  standalone: true,
  templateUrl: './cell.component.html',
  styleUrl: './cell.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CellComponent {
  readonly cell = input.required<Cell>();
  readonly hunterFacing = input<Direction | null>(null);

  readonly facingClass = computed(() => {
    const facing = this.hunterFacing();
    return facing ? `facing-${facing.toLowerCase()}` : '';
  });
}
