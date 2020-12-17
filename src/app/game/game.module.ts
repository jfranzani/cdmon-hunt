import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BoardModule } from './board/board.module';
import { CellModule } from './cell/cell.module';

@NgModule({
  declarations: [],
  imports: [CommonModule, BoardModule, CellModule],
})
export class GameModule {}
