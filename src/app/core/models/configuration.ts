export interface GameConfiguration {
  cellsX: number;
  cellsY: number;
  pits: number;
  arrows: number;
}

/** Square board by default (game-rules.md §5); still independently configurable — spec.md Assumptions. */
export function getDefaultGameConfiguration(): GameConfiguration {
  return {
    cellsX: 8,
    cellsY: 8,
    pits: 1,
    arrows: 1,
  };
}
