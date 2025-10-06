import type {
  OverrideProperties,
  SetOptional,
  Tagged,
  UnknownArray,
} from 'type-fest';

import type { RNG, RNGOptions, RNGStatefulMethods } from '@budsbox/lib-random';
import type { UnTag, UnTagProperties } from '@budsbox/lib-types';

/* ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ BOARD ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ */

export interface Board<
  TKindId extends UnTag<TileKindId> = UnTag<TileKindId>,
  TModId extends UnTag<TileModifierId> = UnTag<TileModifierId>,
> {
  readonly rows: number;
  readonly cols: number;
  readonly moves: number;
  readonly cells: CellsMap;
  readonly grid: BoardGrid<TKindId, TModId>;
  readonly tiles: TileMap<TKindId, TModId>;
  readonly tileToCell: ReadonlyMap<
    Tile<TKindId, TModId>,
    Cell<TKindId, TModId>
  >;
  readonly kinds: TileKindMap<TKindId>;
  readonly modifiers: TileModifierMap<TModId>;
}

export type BoardGrid<
  TKindId extends UnTag<TileKindId> = UnTag<TileKindId>,
  TModId extends UnTag<TileModifierId> = UnTag<TileModifierId>,
> = ReadonlyArray<ReadonlyArray<Cell<TKindId, TModId>>>;

export interface Tile<
  TKindId extends UnTag<TileKindId> = UnTag<TileKindId>,
  TModId extends UnTag<TileModifierId> = UnTag<TileModifierId>,
> {
  readonly id: TileId;

  readonly kind: TileKind<TKindId>;

  readonly rank: number;

  readonly modifiers: TileModifiers<TModId>;
}

export type TileMap<
  TKindId extends UnTag<TileKindId> = UnTag<TileKindId>,
  TModId extends UnTag<TileModifierId> = UnTag<TileModifierId>,
> = ReadonlyMap<TileId, Tile<TKindId, TModId>>;

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

export interface TileKind<TId extends UnTag<TileKindId> = UnTag<TileKindId>> {
  readonly id: TileKindId<TId>;

  readonly maxRank: number;
}

export type TileKindMap<TId extends UnTag<TileKindId> = UnTag<TileKindId>> =
  ReadonlyMap<TileKindId<TId>, TileKind<TId>>;

export interface TileModifier<
  TId extends UnTag<TileModifierId> = UnTag<TileModifierId>,
> {
  readonly id: TileModifierId<TId>;
}

export type TileModifierMap<
  TId extends UnTag<TileModifierId> = UnTag<TileModifierId>,
> = ReadonlyMap<TileModifierId<TId>, TileModifier<TId>>;

export type TileModifiers<
  TId extends UnTag<TileModifierId> = UnTag<TileModifierId>,
> = ReadonlySet<TileModifier<TId>>;

export interface EmptyCell {
  readonly id: CellId;
  readonly pos: Position;
  readonly tile: null;
}

export interface OccupiedCell<
  TKindId extends UnTag<TileKindId> = UnTag<TileKindId>,
  TModId extends UnTag<TileModifierId> = UnTag<TileModifierId>,
> {
  readonly id: CellId;
  readonly pos: Position;
  readonly tile: Tile<TKindId, TModId>;
}

export type Cell<
  TKindId extends UnTag<TileKindId> = UnTag<TileKindId>,
  TModId extends UnTag<TileModifierId> = UnTag<TileModifierId>,
> = EmptyCell | OccupiedCell<TKindId, TModId>;

export type CellsMap = ReadonlyMap<CellId, Cell>;

export type Position = readonly [row: number, col: number];

export type TileId = Tagged<string, 'tile-id'>;

export type TileKindId<TId extends string = string> = Tagged<
  TId,
  'tile-kind-id'
>;

export type TileModifierId<TId extends string = string> = Tagged<
  TId,
  'tile-modifier-id'
>;

export type CellId = Tagged<string, 'cell-id'>;

/* ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ CONTEXTS ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ */

export interface BaseContext<
  TKindId extends UnTag<TileKindId> = UnTag<TileKindId>,
  TModId extends UnTag<TileModifierId> = UnTag<TileModifierId>,
> {
  readonly board: Board<TKindId, TModId>;
  readonly rules: Rules<TKindId, TModId>;
  readonly events: EventList;
}

export interface RNGContext<
  TKindId extends UnTag<TileKindId> = UnTag<TileKindId>,
  TModId extends UnTag<TileModifierId> = UnTag<TileModifierId>,
> extends BaseContext<TKindId, TModId> {
  readonly rng: RNGStatefulMethods;
}

/* ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ RULES ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ */

export interface Rules<
  TKindId extends UnTag<TileKindId> = UnTag<TileKindId>,
  TModId extends UnTag<TileModifierId> = UnTag<TileModifierId>,
> {
  readonly spawn?:
    | DefaultSpawnRuleOptions<TKindId, TModId>
    | SpawnRule<TKindId, TModId>;
  readonly merge?: MergeRule<TKindId, TModId>;
  readonly move?: MoveRule<TKindId, TModId>;
  readonly win?: WinRule<TKindId, TModId>;
}

export type SpawnRule<
  TKindId extends UnTag<TileKindId> = UnTag<TileKindId>,
  TModId extends UnTag<TileModifierId> = UnTag<TileModifierId>,
> = (ctx: RNGContext) => Array<Cell<TKindId, TModId>>;

export type MergeRule<
  TKindId extends UnTag<TileKindId> = UnTag<TileKindId>,
  TModId extends UnTag<TileModifierId> = UnTag<TileModifierId>,
> = (
  input: Readonly<MergeRuleInput<TKindId, TModId>>,
  ctx: BaseContext<TKindId, TModId>,
) => boolean;

export type MoveRule<
  TKindId extends UnTag<TileKindId> = UnTag<TileKindId>,
  TModId extends UnTag<TileModifierId> = UnTag<TileModifierId>,
> = (
  input: Readonly<MoveRuleInput<TKindId, TModId>>,
  ctx: BaseContext<TKindId, TModId>,
) => boolean;

export type WinRule<
  TKindId extends UnTag<TileKindId> = UnTag<TileKindId>,
  TModId extends UnTag<TileModifierId> = UnTag<TileModifierId>,
> = (ctx: BaseContext<TKindId, TModId>) => boolean;

export interface MergeRuleInput<
  TKindId extends UnTag<TileKindId> = UnTag<TileKindId>,
  TModId extends UnTag<TileModifierId> = UnTag<TileModifierId>,
> {
  tile: Tile<TKindId, TModId>;
  target: Tile<TKindId, TModId>;
  targetCell: Cell<TKindId, TModId>;
}

export interface MoveRuleInput<
  TKindId extends UnTag<TileKindId> = UnTag<TileKindId>,
  TModId extends UnTag<TileModifierId> = UnTag<TileModifierId>,
> {
  tile: Tile<TKindId, TModId>;
  cell: Cell<TKindId, TModId>;
}

export interface DefaultSpawnRuleOptions<
  TKindId extends UnTag<TileKindId> = UnTag<TileKindId>,
  TModId extends UnTag<TileModifierId> = UnTag<TileModifierId>,
> {
  readonly initialTiles?: ReadonlyArray<TileInput<TKindId, TModId>>;
}

/* ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ MODEL ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ */

export interface Merge2Model<
  TKindId extends UnTag<TileKindId> = UnTag<TileKindId>,
  TModId extends UnTag<TileModifierId> = UnTag<TileModifierId>,
> extends Omit<Merge2State, 'rng'> {
  readonly board: Readonly<Board<TKindId, TModId>>;
  readonly events: ReadonlyArray<Merge2Event<TKindId, TModId>>;
  readonly rules: Rules<TKindId, TModId>;
  readonly pickedTile: Tile<TKindId, TModId> | null;
  readonly onTilePick: (this: void, tile: Tile<TKindId, TModId>) => void;
  readonly onTileDrop: (this: void) => void;
  readonly onTilePlace: (this: void, cell: Cell) => void;
}

export interface Merge2ModelOptions<
  TKindId extends UnTag<TileKindId> = UnTag<TileKindId>,
  TModId extends UnTag<TileModifierId> = UnTag<TileModifierId>,
> extends Pick<RNGOptions, 'seed'> {
  readonly initSettings: InitSettings<TKindId, TModId>;
  readonly rules: Rules<TKindId, TModId>;
  readonly onGameEnded?: (
    this: void,
    reason: GameOverReason,
    ctx: BaseContext<TKindId, TModId>,
  ) => void;
}

export interface InitSettings<
  TKindId extends UnTag<TileKindId> = UnTag<TileKindId>,
  TModId extends UnTag<TileModifierId> = UnTag<TileModifierId>,
> {
  readonly seed?: number | string;
  readonly rows: number;
  readonly cols: number;
  readonly kinds: ReadonlyArray<UnTagProperties<TileKind<TKindId>>>;
  readonly modifiers?: ReadonlyArray<UnTagProperties<TileModifier<TModId>>>;
}

/* ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ STATE ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ */

export interface Merge2State {
  readonly board: Board;
  readonly rng: RNG;
  readonly events: readonly Merge2Event[];
  readonly pickedTile: Tile | null;
  readonly gameOver: boolean;
  readonly gameOverReason: GameOverReason | null;
}

export interface StateInitContext
  extends Pick<Merge2ModelOptions, 'initSettings' | 'rules'> {}

export type StateTransformer<TARgs extends UnknownArray = []> = (
  interState: InterState,
  ctx: StateTransformerContext,
  ...args: TARgs
) => InterState;

export type StateTransformerContext = Omit<RNGContext, 'board' | 'events'>;

export type InterState = Omit<Merge2State, 'rng'>;

export type GameOverReason = 'draw' | 'fail' | 'victory';

/* ──────────────────────────────── Actions ───────────────────────────────── */

export interface MergeAction extends MergeRuleInput {
  readonly type: 'merge';
  readonly rules?: Rules;
}

export interface PickAction {
  readonly type: 'pick';
  readonly rules?: Rules;
  readonly tile: Tile;
}

export interface DropAction {
  readonly type: 'drop';
  readonly rules?: Rules;
}

export type Merge2Action = DropAction | MergeAction | PickAction;

/* ───────────────────────────────── Events ───────────────────────────────── */

export type Merge2Event<
  TKindId extends UnTag<TileKindId> = UnTag<TileKindId>,
  TModId extends UnTag<TileModifierId> = UnTag<TileModifierId>,
> = BoardEvent<TKindId, TModId> | EndGameEvent | PickTileEvent<TKindId, TModId>;

export type EventList<
  TKindId extends UnTag<TileKindId> = UnTag<TileKindId>,
  TModId extends UnTag<TileModifierId> = UnTag<TileModifierId>,
> = ReadonlyArray<Merge2Event<TKindId, TModId>>;

interface BaseEvent {
  readonly type: string;
}

export interface BoardEvent<
  TKindId extends UnTag<TileKindId> = UnTag<TileKindId>,
  TModId extends UnTag<TileModifierId> = UnTag<TileModifierId>,
> extends BaseEvent,
    BoardsDiff<TKindId, TModId> {
  readonly type: 'board';
  readonly reason: 'init' | 'merge' | 'spawn';
}

export interface EndGameEvent extends BaseEvent {
  readonly type: 'end';
  readonly reason: GameOverReason;
}

export interface PickTileEvent<
  TKindId extends UnTag<TileKindId> = UnTag<TileKindId>,
  TModId extends UnTag<TileModifierId> = UnTag<TileModifierId>,
> extends BaseEvent {
  readonly type: 'pick';
  readonly tile: Tile<TKindId, TModId> | null;
  readonly reason: 'drop' | 'pick';
}

export interface BoardsDiff<
  TKindId extends UnTag<TileKindId> = UnTag<TileKindId>,
  TModId extends UnTag<TileModifierId> = UnTag<TileModifierId>,
> {
  readonly addedTiles: ReadonlySet<Tile<TKindId, TModId>>;
  // map tile to the previous cell (possibly removed!)
  readonly movedTiles: ReadonlyMap<
    Tile<TKindId, TModId>,
    Cell<TKindId, TModId>
  >;
  readonly removedTiles: ReadonlySet<Tile<TKindId, TModId>>;
  readonly addedCells: ReadonlySet<Cell<TKindId, TModId>>;
  // maps a new cell obj to the old one
  readonly updatedCells: ReadonlyMap<
    Cell<TKindId, TModId>,
    Cell<TKindId, TModId>
  >;
  readonly removedCells: ReadonlySet<Cell<TKindId, TModId>>;
}

/* ──────────────────────────── Computed States ───────────────────────────── */

export interface CellComputedState {
  readonly occupied: boolean;
  readonly empty: boolean;
  readonly canAccept: boolean;
  readonly tile: TileComputedState;
}

export interface TileComputedState {
  readonly picked: boolean;
  readonly canMove: boolean;
}
