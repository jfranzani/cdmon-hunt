import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  Input,
  ViewChild,
} from '@angular/core';
import { Cell } from 'src/app/core/models/game';

@Component({
  selector: 'app-cell',
  templateUrl: './cell.component.html',
  styleUrls: ['./cell.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CellComponent implements AfterViewInit {
  @ViewChild('cube', { static: false }) cellElement;
  @Input() cell: Cell;
  constructor() {}

  ngAfterViewInit(): void {
    let wallClass = this.getWallClasses(this.cell);
    let nativeEl = this.cellElement.nativeElement;
    if (wallClass) {
      nativeEl.className = `${nativeEl.className}${wallClass}`;
    }
  }

  getWallClasses(cell: Cell): string {
    let wallStyle = '';
    if (cell.wall.bottom) {
      wallStyle += ' wall-bottom';
    }
    if (cell.wall.right) {
      wallStyle += ' wall-right';
    }
    if (cell.wall.top) {
      wallStyle += ' wall-top';
    }
    if (cell.wall.left) {
      wallStyle += ' wall-left';
    }
    if (cell.isEscape) {
      wallStyle = `${wallStyle} ${wallStyle}-escape`;
    }
    return wallStyle;
  }
}
