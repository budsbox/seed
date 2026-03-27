/**
 * @module
 *
 * This module defines the props and context for the Merge-2 game UI components.
 */

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

/**
 * Props for the main {@link Merge2} component.
 *
 * @typeParam TKindId - The type of tile kind IDs.
 * @typeParam TModId - The type of tile modifier IDs.
 */
export interface Merge2Props<
  TKindId extends UnTag<TileKindId> = UnTag<TileKindId>,
  TModId extends UnTag<TileModifierId> = UnTag<TileModifierId>,
>
  extends
    Merge2ClassNames<TKindId, TModId>,
    Merge2ModelOptions<TKindId, TModId>,
    PropsWithChildren {}

/**
 * Class names for various elements of the Merge-2 UI. May be plain or
 * a function that returns a string based on the provided parameters.
 *
 * @typeParam TKindId - The type of tile kind IDs.
 * @typeParam TModId - The type of tile modifier IDs.
 */
export interface Merge2ClassNames<
  TKindId extends UnTag<TileKindId> = UnTag<TileKindId>,
  TModId extends UnTag<TileModifierId> = UnTag<TileModifierId>,
>
  extends
    WithClassName,
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

/**
 * Context for the Merge-2 UI, extending class names.
 *
 * @typeParam TKindId - The type of tile kind IDs.
 * @typeParam TModId - The type of tile modifier IDs.
 */
export interface Merge2UiContext<
  TKindId extends UnTag<TileKindId> = UnTag<TileKindId>,
  TModId extends UnTag<TileModifierId> = UnTag<TileModifierId>,
> extends Merge2ClassNames<TKindId, TModId> {}

/**
 * Props for the {@link Cell} component.
 */
export interface CellProps {
  /**
   * The cell data.
   */
  readonly cell: Cell;

  /**
   * Callback to get a reference to the cell's DOM element.
   *
   * @param cell
   * @param el
   */
  readonly ref?: (cell: Cell, el: HTMLElement | null) => () => void;

  /**
   * Callback triggered when a tile is released over the cell.
   *
   * @param data
   * @param domEvent
   */
  readonly onRelease?: (
    data: Readonly<{ x: number; y: number; tile: Tile; cell: Cell }>,
    domEvent: MouseEvent | PointerEvent | TouchEvent,
  ) => void;
}

/**
 * Props for the {@link Tile} component.
 */
export interface TileProps extends WithDynamicStyle<
  '',
  [tile: Tile, cell: Cell]
> {
  /**
   * The cell where the tile is located.
   */
  readonly cell: Cell;

  /**
   * The tile data.
   */
  readonly tile: Tile;

  /**
   * Callback to get a reference to the tile's DOM element.
   *
   * @param element
   */
  readonly ref?: (element: HTMLElement | null) => void;
}

/**
 * Props for the {@link Board} component.
 */
export interface BoardProps extends PropsWithChildren {}
