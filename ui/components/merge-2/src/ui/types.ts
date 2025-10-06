import type { PropsWithChildren } from 'react';

import type { WithClassName } from '@budsbox/lib-class-name';
import type { WithDynamicStyle } from '@budsbox/lib-react';
import type { UnTag } from '@budsbox/lib-types';

import type {
  Board,
  Cell,
  CellComputedState,
  Merge2ModelOptions,
  Tile,
  TileComputedState,
  TileKindId,
  TileModifierId,
} from '#types';

export interface Merge2Props<
  TKindId extends UnTag<TileKindId> = UnTag<TileKindId>,
  TModId extends UnTag<TileModifierId> = UnTag<TileModifierId>,
> extends Merge2ClassNames<TKindId, TModId>,
    Merge2ModelOptions<TKindId, TModId>,
    PropsWithChildren {}

export interface Merge2ClassNames<
  TKindId extends UnTag<TileKindId> = UnTag<TileKindId>,
  TModId extends UnTag<TileModifierId> = UnTag<TileModifierId>,
> extends WithClassName,
    WithClassName<
      'board',
      [board: Board<TKindId, TModId>, ctx: Merge2UiContext<TKindId, TModId>]
    >,
    WithClassName<
      'cell',
      [
        cell: Cell<TKindId, TModId>,
        state: Readonly<CellComputedState>,
        ctx: Merge2UiContext<TKindId, TModId>,
      ]
    >,
    WithClassName<
      'tile',
      [
        tile: Tile<TKindId, TModId>,
        cell: Cell<TKindId, TModId>,
        state: Readonly<TileComputedState>,
        ctx: Merge2UiContext<TKindId, TModId>,
      ]
    > {}

export interface Merge2UiContext<
  TKindId extends UnTag<TileKindId> = UnTag<TileKindId>,
  TModId extends UnTag<TileModifierId> = UnTag<TileModifierId>,
> extends Merge2ClassNames<TKindId, TModId> {}

export interface CellProps {
  readonly cell: Cell;
  readonly ref?: (cell: Cell, el: HTMLElement | null) => () => void;
  readonly onRelease?: (
    data: Readonly<{ x: number; y: number; tile: Tile; cell: Cell }>,
    domEvent: MouseEvent | PointerEvent | TouchEvent,
  ) => void;
}

export interface TileProps
  extends WithDynamicStyle<'', [tile: Tile, cell: Cell]> {
  readonly tile: Tile;
  readonly cell: Cell;
  readonly ref?: (element: HTMLElement | null) => void;
}

export interface BoardProps extends PropsWithChildren {}
