import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CellComponent } from './cell/cell.component';
import { BoardComponent } from './board/board.component';

@NgModule({
  declarations: [CellComponent, BoardComponent],
  imports: [CommonModule],
  exports: [CellComponent, BoardComponent],
})
export class GameModule {}
