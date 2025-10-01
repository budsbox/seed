// Type exports
export type * from '#types';

// Value exports
export {
  endGameHappened,
  isCellEmpty,
  isCellOccupied,
  isIdenticalCells,
  isMergeAllowed,
  same,
  sameKind,
  samePosition,
  sameRank,
  tileCanMove,
} from './lib';
export { useMerge2 } from './model';
export * from './ui';
