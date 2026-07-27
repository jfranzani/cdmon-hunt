import { ChangeDetectionStrategy, Component, input } from '@angular/core';

import { Cell } from '../../core/models/game';

/**
 * Renders one cell's walls and escape marker — purely via template bindings, no `nativeElement`
 * mutation (FR-010, fixes legacy-baseline.md §7.5). Perceptions (breeze/stench/glimmer) are
 * intentionally not rendered spatially here — game-rules.md §2 restricts them to the hunter's own
 * cell, reported via the log. The hunter itself is a `BoardComponent`-owned overlay, not rendered
 * per-cell, so it can be one persistent DOM element that CSS-transitions between cells (FR-012a) —
 * see `board.component.ts`.
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
}
