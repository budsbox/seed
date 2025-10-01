import type { FC } from 'react';

import type { TileId } from '../types';

import type { CellProps, Merge2CellState } from './types';

import { useDndContext, useDroppable } from '@dnd-kit/core';

import { cnFactory } from '@budsbox/lib-class-name';
import { sure } from '@budsbox/lib-es/logical';
import { dataAttrs } from '@budsbox/lib-react';

import { isCellOccupied, isMergeAllowed, tileCanMove } from '#lib';

import { TileDraggable } from './Tile';
import { useMerge2UiContext } from './context';
import classes from './style.module.scss';

export const Cell: FC<CellProps> = ({ cell }) => {
  const ctx = useMerge2UiContext();
  const {
    model: { board, rules, events },
    classNameCell,
  } = ctx;
  const dndCtx = useDndContext();
  const ruleContext = { board, rules, events };
  const isOccupied = isCellOccupied(cell);
  const activeTile = sure(
    dndCtx.active?.id,
    (id) => board.tiles.get(id as TileId) ?? null,
    null,
  );
  const isOwnTileDragging =
    isOccupied && sure(activeTile, ({ id }) => id === cell.tile.id, false);
  const canMove =
    isOccupied && tileCanMove({ tile: cell.tile, cell }, ruleContext);

  const canAcceptActiveTile =
    isOccupied &&
    sure(
      activeTile,
      (aTile) =>
        isMergeAllowed(
          {
            tile: aTile,
            target: cell.tile,
            targetCell: cell,
          },
          ruleContext,
        ),
      false,
    );

  const state: Merge2CellState = {
    canAccept: canAcceptActiveTile,
    empty: !isOccupied,
    occupied: isOccupied,
    tileCanMove: canMove,
    tileMoving: isOwnTileDragging,
  };
  const disabled = isOwnTileDragging || !canAcceptActiveTile;

  const droppable = useDroppable({
    id: cell.id,
    data: cell,
    disabled,
  });

  return (
    <div
      ref={droppable.setNodeRef}
      className={cnFactory(
        classes.cell,
        classNameCell,
        isOwnTileDragging && classes.tileDragging,
      )(cell, state, ctx)}
      key={cell.id}
      {...dataAttrs({
        id: cell.id,
        row: cell.pos[0],
        col: cell.pos[1],
        ...state,
      })}
    >
      {sure(cell.tile, (tile) => (
        <TileDraggable key={tile.id} tile={tile} cell={cell} />
      ))}
    </div>
  );
};
