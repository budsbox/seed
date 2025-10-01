import type { Merge2Model, Merge2ModelOptions } from '#types';

import { useCallback, useEffect, useMemo, useState } from 'react';

import { endGameHappened } from '#lib';

import { useMerge2State } from './state';

export function useMerge2<TKindId extends string, TModId extends string>(
  options: Readonly<Merge2ModelOptions<TKindId, TModId>>,
): Merge2Model<TKindId, TModId>;
export function useMerge2({
  initSettings,
  rules = {},
  onGameEnded,
}: Readonly<Merge2ModelOptions>): Merge2Model {
  const [state, dispatch] = useMerge2State({ initSettings });
  const { board, events } = state;
  const [isEndGame, setIsEndGame] = useState(false);

  const onTilePlaced: Merge2Model['onTilePlaced'] = useCallback(
    (input) => {
      dispatch({ type: 'merge', ...input, rules });
    },
    [dispatch, rules],
  );

  useEffect(() => {
    if (endGameHappened({ events }) && !isEndGame) {
      setIsEndGame(true);
      onGameEnded?.({ board, events, rules });
    }
  }, [board, events, isEndGame, onGameEnded, rules]);

  return useMemo(
    () => ({ ...state, rules, onTilePlaced }),
    [onTilePlaced, rules, state],
  );
}
