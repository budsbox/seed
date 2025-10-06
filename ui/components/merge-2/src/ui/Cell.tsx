import type { FC } from 'react';

import type { CellProps } from './types';

import { useDroppable } from '@dnd-kit/core';

import { cnFactory } from '@budsbox/lib-class-name';
import { sure } from '@budsbox/lib-es/logical';

import { useCellState } from '#hooks';
import { cellDataAttrs } from '#lib';

import { TileDraggable } from './Tile';
import { useMerge2UiContext } from './context';
import classes from './style.module.scss';

export const Cell: FC<CellProps> = ({ cell }) => {
  const ctx = useMerge2UiContext();
  const state = useCellState(cell);
  const { classNameCell } = ctx;

  const droppable = useDroppable({
    id: cell.id,
    data: cell,
    disabled: state.tile.picked || !state.canAccept,
  });

  return (
    <div
      ref={droppable.setNodeRef}
      className={cnFactory(
        classes.cell,
        classNameCell,
        state.tile.picked && classes.tileDragging,
      )(cell, state, ctx)}
      key={cell.id}
      {...cellDataAttrs(cell, state)}
    >
      {sure(cell.tile, (tile) => (
        <TileDraggable key={tile.id} tile={tile} cell={cell} />
      ))}
    </div>
  );
};
