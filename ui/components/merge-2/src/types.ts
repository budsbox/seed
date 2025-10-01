import type { OverrideProperties, SetOptional, Tagged } from 'type-fest';

import type { RNG, RNGOptions, RNGStatefulMethods } from '@budsbox/lib-random';
import type { UnTag, UnTagProperties } from '@budsbox/lib-types';

export interface Tile<
  TKindId extends UnTag<TileKindId> = UnTag<TileKindId>,
  TModId extends UnTag<TileModifierId> = UnTag<TileModifierId>,
> {
  readonly id: TileId;

  readonly kind: TileKind<TKindId>;

  readonly rank: number;

  readonly modifiers: TileModifierMap<TModId>;
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

export type SpawnRule<
  TKindId extends UnTag<TileKindId> = UnTag<TileKindId>,
  TModId extends UnTag<TileModifierId> = UnTag<TileModifierId>,
> = (ctx: RNGContext) => Array<Cell<TKindId, TModId>>;

export interface DefaultSpawnRuleOptions<
  TKindId extends UnTag<TileKindId> = UnTag<TileKindId>,
  TModId extends UnTag<TileModifierId> = UnTag<TileModifierId>,
> {
  readonly initialTiles?: ReadonlyArray<TileInput<TKindId, TModId>>;
}

export interface MergeRuleInput<
  TKindId extends UnTag<TileKindId> = UnTag<TileKindId>,
  TModId extends UnTag<TileModifierId> = UnTag<TileModifierId>,
> {
  tile: Tile<TKindId, TModId>;
  target: Tile<TKindId, TModId>;
  targetCell: Cell<TKindId, TModId>;
}

export type MergeRule<
  TKindId extends UnTag<TileKindId> = UnTag<TileKindId>,
  TModId extends UnTag<TileModifierId> = UnTag<TileModifierId>,
> = (
  input: Readonly<MergeRuleInput<TKindId, TModId>>,
  ctx: BaseContext<TKindId, TModId>,
) => boolean;

export interface MoveRuleInput<
  TKindId extends UnTag<TileKindId> = UnTag<TileKindId>,
  TModId extends UnTag<TileModifierId> = UnTag<TileModifierId>,
> {
  tile: Tile<TKindId, TModId>;
  cell: Cell<TKindId, TModId>;
}

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

export interface Merge2Model<
  TKindId extends UnTag<TileKindId> = UnTag<TileKindId>,
  TModId extends UnTag<TileModifierId> = UnTag<TileModifierId>,
> {
  readonly board: Readonly<Board<TKindId, TModId>>;
  readonly rules: Rules<TKindId, TModId>;
  readonly onTilePlaced: (data: Readonly<MergeRuleInput>) => void;
  readonly events: ReadonlyArray<Merge2Event<TKindId, TModId>>;
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

export interface Merge2ModelOptions<
  TKindId extends UnTag<TileKindId> = UnTag<TileKindId>,
  TModId extends UnTag<TileModifierId> = UnTag<TileModifierId>,
> extends Pick<RNGOptions, 'seed'> {
  readonly initSettings: InitSettings<TKindId, TModId>;
  readonly rules?: Rules<TKindId, TModId>;
  readonly onGameEnded?: (ctx: BaseContext<TKindId, TModId>) => void;
}

export interface InitContext
  extends Pick<Merge2ModelOptions, 'initSettings' | 'rules'> {}

export interface Merge2State {
  readonly board: Board;
  readonly rng: RNG;
  readonly events: readonly Merge2Event[];
}

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

export interface EndGameEvent extends BaseEvent {
  readonly type: 'end';
  readonly reason: 'draw' | 'fail' | 'victory';
}

export type Merge2Event<
  TKindId extends UnTag<TileKindId> = UnTag<TileKindId>,
  TModId extends UnTag<TileModifierId> = UnTag<TileModifierId>,
> = BoardEvent<TKindId, TModId> | EndGameEvent;

export type EventList<
  TKindId extends UnTag<TileKindId> = UnTag<TileKindId>,
  TModId extends UnTag<TileModifierId> = UnTag<TileModifierId>,
> = ReadonlyArray<Merge2Event<TKindId, TModId>>;

export interface MergeAction extends MergeRuleInput {
  readonly type: 'merge';
  readonly rules?: Rules;
}

export interface TestAction {
  readonly type: 'test';
  readonly rules?: Rules;
}

export type Merge2Action = MergeAction | TestAction;

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
