import type { Cell, DefaultSpawnRuleOptions } from '#types';

import type { RNGContext, TileModifierId } from './types';

import { sure } from '@budsbox/lib-es/logical';

import { createTile, isCellEmpty, updateCell } from '#lib';

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
