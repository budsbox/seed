/**
 * @module
 *
 * This module contains the state management logic for the Merge-2 game, including the reducer and initial state creation.
 */

import type {
  Board,
  BoardEvent,
  EmptyCell,
  InterState,
  Merge2Action,
  Merge2State,
  MergeRuleInput,
  StateInitContext,
  StateTransformer,
  StateTransformerContext,
  Tile,
  TileKindMap,
} from '#types';

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
  genCellId,
  same,
  sameKind,
  sameRank,
  updateBoardCells,
  updateCell,
} from '#lib';

import { defaultSpawnRule } from './rules';

/**
 * Hook that manages the Merge-2 game state using a reducer.
 *
 * @param initContext - Context for initializing the state.
 * @returns A tuple containing the current state and a dispatch function that returns the updated state.
 */
export const useMerge2State = (
  initContext: StateInitContext,
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

  const [newState, newRng] = sRng.withState((rng): InterState => {
    const transformerCtx: StateTransformerContext = {
      rng,
      rules: action.rules ?? {},
    };

    if (action.type === 'merge') {
      const steps: StateTransformer[] = [
        (...args) => applyMerge(...args, action),
        applyDrop,
        applyEndOfGameCheck,
        applySpawn,
        applyEndOfGameCheck,
      ];

      const interState = steps.reduce<InterState>((current, step) => {
        if (current.gameOver) return current;
        const newInterState = step(current, transformerCtx);
        return newInterState.events.length > current.events.length ?
            newInterState
          : current;
      }, prevState);

      return interState;
    } else if (action.type === 'pick') {
      const { tile } = action;
      return applyPick(prevState, transformerCtx, tile);
      // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    } else if (action.type === 'drop') {
      return applyDrop(prevState, transformerCtx);
    }

    return prevState;
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
  rules,
}: StateInitContext): Merge2State => {
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

      const stateAfterSpawn = applySpawn(
        {
          board: emptyBoard,
          events: [initEvent],
          gameOver: false,
          gameOverReason: null,
          pickedTile: null,
        },
        {
          rng: rng,
          rules,
        },
      );

      return stateAfterSpawn;
    },
  );

  return {
    ...state,
    rng: nextRng,
  };
};

const applySpawn: StateTransformer = (interState, ctx) => {
  const { board, events } = interState;
  const { rules } = ctx;
  const fullContext = { ...ctx, board, events };

  const newCells =
    isFunction(rules.spawn) ?
      rules.spawn(fullContext)
    : defaultSpawnRule(fullContext, rules.spawn);

  if (newCells.length === 0) return interState;

  const newBoard = updateBoardCells(board, newCells);

  const diff = boardsDiff(board, newBoard);

  return {
    ...interState,
    board: newBoard,
    events: [...events, { ...diff, type: 'board', reason: 'spawn' }],
  };
};

const applyMerge: StateTransformer<[input: MergeRuleInput]> = (
  interState,
  ctx,
  input,
) => {
  const { tile, target, targetCell } = input;
  const { board, events } = interState;
  const { rules } = ctx;
  const tileCell = board.tileToCell.get(tile)!;

  if (
    !same(tile, target) &&
    sameKind(tile, target) &&
    sameRank(tile, target) &&
    tile.rank < tile.kind.maxRank &&
    fif(
      rules.merge,
      isFunction,
      (merge) => merge(input, { ...ctx, board, events }),
      true,
    )
  ) {
    const newTile = createTile(
      { ...ctx, board, events },
      {
        kind: tile.kind.id,
        rank: tile.rank + 1,
        modifiers: [],
      },
    );
    const newBoard = updateBoardCells(board, [
      updateCell(targetCell, newTile),
      updateCell(tileCell, null),
    ]);

    return {
      ...interState,
      board: newBoard,
      events: [
        ...events,
        { ...boardsDiff(board, newBoard), type: 'board', reason: 'merge' },
      ],
    };
  }

  return interState;
};

const applyPick: StateTransformer<[tile: Tile]> = (interState, _ctx, tile) => ({
  ...interState,
  pickedTile: tile,
  events: [...interState.events, { type: 'pick', tile, reason: 'pick' }],
});

const applyDrop: StateTransformer = (interState, _ctx) => ({
  ...interState,
  pickedTile: null,
  events: [...interState.events, { type: 'pick', tile: null, reason: 'drop' }],
});

const applyEndOfGameCheck: StateTransformer = (interState, ctx) => {
  const { board, events } = interState;
  const { rules } = ctx;
  if (
    fif(rules.win, isFunction, (win) => win({ ...ctx, board, events }), false)
  ) {
    const reason = 'victory';
    return {
      ...interState,
      events: [...events, { type: 'end', reason }],
      gameOver: true,
      gameOverReason: reason,
    };
  }

  return interState;
};
