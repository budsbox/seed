import type { FC } from 'react';

import type { CellId, TileId } from '#types';

import type { BoardProps } from './types';

import { DndContext, MouseSensor, TouchSensor } from '@dnd-kit/core';

import { cnFactory } from '@budsbox/lib-class-name';
import { sure } from '@budsbox/lib-es/logical';

import { useMerge2Context } from '#context';

import { Cell as CCell } from './Cell';
import { useMerge2UiContext } from './context';
import classes from './style.module.scss';

export const Board: FC<BoardProps> = ({ children }) => {
  const { board, onTilePlace, onTilePick, onTileDrop } = useMerge2Context();

  return (
    <DndContext
      onDragStart={({ active }) =>
        void sure(board.tiles.get(active.id as TileId), onTilePick)
      }
      onDragEnd={({ over }) =>
        void sure(over?.id, (id) =>
          sure(board.cells.get(id as CellId), onTilePlace),
        )
      }
      onDragAbort={onTileDrop}
      onDragCancel={onTileDrop}
      sensors={[
        { sensor: TouchSensor, options: {} },
        { sensor: MouseSensor, options: {} },
      ]}
    >
      <BoardWithDnd>{children}</BoardWithDnd>
    </DndContext>
  );
};

export const BoardWithDnd: FC<BoardProps> = ({ children }) => {
  const ctx = useMerge2UiContext();
  const { board } = useMerge2Context();
  const { classNameBoard } = ctx;

  return (
    <div className={cnFactory(classes.board, classNameBoard)(board, ctx)}>
      {board.grid.flatMap((row) =>
        row.map((cell) => <CCell cell={cell} key={cell.id} />),
      )}
      {children}
    </div>
  );
};
