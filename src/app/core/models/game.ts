export class Board {
  cells: Cell[][];
  constructor(cells: Cell[][] = []) {
    this.cells = cells;
  }
}

export class Cell {
  number: number;
  type: CellType;
  wall: Wall;
  isEscape: boolean;
  constructor(
    number,
    wall = new Wall(),
    type = CellType.VACIO,
    isEscape = false
  ) {
    Object.assign(this, { number }, { type }, { wall }, { isEscape });
  }
}

export class Wall {
  right: boolean;
  left: boolean;
  top: boolean;
  bottom: boolean;
  constructor(right = false, left = false, top = false, bottom = false) {
    this.right = right;
    this.left = left;
    this.top = top;
    this.bottom = bottom;
  }
}

export enum CellType {
  POZO,
  WUMPUS,
  VACIO,
  BRIZA,
  HEDOR,
  ORO,
  CAZADOR,
}
