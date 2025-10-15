// Type exports
export type * from '#types';

// Value exports
export * from './context';
export { useCellState, useTileState } from './hooks';
export {
  boardsDiff,
  castKindId,
  castModifierId,
  cellDataAttrs,
  createTile,
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
  updateCell,
} from './lib';
export { useMerge2 } from './model';
export { defaultSpawnRule } from './rules';
