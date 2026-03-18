/**
 * @module
 *
 * This module provides components for rendering tiles in the Merge-2 game.
 */

import type { TileProps } from './types';

import { useDraggable } from '@dnd-kit/core';
import { type ComponentPropsWithoutRef, type FC, useMemo } from 'react';

import { cnFactory } from '@budsbox/lib-class-name';
import { styleFactory } from '@budsbox/lib-react';

import { useTileState } from '#hooks';
import { tileDataAttrs } from '#lib';

import { useMerge2UiContext } from './context';
import classes from './style.module.scss';

/**
 * Component for rendering a tile.
 *
 * @param props - Component props.
 * @returns The rendered tile.
 */
export const Tile: FC<
  TileProps & Omit<ComponentPropsWithoutRef<'div'>, 'style'>
> = ({ tile, cell, style, ...rest }) => {
  const ctx = useMerge2UiContext();
  const state = useTileState(tile);
  const { classNameTile } = ctx;

  return (
    <div
      className={cnFactory(classes.tile, classNameTile)(tile, cell, state, ctx)}
      style={styleFactory(style)(tile, cell)}
      {...tileDataAttrs(tile, state)}
      {...rest}
    />
  );
};

/**
 * A draggable wrapper for the `Tile` component using `@dnd-kit/core`.
 *
 * @param props - Component props.
 * @returns The draggable tile component.
 */
export const TileDraggable: FC<Omit<TileProps, 'ref' | 'state'>> = ({
  tile,
  cell,
  style: propStyle,
}) => {
  const state = useTileState(tile);
  const { listeners, attributes, setNodeRef, transform } = useDraggable({
    id: tile.id,
    disabled: !state.canMove,
  });

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
    />
  );
};
