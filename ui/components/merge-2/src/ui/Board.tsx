import type { FC } from 'react';

import type { CellId, TileId } from '../types';

import type { BoardProps } from './types';

import { DndContext, MouseSensor, TouchSensor } from '@dnd-kit/core';

import { cnFactory } from '@budsbox/lib-class-name';
import { isNotNil } from '@budsbox/lib-es/guards';

import { isCellOccupied } from '#lib';

import { Cell as CCell } from './Cell';
import { useMerge2UiContext } from './context';
import classes from './style.module.scss';

export const Board: FC<BoardProps> = ({ children }) => {
  const {
    model: { board, onTilePlaced },
    setActiveTile,
  } = useMerge2UiContext();
  const drop = () => void setActiveTile(null);

  return (
    <DndContext
      onDragStart={({ active }) =>
        void setActiveTile(board.tiles.get(active.id as TileId) ?? null)
      }
      onDragEnd={({ active, over }) => {
        if (isNotNil(over)) {
          const tileId = active.id as TileId;
          const cellId = over.id as CellId;
          const tile = board.tiles.get(tileId) ?? null;
          const targetCell = board.cells.get(cellId);

          if (
            isNotNil(tile) &&
            isNotNil(targetCell) &&
            isCellOccupied(targetCell)
          ) {
            onTilePlaced({
              tile,
              target: targetCell.tile,
              targetCell,
            });
          }
        }
      }}
      onDragAbort={drop}
      onDragCancel={drop}
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
  const {
    model: { board },
    classNameBoard,
  } = ctx;

  return (
    <div className={cnFactory(classes.board, classNameBoard)(board, ctx)}>
      {board.grid.flatMap((row) =>
        row.map((cell) => <CCell cell={cell} key={cell.id} />),
      )}
      {children}
    </div>
  );
};
