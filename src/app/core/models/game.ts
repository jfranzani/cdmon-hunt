/**
 * The hunter's heading, also used as the movement/shoot axis (game-rules.md §3).
 */
export const Direction = {
  North: 'North',
  East: 'East',
  South: 'South',
  West: 'West',
} as const;
export type Direction = (typeof Direction)[keyof typeof Direction];

export const ALL_DIRECTIONS: readonly Direction[] = [
  Direction.North,
  Direction.East,
  Direction.South,
  Direction.West,
];

export const TURN_LEFT: Readonly<Record<Direction, Direction>> = {
  [Direction.North]: Direction.West,
  [Direction.West]: Direction.South,
  [Direction.South]: Direction.East,
  [Direction.East]: Direction.North,
};

export const TURN_RIGHT: Readonly<Record<Direction, Direction>> = {
  [Direction.North]: Direction.East,
  [Direction.East]: Direction.South,
  [Direction.South]: Direction.West,
  [Direction.West]: Direction.North,
};

export interface Wall {
  readonly top: boolean;
  readonly bottom: boolean;
  readonly left: boolean;
  readonly right: boolean;
}

export function isWall(wall: Wall): boolean {
  return wall.top || wall.bottom || wall.left || wall.right;
}

export interface Cell {
  readonly number: number;
  readonly coordinateX: number;
  readonly coordinateY: number;
  readonly wall: Wall;
  isEscape: boolean;
  isPit: boolean;
  hasGold: boolean;
  isWumpus: boolean;
  isClearPath: boolean;
  hasBreeze: boolean;
  hasStink: boolean;
  hasPlayer: boolean;
}

export function createCell(number: number, coordinateY: number, coordinateX: number, wall: Wall): Cell {
  return {
    number,
    coordinateX,
    coordinateY,
    wall,
    isEscape: false,
    isPit: false,
    hasGold: false,
    isWumpus: false,
    isClearPath: false,
    hasBreeze: false,
    hasStink: false,
    hasPlayer: false,
  };
}

/**
 * The outcome of using the "exit" action (game-rules.md §3d, §4). `null` while the round is
 * still in progress or ended in death.
 */
export const ExitOutcome = {
  Won: 'Won',
  ExitedWithoutGold: 'ExitedWithoutGold',
} as const;
export type ExitOutcome = (typeof ExitOutcome)[keyof typeof ExitOutcome];

export interface Hunter {
  arrows: number;
  hasGold: boolean;
  isAlive: boolean;
  facing: Direction;
  exitOutcome: ExitOutcome | null;
  /** Run-summary counters for FR-014. */
  movesTaken: number;
  arrowsUsed: number;
}

export function createHunter(arrows: number, facing: Direction): Hunter {
  return {
    arrows,
    hasGold: false,
    isAlive: true,
    facing,
    exitOutcome: null,
    movesTaken: 0,
    arrowsUsed: 0,
  };
}

/**
 * One of the six `game-rules.md` §2 perceptions, plus the handful of non-perception outcomes
 * (death causes, empty cell, no-arrows guard) the UI also needs to report. Kept as a single
 * discriminated set — see `MessagesService` — so every case has exactly one message string,
 * enforced by the TypeScript compiler (FR-006).
 */
export const Perception = {
  Stench: 'Stench',
  Breeze: 'Breeze',
  Glimmer: 'Glimmer',
  Choque: 'Choque',
  Grito: 'Grito',
  ArrowHitWall: 'ArrowHitWall',
  PitDeath: 'PitDeath',
  WumpusDeath: 'WumpusDeath',
  EmptyCell: 'EmptyCell',
  NoArrows: 'NoArrows',
  Won: 'Won',
  ExitedWithoutGold: 'ExitedWithoutGold',
  Start: 'Start',
} as const;
export type Perception = (typeof Perception)[keyof typeof Perception];

export interface LogEntry {
  readonly message: string;
  readonly perception: Perception;
}

export interface BoardCoordinate {
  readonly x: number;
  readonly y: number;
}

/** The most recent arrow's trajectory, for the arrow-travel animation (FR-012a). */
export interface ArrowShot {
  readonly from: BoardCoordinate;
  readonly to: BoardCoordinate;
  readonly hitWumpus: boolean;
}

export interface Board {
  cells: Cell[][];
  hunter: Hunter;
  log: LogEntry[];
  diedReason: string | null;
  /** `null` except immediately after a shot — the UI clears it once it's animated. */
  lastShot: ArrowShot | null;
}

export function createBoard(cells: Cell[][], hunter: Hunter): Board {
  return { cells, hunter, log: [], diedReason: null, lastShot: null };
}
