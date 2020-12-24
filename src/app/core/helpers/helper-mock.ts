import { Cell, Wall } from '../models/game';

export function getCellMocked() {
  return new Cell(1, 0, 1, new Wall(), false, false, false, false);
}
