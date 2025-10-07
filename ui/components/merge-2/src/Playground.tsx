/// <reference types="@budsbox/builder_vite/client" />

import type { FC } from 'react';

import classes from './playground.module.scss';
import { Merge2 } from './ui';

/**
 * Represents a functional React component for a library playground.
 *
 * @returns A JSX element.
 */
export const Playground: FC = () => {
  return (
    <div>
      <Merge2
        classNameBoard={classes.board}
        classNameCell={(_cell, state) => [
          classes.cell,
          state.canAccept && classes.canAccept,
        ]}
        classNameTile={(tile) => [
          classes.tile,
          {
            [classes.color!]: tile.kind.id === 'color',
            [classes.number!]: tile.kind.id === 'number',
          },
          // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
          classes[`rank${tile.rank as 0}`],
        ]}
        initSettings={{
          cols: 6,
          rows: 6,

          kinds: [
            { id: 'color', maxRank: 2 },
            { id: 'number', maxRank: 2 },
          ],
          modifiers: [{ id: 'locked' }, { id: 'hidden' }],
          seed: 145,
        }}
        rules={{
          win: ({ board }) =>
            [...board.tiles.values()].some(
              ({ rank, kind }) => rank === kind.maxRank,
            ),
        }}
      />
    </div>
  );
};
