/**
 * @module
 *
 * This module contains utility functions and state checks for the Merge-2 game.
 */

import type { UnwrapTagged } from 'type-fest';

import type { RNGStatefulMethods } from '@budsbox/lib-random';
import type { UnTag } from '@budsbox/lib-types';

import type {
  BaseContext,
  Board,
  BoardGrid,
  BoardsDiff,
  Cell,
  CellComputedState,
  CellId,
  EmptyCell,
  MergeRuleInput,
  MoveRuleInput,
  OccupiedCell,
  Position,
  RNGContext,
  Tile,
  TileComputedState,
  TileId,
  TileInput,
  TileKind,
  TileKindId,
  TileModifier,
  TileModifierId,
  TileModifiers,
} from '#types';

import { diff, intersection } from '@budsbox/lib-es/array';
import { isFalse, isFunction, isNil } from '@budsbox/lib-es/guards';
import { fif, sure } from '@budsbox/lib-es/logical';
import { type DataAttrsResolved, dataAttrs } from '@budsbox/lib-react';

/**
 * Checks if two entities (cells, tiles, etc.) have the same ID.
 *
 * @param a - The first entity to compare.
 * @param b - The second entity to compare.
 * @returns `true` if both entities have the same `id`, otherwise `false`.
 */
export const same = <T extends Cell | Tile | TileKind | TileModifier>(
  a: T,
  b: T,
): boolean => {
  return a.id === b.id;
};

/**
 * Determines whether two cells are identical by comparing their reference, ID, position, and tile content.
 *
 * @param a - The first cell to compare.
 * @param b - The second cell to compare.
 * @returns `true` if the cells are identical, otherwise `false`.
 */
export const isIdenticalCells = (a: Cell, b: Cell): boolean => {
  // by ref
  if (a === b) return true;
  // by id
  if (!same(a, b)) return false;
  // by position
  if (!samePosition(a.pos, b.pos)) return false;
  // by tiles
  return isCellOccupied(a) && isCellOccupied(b) ?
      same(a.tile, b.tile)
    : isCellEmpty(a) && isCellEmpty(b);
};

/**
 * Determines whether two tiles are of the same kind by comparing their `id` properties.
 *
 * @param a - The first tile to compare.
 * @param b - The second tile to compare.
 * @returns `true` if both tiles have the same `kind.id`, otherwise `false`.
 */
export const sameKind = (a: Tile, b: Tile): boolean => a.kind.id === b.kind.id;

/**
 * Checks if two tiles have the same rank.
 *
 * @param a - The first tile.
 * @param b - The second tile.
 * @returns `true` if both tiles have the same rank, otherwise `false`.
 */
export const sameRank = (a: Tile, b: Tile): boolean => a.rank === b.rank;

/**
 * Checks if two grid positions are the same.
 *
 * @param a - The first position.
 * @param b - The second position.
 * @returns `true` if both positions have the same row and column, otherwise `false`.
 */
export const samePosition = (a: Position, b: Position): boolean =>
  a.every((v, i) => v === b[i]);

/**
 * Creates a `Tile` object based on the specified predefined tile and provided mappings for kinds and modifiers.
 *
 * @param ctx - An immutable object containing maps for resolving tile kinds and tile modifiers.
 * @param ctx.kinds - A map where tile kind identifiers map to their respective `TileKind` definitions.
 * @param ctx.modifiers - A map where tile modifier identifiers map to their respective `TileModifier` definitions.
 * @param input - The predefined tile object containing an identifier, kind, and optional modifiers.
 * @returns A `Tile` object containing the tile ID, resolved kind, and resolved modifiers.
 * @throws TypeError If the specified kind in the predefined tile does not exist in the provided `kinds` map.
 * @throws TypeError If any of the specified modifiers in the predefined tile does not exist in the provided `modifiers` map.
 * @typeParam TKindId - The type of the tile kind identifier.
 * @typeParam TModId - The type of the tile modifier identifier.
 */
export const createTile = (ctx: RNGContext, input: TileInput): Tile => {
  const { kinds, modifiers: modifierMap } = ctx.board;
  const id = genTileId(ctx.rng, input.id);
  const kind = kinds.get(castKindId(input.kind));
  if (isNil(kind)) {
    throw new TypeError(`Unknown kind: ${input.kind}`);
  }

  const modifiers: TileModifiers = new Set(
    input.modifiers?.map((mUnId) => {
      const mId = castModifierId(mUnId);
      const modifier = modifierMap.get(mId);
      if (isNil(modifier)) {
        throw new TypeError(`Unknown modifier: ${mId}`);
      }
      return modifier;
    }) ?? [],
  );

  return {
    id,
    kind,
    rank: input.rank ?? 0,
    modifiers,
  };
};

/**
 * Generates a unique Tile ID for a tile. If a predefined ID is provided, it uses that ID;
 * otherwise, it generates a new ID using the `rng.nextId` method from the provided (via context) `rng` object.
 *
 * @param rng - The random number generator (RNG) object from the context.
 * @param predefinedId - An optional string representing a predefined Tile ID. If provided, this ID will be used instead of generating a new one.
 * @returns A unique Tile ID for a tile.
 */
export const genTileId = (
  rng: RNGStatefulMethods,
  predefinedId?: string,
): TileId => sure(predefinedId, (id) => id, rng.nextId) as TileId;

/**
 * Generates a unique Cell ID.
 *
 * @param rng - The random number generator to use.
 * @returns A new unique {@link CellId}.
 */
export const genCellId = (rng: RNGStatefulMethods): CellId =>
  rng.nextId() as CellId;

/**
 * A utility function to cast a plain `kindId` to a strongly typed, tagged `TileKindId`.
 *
 * @param kindId - The kind identifier to be cast.
 * @returns The input `modifierId` cast to the `TileKindId` type.
 */
export const castKindId = <
  TKindId extends UnTag<TileKindId> = UnTag<TileKindId>,
>(
  kindId: TKindId,
): TileKindId<TKindId> => kindId as TileKindId<TKindId>;

/**
 * A utility function to cast a plain `modifierId` to a strongly typed, tagged `TileModifierId`.
 *
 * @param modifierId - The modifier identifier to be cast.
 * @returns The input `modifierId` cast to the `TileModifierId` type.
 */
export const castModifierId = <TModId extends UnwrapTagged<TileModifierId>>(
  modifierId: TModId,
): TileModifierId<TModId> => modifierId as TileModifierId<TModId>;

/**
 * Update an existing cell with an optional tile.
 *
 * @param cell - The original cell to update.
 * @param tile - The tile to place in the cell, or `null` to empty it.
 * @returns A new {@link Cell} instance.
 */
export const updateCell = (cell: Cell, tile: Tile | null = null): Cell => ({
  ...cell,
  tile,
});

/**
 * Checks if a cell is empty.
 *
 * @param cell - The cell to check.
 * @returns `true` if the cell has no tile, otherwise `false`.
 */
export const isCellEmpty = (cell: Cell): cell is EmptyCell => isNil(cell.tile);

/**
 * Checks if a cell is occupied by a tile.
 *
 * @param cell - The cell to check.
 * @returns `true` if the cell has a tile, otherwise `false`.
 */
export const isCellOccupied = (cell: Cell): cell is OccupiedCell =>
  !isCellEmpty(cell);

/**
 * Updates the board with a new set of cells, recalculating grid and tile maps.
 *
 * @param board - The current board.
 * @param cells - The new list of cells.
 * @returns A new {@link Board} instance.
 */
export const updateBoardCells = (
  board: Board,
  cells: readonly Cell[],
): Board => {
  const updatedGrid = cells.reduce(updateGrid, board.grid);
  const newCells = updatedGrid.flat();
  const occupiedCells = newCells.filter(isCellOccupied);

  const newBoard: Board = {
    ...board,
    cells: new Map(updatedGrid.flat().map((cell) => [cell.id, cell])),
    grid: updatedGrid,
    tileToCell: new Map(occupiedCells.map((cell) => [cell.tile, cell])),
    tiles: new Map(occupiedCells.map(({ tile }) => [tile.id, tile])),
  };

  return newBoard;
};

/**
 * Updates a single cell within a board grid.
 *
 * @param grid - The current grid.
 * @param cell - The updated cell.
 * @returns A new {@link BoardGrid} instance.
 * @throws {@link Error} if the cell position is out of bounds.
 */
export const updateGrid = (grid: BoardGrid, cell: Cell): BoardGrid => {
  const {
    pos: [r, c],
  } = cell;

  const gridRowN = grid.length;
  const gridColsN = grid[0]?.length ?? 0;

  if (r >= gridRowN || c >= gridColsN) {
    throw new Error(
      // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
      `The cell ${cell.id}, position [${r}, ${c}] is out of bounds [0, ${gridRowN - 1}][0, ${gridColsN - 1}]`,
    );
  }

  return grid.map((row, i) =>
    i === r ? row.map((col, j) => (j === c ? cell : col)) : row,
  );
};

/**
 * Calculates the difference between two board states.
 *
 * @param a - The original board.
 * @param b - The new board.
 * @returns A {@link BoardsDiff} object describing the changes.
 */
export const boardsDiff = (a: Board, b: Board): BoardsDiff => {
  const aCellIds = [...a.cells.keys()];
  const bCellIds = [...a.cells.keys()];

  const removedCellIds = diff(aCellIds, bCellIds);
  const addedCellIds = diff(bCellIds, aCellIds);
  const updatedCellIds = intersection(aCellIds, bCellIds).filter(
    (id) => !isIdenticalCells(a.cells.get(id)!, b.cells.get(id)!),
  );

  const aTileIds = [...a.tiles.keys()];
  const bTileIds = [...b.tiles.keys()];

  const removedTileIds = diff(aTileIds, bTileIds);
  const addedTileIds = diff(bTileIds, aTileIds);
  const movedTileIds = intersection(aTileIds, bTileIds).filter(
    (id) =>
      !same(
        a.tileToCell.get(a.tiles.get(id)!)!,
        b.tileToCell.get(b.tiles.get(id)!)!,
      ),
  );

  return {
    addedCells: new Set(addedCellIds.map((id) => b.cells.get(id)!)),
    removedCells: new Set(removedCellIds.map((id) => a.cells.get(id)!)),
    updatedCells: new Map(
      updatedCellIds.map((id) => [b.cells.get(id)!, a.cells.get(id)!]),
    ),

    addedTiles: new Set(addedTileIds.map((id) => b.tiles.get(id)!)),
    movedTiles: new Map(
      movedTileIds.map((id) => [
        b.tiles.get(id)!,
        a.tileToCell.get(a.tiles.get(id)!)!,
      ]),
    ),
    removedTiles: new Set(removedTileIds.map((id) => a.tiles.get(id)!)),
  };
};

/**
 * Checks if merging two tiles is allowed based on game rules and state.
 *
 * @param input - The merge rule input.
 * @param ctx - The base context.
 * @returns `true` if merge is allowed, otherwise `false`.
 */
export const isMergeAllowed = (
  input: Readonly<MergeRuleInput>,
  ctx: BaseContext,
): boolean => {
  const { tile, target } = input;
  const { rules } = ctx;
  return (
    !gameIsOver(ctx) &&
    !same(tile, target) &&
    sameKind(tile, target) &&
    sameRank(tile, target) &&
    target.rank < target.kind.maxRank &&
    fif(rules.merge, isFunction, (merge) => !isFalse(merge(input, ctx)), true)
  );
};

/**
 * Checks if a tile can move to a target cell.
 *
 * @param input - The move rule input.
 * @param ctx - The base context.
 * @returns `true` if the move is allowed, otherwise `false`.
 */
export const tileCanMove = (
  input: Readonly<MoveRuleInput>,
  ctx: BaseContext,
): boolean => {
  const { tile } = input;
  return (
    !gameIsOver(ctx) &&
    tile.rank < tile.kind.maxRank &&
    fif(ctx.rules.move, isFunction, (move) => move(input, ctx), true)
  );
};

/**
 * Checks if the game is over based on the event list.
 *
 * @param ctx - Object containing game events.
 * @returns `true` if an 'end' event is present, otherwise `false`.
 */
export const gameIsOver = ({ events }: Pick<BaseContext, 'events'>): boolean =>
  events.some(({ type }) => type === 'end');

type TileDataAttrsInput = Readonly<{
  kind: string;
  modifiers: string[];
  rank: number;
  canMove: boolean;
  picked: boolean;
}>;

const tileDataAttrsInput = (
  { rank, modifiers, kind }: Tile,
  { canMove, picked }: TileComputedState,
): TileDataAttrsInput => {
  return {
    canMove,
    kind: kind.id,
    modifiers: [...modifiers].map(({ id }) => id),
    picked,
    rank,
  };
};

type CellDataAttrsInput = Readonly<
  Omit<CellComputedState, 'tile'> & {
    tile?: TileDataAttrsInput;
  }
>;

/**
 * Formats tile information into data attributes for use in React components.
 *
 * @param tile - The tile information to be formatted.
 * @param state - The calculated visual state of the tile.
 * @returns A mapping of data attributes that can be spread onto a tile's DOM element.
 */
export const tileDataAttrs = (
  tile: Tile,
  state: TileComputedState,
): DataAttrsResolved<TileDataAttrsInput> => {
  return dataAttrs(tileDataAttrsInput(tile, state));
};

/**
 * Formats cell information into data attributes for use in React components.
 *
 * @param cell - The cell information to be formatted.
 * @param state - The calculated visual state of the cell.
 * @returns A mapping of data attributes that can be spread onto a cell's DOM element.
 */
export const cellDataAttrs = (
  cell: Cell,
  state: CellComputedState,
): DataAttrsResolved<CellDataAttrsInput> => {
  return dataAttrs({
    ...state,
    tile:
      isCellOccupied(cell) ? tileDataAttrsInput(cell.tile, state.tile) : null,
  });
};
