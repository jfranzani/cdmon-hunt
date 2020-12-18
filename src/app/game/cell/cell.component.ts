import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  Input,
  OnInit,
  ViewChild,
} from '@angular/core';
import { Cell, Wall } from 'src/app/core/models/game';

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
    let wallClass = this.getWallClasses(this.cell.wall);
    let nativeEl = this.cellElement.nativeElement;
    if (wallClass) {
      nativeEl.className = `${nativeEl.className}${wallClass}`;
    }
  }

  getWallClasses(wall: Wall) {
    let classStyles = '';
    if (wall.bottom) {
      classStyles += ' wall-bottom';
    }
    if (wall.right) {
      classStyles += ' wall-right';
    }
    if (wall.top) {
      classStyles += ' wall-top';
    }
    if (wall.left) {
      classStyles += ' wall-left';
    }
    return classStyles;
  }
}
