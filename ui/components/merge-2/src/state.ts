import type {
  Board,
  InitContext,
  Merge2Action,
  Merge2State,
  TileKindMap,
} from '#types';

import type {
  BoardEvent,
  EmptyCell,
  EventList,
  MergeRuleInput,
  RNGContext,
} from './types';

import { type Reducer, useMemo, useReducer } from 'react';

import { nArray } from '@budsbox/lib-es/array';
import { isFunction } from '@budsbox/lib-es/guards';
import { fif } from '@budsbox/lib-es/logical';
import { createRng } from '@budsbox/lib-random';

import {
  boardsDiff,
  castKindId,
  castModifierId,
  createTile,
  endGameHappened,
  genCellId,
  same,
  sameKind,
  sameRank,
  updateBoardCells,
  updateCell,
} from './lib';
import { defaultSpawnRule } from './rules';

export const useMerge2State = (
  initContext: InitContext,
): [Merge2State, (action: Readonly<Merge2Action>) => Merge2State] => {
  const [state, dispatch] = useReducer(
    merge2reducer,
    initContext,
    createInitialState,
  );

  return useMemo(
    () => [
      state,
      (action) => {
        dispatch(action);
        const updatedState = merge2reducer(state, action);
        return updatedState;
      },
    ],
    [state],
  );
};

const merge2reducer: Reducer<Merge2State, Merge2Action> = (
  prevState,
  action,
): Merge2State => {
  const { rng: sRng, board, events } = prevState;

  const [newState, newRng] = sRng.withState((rng): Omit<Merge2State, 'rng'> => {
    if (action.type === 'merge') {
      const { rules = {} } = action;
      const endGameChecker = (cb: Board, ce: EventList): [Board, EventList] =>
        applyEndOfGameCheck({ board: cb, events: ce, rules, rng });

      const steps: Array<
        (currentBoard: Board, currentEvents: EventList) => [Board, EventList]
      > = [
        (cb, ce) => applyMerge(action, { board: cb, events: ce, rng, rules }),
        endGameChecker,
        (cb, ce) => applySpawn({ board: cb, events: ce, rng, rules }),
        endGameChecker,
      ];

      const [newBoard, newEvents] = steps.reduce(
        (current, step) => {
          const [cb, ce] = current;
          if (endGameHappened({ events: ce })) return current;
          const updates = step(cb, ce);
          return updates[1].length > ce.length ? updates : current;
        },
        [board, events],
      );

      return {
        board: newBoard,
        events: newEvents,
      };
    }

    return { board, events };
  });

  if (newState.board === board && newState.events === events) {
    return prevState;
  }

  return {
    ...newState,
    rng: newRng,
  };
};

const createInitialState = ({
  initSettings: {
    rows,
    cols,
    kinds: kindsInput,
    modifiers: modifiersInput,
    seed,
  },
  rules = {},
}: InitContext): Merge2State => {
  const initialRng = createRng({ seed });

  const [state, nextRng] = initialRng.withState(
    (rng): Omit<Merge2State, 'rng'> => {
      const emptyGrid = nArray(rows, (row): EmptyCell[] =>
        nArray(cols, (col) => ({
          id: genCellId(rng),
          pos: [row, col],
          tile: null,
        })),
      );

      const kinds: TileKindMap = new Map(
        kindsInput.map((k) => {
          const id = castKindId(k.id);
          return [id, { ...k, id }];
        }),
      );

      const modifiers = new Map(
        modifiersInput?.map((m) => {
          const id = castModifierId(m.id);
          return [id, { id }];
        }) ?? [],
      );

      const emptyBoard: Board = {
        cols,
        rows,

        moves: 0,

        cells: new Map(emptyGrid.flat().map((cell) => [cell.id, cell])),
        grid: emptyGrid,
        kinds,
        modifiers,
        tileToCell: new Map(),
        tiles: new Map(),
      };

      const initEvent: BoardEvent = {
        type: 'board',

        reason: 'init',

        addedCells: new Set(emptyGrid.flat()),
        removedCells: new Set(),
        updatedCells: new Map(),

        addedTiles: new Set(),
        movedTiles: new Map(),
        removedTiles: new Set(),
      };

      const afterSpawn = applySpawn({
        rng: rng,
        board: emptyBoard,
        rules,
        events: [initEvent],
      });

      return {
        board: afterSpawn[0],
        events: afterSpawn[1],
      };
    },
  );

  return {
    ...state,
    rng: nextRng,
  };
};

const applySpawn = (ctx: RNGContext): [Board, EventList] => {
  const { board, rules, events } = ctx;
  const newCells =
    isFunction(rules.spawn) ?
      rules.spawn(ctx)
    : defaultSpawnRule(ctx, rules.spawn);

  if (newCells.length === 0) return [board, events];

  const newBoard = updateBoardCells(board, newCells);

  const diff = boardsDiff(board, newBoard);

  return [newBoard, [...events, { ...diff, type: 'board', reason: 'spawn' }]];
};

const applyMerge = (
  input: Readonly<MergeRuleInput>,
  ctx: Readonly<RNGContext>,
): [Board, EventList] => {
  const { tile, target, targetCell } = input;
  const { board, rules, events } = ctx;
  const tileCell = board.tileToCell.get(tile)!;

  if (
    !same(tile, target) &&
    sameKind(tile, target) &&
    sameRank(tile, target) &&
    tile.rank < tile.kind.maxRank &&
    fif(rules.merge, isFunction, (merge) => merge(input, ctx), true)
  ) {
    const newTile = createTile(ctx, {
      kind: tile.kind.id,
      rank: tile.rank + 1,
      modifiers: [],
    });
    const newBoard = updateBoardCells(board, [
      updateCell(targetCell, newTile),
      updateCell(tileCell, null),
    ]);

    return [
      newBoard,
      [
        ...events,
        { ...boardsDiff(board, newBoard), type: 'board', reason: 'merge' },
      ],
    ];
  }

  return [board, events];
};

const applyEndOfGameCheck = (ctx: RNGContext): [Board, EventList] => {
  const { board, rules, events } = ctx;
  if (fif(rules.win, isFunction, (win) => win(ctx), false)) {
    return [board, [...events, { type: 'end', reason: 'victory' }]];
  }

  return [board, events];
};
