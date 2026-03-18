/**
 * @module
 *
 * This module provides React hooks for interacting with the Merge-2 game state and context.
 */

import type { Cell, CellComputedState, Tile, TileComputedState } from '#types';

import { useMemo } from 'react';

import { isNotNil } from '@budsbox/lib-es/guards';
import { sure } from '@budsbox/lib-es/logical';

import { isCellOccupied, isMergeAllowed, same, tileCanMove } from '#lib';

import { useMerge2Context } from './context';

/**
 * Hook to compute the current state of a tile (e.g., if it can move or is picked up).
 *
 * @param tile - The tile to compute state for, or `null`.
 * @returns The computed state for the tile.
 */
export const useTileState = (tile: Tile | null): TileComputedState => {
  const model = useMerge2Context();
  const { board, pickedTile } = model;
  const tileExists = isNotNil(tile);
  const { canMove, picked } =
    tileExists ?
      {
        canMove: sure(
          board.tileToCell.get(tile),
          (cell) => tileCanMove({ tile, cell }, model),
          false,
        ),
        picked: isNotNil(pickedTile) && same(pickedTile, tile),
      }
    : defaultTileState;

  return useMemo(
    () => (tileExists ? { canMove, picked } : defaultTileState),
    [canMove, picked, tileExists],
  );
};

/**
 * Hook to compute the current state of a cell (e.g., if it's occupied or can accept a merge).
 *
 * @param cell - The cell to compute state for.
 * @returns The computed state for the cell.
 */
export const useCellState = (cell: Cell): CellComputedState => {
  const model = useMerge2Context();
  const occupied = isCellOccupied(cell);
  const tile = useTileState(cell.tile);
  const canAccept =
    occupied &&
    sure(
      model.pickedTile,
      (pickedTile) =>
        isMergeAllowed(
          {
            tile: pickedTile,
            target: cell.tile,
            targetCell: cell,
          },
          model,
        ),
      false,
    );

  return useMemo(
    () => ({
      occupied,
      empty: !occupied,
      canAccept,
      tile,
    }),
    [canAccept, occupied, tile],
  );
};

const defaultTileState = {
  canMove: false,
  picked: false,
} as const satisfies TileComputedState;
