export class Player {
  arrows: number;
  hasGold: boolean;
  isAlive: boolean;
  name?: string;
  constructor(name = 'John Doe', arrows = 1, hasGold = false, isAlive = true) {
    Object.assign(this, { name, arrows, hasGold, isAlive });
  }
}

export class Board {
  cells: Cell[][];
  player: Player;
  log: CellLog[];
  diedReason: string;
  availableDirections: AvailableDirections;
  constructor(cells: Cell[][] = [], log = [], player = new Player()) {
    this.cells = cells;
    this.log = log;
    this.player = player;
  }
}

export class Cell {
  hasPlayer: boolean;
  number: number;
  wall: Wall;
  isEscape: boolean;
  isPit: boolean;
  hasGold: boolean;
  isWumpus: boolean;
  isClearPath: boolean;
  coordinateX: number;
  coordinateY: number;
  status: PathFinderStatus;
  hasBreeze: boolean;
  hasStink: boolean;

  constructor(
    number,
    coordinateY,
    coordinateX,
    wall = new Wall(),
    isEscape = false,
    hasGold = false,
    isPit = false,
    isWumpus = false
  ) {
    Object.assign(this, {
      number,
      coordinateX,
      coordinateY,
      wall,
      isEscape,
      hasGold,
      isPit,
      isWumpus,
    });
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

export interface AvailableDirections {
  north: boolean;
  south: boolean;
  east: boolean;
  west: boolean;
}

export interface BoardCoordinate {
  X: number;
  Y: number;
}

export interface LocationPath {
  distanceFromTop: number;
  distanceFromLeft: number;
  path: BoardCoordinate[];
  status: PathFinderStatus;
}

export interface CellLog {
  message: string;
  class?: string;
}

export enum SearcheableCellAttr {
  isEscape = 'isEscape',
  isPit = 'isPit',
  isWumpus = 'isWumpus',
  hasPlayer = 'hasPlayer',
}

export enum CellAttributeToActive {
  hasBreeze = 'hasBreeze',
  hasStink = 'hasStink',
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

export enum ConsoleMessages {
  wumpusWon,
  wumpusDead,
  wumpusScream,
  wumpusStink,
  pitDead,
  pitBreeze,
  wallAhead,
  arrowFired,
  arrowHitWall,
  arrowHitWumpus,
  noMoreArrows,
  goldenFound,
  playerDead,
  emptyCell,
}

export enum KEY_CODE {
  RIGHT_ARROW = 'ArrowRight',
  LEFT_ARROW = 'ArrowLeft',
  UP_ARROW = 'ArrowUp',
  DOWN_ARROW = 'ArrowDown',
}
