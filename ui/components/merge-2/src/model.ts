import type { Merge2Model, Merge2ModelOptions } from '#types';

import { useCallback, useEffect, useMemo, useState } from 'react';

import { isNotNil } from '@budsbox/lib-es/guards';

import { isCellOccupied } from '#lib';

import { useMerge2State } from './state';

export function useMerge2<TKindId extends string, TModId extends string>(
  options: Readonly<Merge2ModelOptions<TKindId, TModId>>,
): Merge2Model<TKindId, TModId>;
export function useMerge2({
  initSettings,
  rules,
  onGameEnded,
}: Readonly<Merge2ModelOptions>): Merge2Model {
  const [state, dispatch] = useMerge2State({ initSettings, rules });
  const { board, events } = state;
  const [isEndGame, setIsEndGame] = useState(false);

  const { pickedTile, gameOver, gameOverReason } = state;

  const onTilePick: Merge2Model['onTilePick'] = useCallback(
    (tile) => dispatch({ type: 'pick', tile, rules }),
    [dispatch, rules],
  );

  const onTileDrop: Merge2Model['onTileDrop'] = useCallback(
    () => dispatch({ type: 'drop' }),
    [dispatch],
  );

  const onTilePlace: Merge2Model['onTilePlace'] = useCallback(
    (cell) => {
      if (isNotNil(pickedTile) && isCellOccupied(cell)) {
        const target = cell.tile;
        dispatch({
          type: 'merge',

          rules,
          target,
          targetCell: cell,
          tile: pickedTile,
        });
      }
    },
    [dispatch, pickedTile, rules],
  );

  useEffect(() => {
    if (gameOver && !isEndGame) {
      setIsEndGame(true);
      onGameEnded?.(gameOverReason!, { board, events, rules });
    }
  }, [board, events, gameOver, gameOverReason, isEndGame, onGameEnded, rules]);

  return useMemo(
    () => ({
      ...state,
      onTileDrop,
      onTilePick,
      onTilePlace,
      rules,
    }),
    [onTileDrop, onTilePick, onTilePlace, rules, state],
  );
}
