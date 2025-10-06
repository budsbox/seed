import type { UnTag } from '@budsbox/lib-types';

import type { Tile, TileKindId, TileModifierId } from '#types';

import type { Merge2Props, Merge2UiContext } from './types';

import { type JSX, useMemo, useState } from 'react';

import { cnFactory } from '@budsbox/lib-class-name';
import { isNotNil } from '@budsbox/lib-es/guards';

import { Merge2Provider } from '#context';
import { useMerge2 } from '#model';

import { Board } from './Board';
import { Merge2UiProvider } from './context';
import classes from './style.module.scss';

export function Merge2<
  TKindId extends UnTag<TileKindId> = UnTag<TileKindId>,
  TModId extends UnTag<TileModifierId> = UnTag<TileModifierId>,
>(props: Readonly<Merge2Props<TKindId, TModId>>): JSX.Element;
export function Merge2({
  className,
  classNameBoard,
  classNameTile,
  classNameCell,
  children,
  ...modelOptions
}: Readonly<Merge2Props>): JSX.Element {
  const model = useMerge2(modelOptions);
  const [activeTile, setActiveTile] = useState<Tile | null>(null);

  const ctx: Merge2UiContext = useMemo(
    () => ({
      activeTile,
      className,
      classNameBoard,
      classNameCell,
      classNameTile,
      hasActiveTile: isNotNil(activeTile),
      model,
      setActiveTile,
    }),
    [
      className,
      classNameBoard,
      classNameCell,
      classNameTile,
      model,
      activeTile,
    ],
  );

  return (
    <div
      className={cnFactory(className)()}
      style={{
        [classes.boardRowsProp!]: model.board.rows.toFixed(0),
        [classes.boardColsProp!]: model.board.cols.toFixed(0),
      }}
    >
      <Merge2Provider value={model}>
        <Merge2UiProvider value={ctx}>
          <Board />
        </Merge2UiProvider>
      </Merge2Provider>
    </div>
  );
}
