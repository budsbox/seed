// Type exports
export type * from '#types';

// Value exports
export * from './context';
export { useCellState, useTileState } from './hooks';
export {
  cellDataAttrs,
  gameIsOver,
  isCellEmpty,
  isCellOccupied,
  isIdenticalCells,
  isMergeAllowed,
  same,
  sameKind,
  samePosition,
  sameRank,
  tileCanMove,
  tileDataAttrs,
} from './lib';
export { useMerge2 } from './model';
