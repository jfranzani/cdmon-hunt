export class Player {
  arrows: number[];
  hasGold: boolean;
  name?: string;
  constructor(name = 'John Doe', arrows = 1, hasGold = false) {
    Object.assign(this, { name, arrows, hasGold });
  }
}

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
  isPit: boolean;
  hasGold: boolean;
  isWumpus: boolean;
  isClearPath: boolean;
  coordinateX: number;
  coordinateY: number;
  status: PathFinderStatus;
  constructor(
    number,
    coordinateY,
    coordinateX,
    wall = new Wall(),
    type = CellType.VACIO,
    isEscape = false,
    hasGold = false,
    isPit = false,
    isWumpus = false
  ) {
    Object.assign(
      this,
      { number },
      { coordinateX },
      { coordinateY },
      { type },
      { wall },
      { isEscape },
      { hasGold },
      { isPit },
      { isWumpus }
    );
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

export interface BoardCoordenate {
  X: number;
  Y: number;
}

export interface LocationPath {
  distanceFromTop: number;
  distanceFromLeft: number;
  path: BoardCoordenate[];
  status: PathFinderStatus;
}

export enum SearchebleCellAttr {
  isEscape = 'isEscape',
  isPit = 'isPit',
  isWumpus = 'isWumpus',
}

export enum PathFinderStatus {
  Start,
  Gold,
  Valid,
  Invalid,
  Blocked,
  Empty,
  Unknown,
}

export enum AxisDirection {
  North,
  South,
  East,
  West,
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
