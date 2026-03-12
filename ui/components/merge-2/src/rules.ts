/**
 * @module
 *
 * This module defines the default game rules for Merge-2.
 */

import type { Cell, DefaultSpawnRuleOptions } from '#types';

import type { RNGContext, TileModifierId } from './types';

import { sure } from '@budsbox/lib-es/logical';

import { createTile, isCellEmpty, updateCell } from '#lib';

/**
 * The default spawn rule for the Merge-2 game.
 * It fills empty cells with new tiles based on the provided options or randomly.
 *
 * @param ctx - The {@link RNGContext} providing board state and randomness.
 * @param options - Configuration options for the spawn rule.
 * @returns An array of updated cells with new tiles spawned.
 */
export const defaultSpawnRule = (
  ctx: RNGContext,
  options: DefaultSpawnRuleOptions = {},
): Cell[] => {
  const { rng, board, events } = ctx;
  const { kinds, modifiers, cells } = board;
  const emptyCells = rng.shuffle([...cells.values()].filter(isCellEmpty));
  const initialInput = sure(options.initialTiles, (tiles) => [...tiles], []);
  const updatedCells: Cell[] = [];
  if (
    events.filter(
      (event) => !(event.type === 'board' && event.reason === 'init'),
    ).length === 0
  ) {
    while (emptyCells.length > 0 && initialInput.length > 0) {
      const emptyCell = emptyCells.shift()!;
      const input = initialInput.shift()!;
      updatedCells.push(updateCell(emptyCell, createTile(ctx, input)));
    }
  }

  const kindIds = [...kinds.keys()];
  const modifierIds = [...modifiers.keys()];

  while (emptyCells.length > 0) {
    const emptyCell = emptyCells.shift()!;
    updatedCells.push(
      updateCell(
        emptyCell,
        createTile(ctx, {
          kind: rng.nextInRange(...kindIds)!,
          modifiers: modifierIds.reduce<TileModifierId[]>(
            (acc, id) => (rng.nextBool(0.2) ? [...acc, id] : acc),
            [],
          ),
        }),
      ),
    );
  }

  return updatedCells;
};
