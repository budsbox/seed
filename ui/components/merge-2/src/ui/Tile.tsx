import type { Merge2TileState, TileProps } from './types';

import { useDraggable } from '@dnd-kit/core';
import { type ComponentPropsWithoutRef, type FC, useMemo } from 'react';

import { cnFactory } from '@budsbox/lib-class-name';
import { dataAttrs, styleFactory } from '@budsbox/lib-react';

import { tileCanMove } from '#lib';

import { useMerge2UiContext } from './context';
import classes from './style.module.scss';

export const Tile: FC<
  TileProps & Omit<ComponentPropsWithoutRef<'div'>, 'style'>
> = ({ tile, cell, style, state, ...rest }) => {
  const ctx = useMerge2UiContext();
  const { classNameTile } = ctx;

  return (
    <div
      className={cnFactory(classes.tile, classNameTile)(tile, cell, state, ctx)}
      style={styleFactory(style)(tile, cell)}
      {...dataAttrs({ id: tile.id, rank: tile.rank, kind: tile.kind.id })}
      {...rest}
    />
  );
};

export const TileDraggable: FC<Omit<TileProps, 'ref' | 'state'>> = ({
  tile,
  cell,
  style: propStyle,
}) => {
  const { model } = useMerge2UiContext();
  const canMove = tileCanMove({ tile, cell }, model);
  const { listeners, attributes, setNodeRef, transform, isDragging } =
    useDraggable({
      id: tile.id,
      disabled: !canMove,
    });

  const state: Merge2TileState = useMemo(
    () => ({
      canMove,
      moving: isDragging,
    }),
    [canMove, isDragging],
  );

  const { x, y } = transform ?? { x: 0, y: 0 };
  const style = useMemo(
    () =>
      styleFactory(propStyle, {
        [classes.tileDeltaX!]: x,
        [classes.tileDeltaY!]: y,
      }),
    [propStyle, x, y],
  );

  return (
    <Tile
      ref={setNodeRef}
      tile={tile}
      cell={cell}
      {...listeners}
      {...attributes}
      style={style}
      state={state}
    />
  );
};
