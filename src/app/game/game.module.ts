import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CellComponent } from './cell/cell.component';
import { BoardComponent } from './board/board.component';
import { NgbTooltipModule } from '@ng-bootstrap/ng-bootstrap';

@NgModule({
  declarations: [CellComponent, BoardComponent],
  imports: [CommonModule, NgbTooltipModule],
  exports: [CellComponent, BoardComponent],
})
export class GameModule {}
