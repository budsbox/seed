/**
 * @module
 *
 * This module defines the core data structures, models, and rules for the Merge-2 game.
 * It includes definitions for the board, tiles, cells, and the game state transformation logic.
 */

import type {
  OverrideProperties,
  SetOptional,
  Tagged,
  UnknownArray,
} from 'type-fest';

import type { RNG, RNGOptions, RNGStatefulMethods } from '@budsbox/lib-random';
import type { UnTag, UnTagProperties } from '@budsbox/lib-types';

/* ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ BOARD ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ */

/**
 * Represents the game board state.
 *
 * @typeParam TKindId - The type of tile kind IDs.
 * @typeParam TModId - The type of tile modifier IDs.
 */
export interface Board<
  TKindId extends UnTag<TileKindId> = UnTag<TileKindId>,
  TModId extends UnTag<TileModifierId> = UnTag<TileModifierId>,
> {
  /**
   * A map of all cells indexed by their ID.
   */
  readonly cells: CellsMap;

  /**
   * Number of columns in the grid.
   */
  readonly cols: number;

  /**
   * The 2D grid of cells.
   */
  readonly grid: BoardGrid<TKindId, TModId>;

  /**
   * Map of available tile kinds.
   */
  readonly kinds: TileKindMap<TKindId>;

  /**
   * Map of available tile modifiers.
   */
  readonly modifiers: TileModifierMap<TModId>;

  /**
   * Total number of moves made.
   */
  readonly moves: number;

  /**
   * Number of rows in the grid.
   */
  readonly rows: number;

  /**
   * A map of all tiles indexed by their ID.
   */
  readonly tiles: TileMap<TKindId, TModId>;

  /**
   * Mapping from tile instance to its current cell.
   */
  readonly tileToCell: ReadonlyMap<
    Tile<TKindId, TModId>,
    Cell<TKindId, TModId>
  >;
}

/**
 * A 2D array representing the board grid.
 *
 * @typeParam TKindId - The type of tile kind IDs.
 * @typeParam TModId - The type of tile modifier IDs.
 */
export type BoardGrid<
  TKindId extends UnTag<TileKindId> = UnTag<TileKindId>,
  TModId extends UnTag<TileModifierId> = UnTag<TileModifierId>,
> = ReadonlyArray<ReadonlyArray<Cell<TKindId, TModId>>>;

/**
 * Represents a tile on the board.
 *
 * @typeParam TKindId - The type of tile kind IDs.
 * @typeParam TModId - The type of tile modifier IDs.
 */
export interface Tile<
  TKindId extends UnTag<TileKindId> = UnTag<TileKindId>,
  TModId extends UnTag<TileModifierId> = UnTag<TileModifierId>,
> {
  /**
   * Unique identifier for the tile.
   */
  readonly id: TileId;

  /**
   * The kind of tile.
   */
  readonly kind: TileKind<TKindId>;

  /**
   * List of modifiers applied to the tile.
   */
  readonly modifiers: TileModifiers<TModId>;

  /**
   * The rank of the tile, typically used for merging logic.
   */
  readonly rank: number;
}

/**
 * A map of tile IDs to {@link Tile} objects.
 *
 * @typeParam TKindId - The type of tile kind IDs.
 * @typeParam TModId - The type of tile modifier IDs.
 */
export type TileMap<
  TKindId extends UnTag<TileKindId> = UnTag<TileKindId>,
  TModId extends UnTag<TileModifierId> = UnTag<TileModifierId>,
> = ReadonlyMap<TileId, Tile<TKindId, TModId>>;

/**
 * Input format for creating or identifying a {@link Tile}.
 *
 * @typeParam TKindId - The type of tile kind IDs.
 * @typeParam TModId - The type of tile modifier IDs.
 */
export type TileInput<
  TKindId extends UnTag<TileKindId> = UnTag<TileKindId>,
  TModId extends UnTag<TileModifierId> = UnTag<TileModifierId>,
> = SetOptional<
  OverrideProperties<
    UnTagProperties<Tile<TKindId, TModId>>,
    {
      readonly kind: TKindId;
      readonly modifiers: readonly TModId[];
    }
  >,
  'id' | 'modifiers' | 'rank'
>;

/**
 * Represents a specific kind of tile.
 *
 * @typeParam TId - The type of tile kind ID.
 */
export interface TileKind<TId extends UnTag<TileKindId> = UnTag<TileKindId>> {
  /**
   * The unique ID of this tile kind.
   */
  readonly id: TileKindId<TId>;

  /**
   * The maximum rank achievable for this tile kind.
   */
  readonly maxRank: number;
}

/**
 * A map of tile kind IDs to {@link TileKind} objects.
 *
 * @typeParam TId - The type of tile kind ID.
 */
export type TileKindMap<TId extends UnTag<TileKindId> = UnTag<TileKindId>> =
  ReadonlyMap<TileKindId<TId>, TileKind<TId>>;

/**
 * Represents a modifier that can be applied to a tile.
 *
 * @typeParam TId - The type of tile modifier ID.
 */
export interface TileModifier<
  TId extends UnTag<TileModifierId> = UnTag<TileModifierId>,
> {
  /**
   * The unique ID of this tile modifier.
   */
  readonly id: TileModifierId<TId>;
}

/**
 * A map of tile modifier IDs to {@link TileModifier} objects.
 *
 * @typeParam TId - The type of tile modifier ID.
 */
export type TileModifierMap<
  TId extends UnTag<TileModifierId> = UnTag<TileModifierId>,
> = ReadonlyMap<TileModifierId<TId>, TileModifier<TId>>;

/**
 * A set of modifiers applied to a tile.
 *
 * @typeParam TId - The type of tile modifier ID.
 */
export type TileModifiers<
  TId extends UnTag<TileModifierId> = UnTag<TileModifierId>,
> = ReadonlySet<TileModifier<TId>>;

/**
 * Represents an empty cell in the grid.
 */
export interface EmptyCell {
  /**
   * The unique ID of the cell.
   */
  readonly id: CellId;

  /**
   * The grid position of the cell.
   */
  readonly pos: Position;

  /**
   * Always `null` for an empty cell.
   */
  readonly tile: null;
}

/**
 * Represents a cell occupied by a tile.
 *
 * @typeParam TKindId - The type of tile kind IDs.
 * @typeParam TModId - The type of tile modifier IDs.
 */
export interface OccupiedCell<
  TKindId extends UnTag<TileKindId> = UnTag<TileKindId>,
  TModId extends UnTag<TileModifierId> = UnTag<TileModifierId>,
> {
  /**
   * The unique ID of the cell.
   */
  readonly id: CellId;

  /**
   * The grid position of the cell.
   */
  readonly pos: Position;

  /**
   * The tile currently occupying this cell.
   */
  readonly tile: Tile<TKindId, TModId>;
}

/**
 * Represents a cell in the grid, which can be either empty or occupied.
 *
 * @typeParam TKindId - The type of tile kind IDs.
 * @typeParam TModId - The type of tile modifier IDs.
 */
export type Cell<
  TKindId extends UnTag<TileKindId> = UnTag<TileKindId>,
  TModId extends UnTag<TileModifierId> = UnTag<TileModifierId>,
> = EmptyCell | OccupiedCell<TKindId, TModId>;

/**
 * A map of cell IDs to {@link Cell} objects.
 */
export type CellsMap = ReadonlyMap<CellId, Cell>;

/**
 * Represents a [row, col] position in the grid.
 */
export type Position = readonly [row: number, col: number];

/**
 * Unique identifier for a tile.
 */
export type TileId = Tagged<string, 'tile-id'>;

/**
 * Unique identifier for a tile kind.
 *
 * @typeParam TId - The underlying string type for the ID.
 */
export type TileKindId<TId extends string = string> = Tagged<
  TId,
  'tile-kind-id'
>;

/**
 * Unique identifier for a tile modifier.
 *
 * @typeParam TId - The underlying string type for the ID.
 */
export type TileModifierId<TId extends string = string> = Tagged<
  TId,
  'tile-modifier-id'
>;

/**
 * Unique identifier for a cell.
 */
export type CellId = Tagged<string, 'cell-id'>;

/* ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ CONTEXTS ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ */

/**
 * Base context for game rules and state transformations.
 *
 * @typeParam TKindId - The type of tile kind IDs.
 * @typeParam TModId - The type of tile modifier IDs.
 */
export interface BaseContext<
  TKindId extends UnTag<TileKindId> = UnTag<TileKindId>,
  TModId extends UnTag<TileModifierId> = UnTag<TileModifierId>,
> {
  /**
   * The current board state.
   */
  readonly board: Board<TKindId, TModId>;

  /**
   * List of events that occurred during the current transformation.
   */
  readonly events: EventList;

  /**
   * The game rules being applied.
   */
  readonly rules: Rules<TKindId, TModId>;
}

/**
 * Context that includes a random number generator for rules that require randomness.
 *
 * @typeParam TKindId - The type of tile kind IDs.
 * @typeParam TModId - The type of tile modifier IDs.
 */
export interface RNGContext<
  TKindId extends UnTag<TileKindId> = UnTag<TileKindId>,
  TModId extends UnTag<TileModifierId> = UnTag<TileModifierId>,
> extends BaseContext<TKindId, TModId> {
  /**
   * The random number generator methods.
   */
  readonly rng: RNGStatefulMethods;
}

/* ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ RULES ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ */

/**
 * Defines the rules for a Merge-2 game.
 *
 * @typeParam TKindId - The type of tile kind IDs.
 * @typeParam TModId - The type of tile modifier IDs.
 */
export interface Rules<
  TKindId extends UnTag<TileKindId> = UnTag<TileKindId>,
  TModId extends UnTag<TileModifierId> = UnTag<TileModifierId>,
> {
  /**
   * Rule for merging tiles.
   */
  readonly merge?: MergeRule<TKindId, TModId>;

  /**
   * Rule for moving tiles.
   */
  readonly move?: MoveRule<TKindId, TModId>;

  /**
   * Rule for spawning new tiles.
   */
  readonly spawn?:
    | DefaultSpawnRuleOptions<TKindId, TModId>
    | SpawnRule<TKindId, TModId>;

  /**
   * Rule for determining the winning condition.
   */
  readonly win?: WinRule<TKindId, TModId>;
}

/**
 * A rule for spawning new tiles on the board.
 *
 * @param ctx - The {@link RNGContext} providing board state and randomness.
 * @returns An array of cells with new tiles spawned.
 * @typeParam TKindId - The type of tile kind IDs.
 * @typeParam TModId - The type of tile modifier IDs.
 */
export type SpawnRule<
  TKindId extends UnTag<TileKindId> = UnTag<TileKindId>,
  TModId extends UnTag<TileModifierId> = UnTag<TileModifierId>,
> = (ctx: RNGContext) => Array<Cell<TKindId, TModId>>;

/**
 * A rule for determining if two tiles can be merged.
 *
 * @param input - The {@link MergeRuleInput} containing tiles and target cell.
 * @param ctx - The {@link BaseContext} providing board state and rules.
 * @returns `true` if the merge is allowed, `false` otherwise.
 * @typeParam TKindId - The type of tile kind IDs.
 * @typeParam TModId - The type of tile modifier IDs.
 */
export type MergeRule<
  TKindId extends UnTag<TileKindId> = UnTag<TileKindId>,
  TModId extends UnTag<TileModifierId> = UnTag<TileModifierId>,
> = (
  input: Readonly<MergeRuleInput<TKindId, TModId>>,
  ctx: BaseContext<TKindId, TModId>,
) => boolean;

/**
 * A rule for determining if a tile can move to a specific cell.
 *
 * @param input - The {@link MoveRuleInput} containing the tile and target cell.
 * @param ctx - The {@link BaseContext} providing board state and rules.
 * @returns `true` if the move is allowed, `false` otherwise.
 * @typeParam TKindId - The type of tile kind IDs.
 * @typeParam TModId - The type of tile modifier IDs.
 */
export type MoveRule<
  TKindId extends UnTag<TileKindId> = UnTag<TileKindId>,
  TModId extends UnTag<TileModifierId> = UnTag<TileModifierId>,
> = (
  input: Readonly<MoveRuleInput<TKindId, TModId>>,
  ctx: BaseContext<TKindId, TModId>,
) => boolean;

/**
 * A rule for determining if the game has been won.
 *
 * @param ctx - The {@link BaseContext} providing board state and rules.
 * @returns `true` if the game is won, `false` otherwise.
 * @typeParam TKindId - The type of tile kind IDs.
 * @typeParam TModId - The type of tile modifier IDs.
 */
export type WinRule<
  TKindId extends UnTag<TileKindId> = UnTag<TileKindId>,
  TModId extends UnTag<TileModifierId> = UnTag<TileModifierId>,
> = (ctx: BaseContext<TKindId, TModId>) => boolean;

/**
 * Input for a {@link MergeRule}.
 *
 * @typeParam TKindId - The type of tile kind IDs.
 * @typeParam TModId - The type of tile modifier IDs.
 */
export interface MergeRuleInput<
  TKindId extends UnTag<TileKindId> = UnTag<TileKindId>,
  TModId extends UnTag<TileModifierId> = UnTag<TileModifierId>,
> {
  /**
   * The tile being moved or dropped onto the target.
   */
  target: Tile<TKindId, TModId>;

  /**
   * The cell where the merge is occurring.
   */
  targetCell: Cell<TKindId, TModId>;

  /**
   * The tile already present at the target location.
   */
  tile: Tile<TKindId, TModId>;
}

/**
 * Input for a {@link MoveRule}.
 *
 * @typeParam TKindId - The type of tile kind IDs.
 * @typeParam TModId - The type of tile modifier IDs.
 */
export interface MoveRuleInput<
  TKindId extends UnTag<TileKindId> = UnTag<TileKindId>,
  TModId extends UnTag<TileModifierId> = UnTag<TileModifierId>,
> {
  /**
   * The target cell for the move.
   */
  cell: Cell<TKindId, TModId>;

  /**
   * The tile being moved.
   */
  tile: Tile<TKindId, TModId>;
}

/**
 * Options for the default spawn rule.
 *
 * @typeParam TKindId - The type of tile kind IDs.
 * @typeParam TModId - The type of tile modifier IDs.
 */
export interface DefaultSpawnRuleOptions<
  TKindId extends UnTag<TileKindId> = UnTag<TileKindId>,
  TModId extends UnTag<TileModifierId> = UnTag<TileModifierId>,
> {
  /**
   * Initial tiles to place on the board when the game starts.
   */
  readonly initialTiles?: ReadonlyArray<TileInput<TKindId, TModId>>;
}

/* ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ MODEL ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ */

/**
 * The view model for the Merge-2 game, providing state and actions.
 *
 * @typeParam TKindId - The type of tile kind IDs.
 * @typeParam TModId - The type of tile modifier IDs.
 */
export interface Merge2Model<
  TKindId extends UnTag<TileKindId> = UnTag<TileKindId>,
  TModId extends UnTag<TileModifierId> = UnTag<TileModifierId>,
> extends Omit<Merge2State, 'rng'> {
  /**
   * The current board state.
   */
  readonly board: Readonly<Board<TKindId, TModId>>;

  /**
   * List of events that have occurred.
   */
  readonly events: ReadonlyArray<Merge2Event<TKindId, TModId>>;

  /**
   * The tile currently picked up by the user, if any.
   */
  readonly pickedTile: Tile<TKindId, TModId> | null;

  /**
   * The game rules.
   */
  readonly rules: Rules<TKindId, TModId>;

  /**
   * Callback when the user drops a tile.
   */
  readonly onTileDrop: (this: void) => void;

  /**
   * Callback when the user picks up a tile.
   *
   * @param tile
   */
  readonly onTilePick: (this: void, tile: Tile<TKindId, TModId>) => void;

  /**
   * Callback when the user places a tile on a cell.
   *
   * @param cell
   */
  readonly onTilePlace: (this: void, cell: Cell) => void;
}

/**
 * Options for initializing the {@link Merge2Model}.
 *
 * @typeParam TKindId - The type of tile kind IDs.
 * @typeParam TModId - The type of tile modifier IDs.
 */
export interface Merge2ModelOptions<
  TKindId extends UnTag<TileKindId> = UnTag<TileKindId>,
  TModId extends UnTag<TileModifierId> = UnTag<TileModifierId>,
> extends Pick<RNGOptions, 'seed'> {
  /**
   * Initial grid and tile settings.
   */
  readonly initSettings: InitSettings<TKindId, TModId>;

  /**
   * The game rules.
   */
  readonly rules: Rules<TKindId, TModId>;

  /**
   * Callback triggered when the game ends.
   *
   * @param reason
   * @param ctx
   */
  readonly onGameEnded?: (
    this: void,
    reason: GameOverReason,
    ctx: BaseContext<TKindId, TModId>,
  ) => void;
}

/**
 * Initial settings for the board and tiles.
 *
 * @typeParam TKindId - The type of tile kind IDs.
 * @typeParam TModId - The type of tile modifier IDs.
 */
export interface InitSettings<
  TKindId extends UnTag<TileKindId> = UnTag<TileKindId>,
  TModId extends UnTag<TileModifierId> = UnTag<TileModifierId>,
> {
  /**
   * Number of columns.
   */
  readonly cols: number;

  /**
   * Available tile kinds.
   */
  readonly kinds: ReadonlyArray<UnTagProperties<TileKind<TKindId>>>;

  /**
   * Number of rows.
   */
  readonly rows: number;

  /**
   * Optional available tile modifiers.
   */
  readonly modifiers?: ReadonlyArray<UnTagProperties<TileModifier<TModId>>>;

  /**
   * Seed for the random number generator.
   */
  readonly seed?: number | string;
}

/* ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ STATE ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ */

/**
 * The internal state of the Merge-2 game.
 */
export interface Merge2State {
  /**
   * The current board.
   */
  readonly board: Board;

  /**
   * Events that have occurred.
   */
  readonly events: readonly Merge2Event[];

  /**
   * Whether the game is over.
   */
  readonly gameOver: boolean;

  /**
   * The reason the game ended, or `null` if it's still ongoing.
   */
  readonly gameOverReason: GameOverReason | null;

  /**
   * The tile currently picked up.
   */
  readonly pickedTile: Tile | null;

  /**
   * The random number generator instance.
   */
  readonly rng: RNG;
}

/**
 * Context used for initializing the game state.
 */
export interface StateInitContext extends Pick<
  Merge2ModelOptions,
  'initSettings' | 'rules'
> {}

/**
 * A function that transforms the game state.
 *
 * @param interState - The intermediate game state.
 * @param ctx - The context for transformation.
 * @param args - Additional arguments.
 * @returns The transformed intermediate state.
 * @typeParam TARgs - Additional arguments for the transformation.
 */
export type StateTransformer<TARgs extends UnknownArray = []> = (
  interState: InterState,
  ctx: StateTransformerContext,
  ...args: TARgs
) => InterState;

/**
 * Context for {@link StateTransformer} functions.
 */
export type StateTransformerContext = Omit<RNGContext, 'board' | 'events'>;

/**
 * Intermediate state used during transformations, excluding the RNG.
 */
export type InterState = Omit<Merge2State, 'rng'>;

/**
 * Reasons why the game might end.
 */
export type GameOverReason = 'draw' | 'fail' | 'victory';

/* ──────────────────────────────── Actions ───────────────────────────────── */

/**
 * Represents a merge action.
 */
export interface MergeAction extends MergeRuleInput {
  /**
   * Discriminator for the action type.
   */
  readonly type: 'merge';

  /**
   * Optional overrides for game rules.
   */
  readonly rules?: Rules;
}

/**
 * Represents a pick action.
 */
export interface PickAction {
  /**
   * The tile being picked.
   */
  readonly tile: Tile;

  /**
   * Discriminator for the action type.
   */
  readonly type: 'pick';

  /**
   * Optional overrides for game rules.
   */
  readonly rules?: Rules;
}

/**
 * Represents a drop action.
 */
export interface DropAction {
  /**
   * Discriminator for the action type.
   */
  readonly type: 'drop';

  /**
   * Optional overrides for game rules.
   */
  readonly rules?: Rules;
}

/**
 * A union of all possible game actions.
 */
export type Merge2Action = DropAction | MergeAction | PickAction;

/* ───────────────────────────────── Events ───────────────────────────────── */

/**
 * A union of all possible game events.
 *
 * @typeParam TKindId - The type of tile kind IDs.
 * @typeParam TModId - The type of tile modifier IDs.
 */
export type Merge2Event<
  TKindId extends UnTag<TileKindId> = UnTag<TileKindId>,
  TModId extends UnTag<TileModifierId> = UnTag<TileModifierId>,
> = BoardEvent<TKindId, TModId> | EndGameEvent | PickTileEvent<TKindId, TModId>;

/**
 * A list of game events.
 *
 * @typeParam TKindId - The type of tile kind IDs.
 * @typeParam TModId - The type of tile modifier IDs.
 */
export type EventList<
  TKindId extends UnTag<TileKindId> = UnTag<TileKindId>,
  TModId extends UnTag<TileModifierId> = UnTag<TileModifierId>,
> = ReadonlyArray<Merge2Event<TKindId, TModId>>;

interface BaseEvent {
  readonly type: string;
}

/**
 * Represents a board-related event.
 *
 * @typeParam TKindId - The type of tile kind IDs.
 * @typeParam TModId - The type of tile modifier IDs.
 */
export interface BoardEvent<
  TKindId extends UnTag<TileKindId> = UnTag<TileKindId>,
  TModId extends UnTag<TileModifierId> = UnTag<TileModifierId>,
>
  extends BaseEvent, BoardsDiff<TKindId, TModId> {
  /**
   * The reason for the board change.
   */
  readonly reason: 'init' | 'merge' | 'spawn';

  /**
   * Discriminator for the event type.
   */
  readonly type: 'board';
}

/**
 * Represents an end-of-game event.
 */
export interface EndGameEvent extends BaseEvent {
  /**
   * The reason the game ended.
   */
  readonly reason: GameOverReason;

  /**
   * Discriminator for the event type.
   */
  readonly type: 'end';
}

/**
 * Represents a tile pick or drop event.
 *
 * @typeParam TKindId - The type of tile kind IDs.
 * @typeParam TModId - The type of tile modifier IDs.
 */
export interface PickTileEvent<
  TKindId extends UnTag<TileKindId> = UnTag<TileKindId>,
  TModId extends UnTag<TileModifierId> = UnTag<TileModifierId>,
> extends BaseEvent {
  /**
   * Whether the tile was picked or dropped.
   */
  readonly reason: 'drop' | 'pick';

  /**
   * The tile involved in the event, or `null` if dropped.
   */
  readonly tile: Tile<TKindId, TModId> | null;

  /**
   * Discriminator for the event type.
   */
  readonly type: 'pick';
}

/**
 * Describes the difference between two board states.
 *
 * @typeParam TKindId - The type of tile kind IDs.
 * @typeParam TModId - The type of tile modifier IDs.
 */
export interface BoardsDiff<
  TKindId extends UnTag<TileKindId> = UnTag<TileKindId>,
  TModId extends UnTag<TileModifierId> = UnTag<TileModifierId>,
> {
  /**
   * Cells added to the board.
   */
  readonly addedCells: ReadonlySet<Cell<TKindId, TModId>>;

  /**
   * Tiles added to the board.
   */
  readonly addedTiles: ReadonlySet<Tile<TKindId, TModId>>;

  /**
   * Map of moved tiles to their previous cell.
   */
  readonly movedTiles: ReadonlyMap<
    Tile<TKindId, TModId>,
    Cell<TKindId, TModId>
  >;

  /**
   * Cells removed from the board.
   */
  readonly removedCells: ReadonlySet<Cell<TKindId, TModId>>;

  /**
   * Tiles removed from the board.
   */
  readonly removedTiles: ReadonlySet<Tile<TKindId, TModId>>;

  /**
   * Map of updated cells to their previous state.
   */
  readonly updatedCells: ReadonlyMap<
    Cell<TKindId, TModId>,
    Cell<TKindId, TModId>
  >;
}

/* ──────────────────────────── Computed States ───────────────────────────── */

/**
 * Computed state for a cell, used by the UI.
 */
export interface CellComputedState {
  /**
   * Whether the cell can accept the currently picked tile.
   */
  readonly canAccept: boolean;

  /**
   * Whether the cell is empty.
   */
  readonly empty: boolean;

  /**
   * Whether the cell is occupied.
   */
  readonly occupied: boolean;

  /**
   * Computed state of the tile in this cell.
   */
  readonly tile: TileComputedState;
}

/**
 * Computed state for a tile, used by the UI.
 */
export interface TileComputedState {
  /**
   * Whether the tile can be moved.
   */
  readonly canMove: boolean;

  /**
   * Whether the tile is currently picked up.
   */
  readonly picked: boolean;
}
