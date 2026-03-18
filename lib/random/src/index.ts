import type {
  IntArray,
  RNG,
  RNGGenericMethods,
  RNGNextFnStateless,
  RNGOptions,
  RNGStatefulMethods,
  SeedSource,
} from '#types';

import { customRandom, urlAlphabet } from 'nanoid';

import { isString } from '@budsbox/lib-es/guards';
import { fif, sure } from '@budsbox/lib-es/logical';

import { fnv1aHash, genSeed, mulberry32, sfc32 } from '#lib';

// Type exports
export type {
  PRNGFn,
  RNG,
  RNGNextFnStateless,
  RNGOptions,
  RNGStatefulMethods,
  SeedSource,
} from '#types';

export { fnv1aHash, mulberry32, sfc32 };

// eslint-disable-next-line jsdoc/require-jsdoc
export function createRng(options?: RNGOptions<undefined>): RNG<undefined>;

/**
 * Creates a random number generator (RNG) instance based on the specified options.
 *
 * @param options - Configuration options for initializing the RNG,
 * including the seed source, ID length, and PRNG function to use.
 * @returns An RNG instance configured according to the provided options.
 * @typeParam TSeedSource - The type of seed source used for generating random numbers.
 */
export function createRng<TSeedSource extends SeedSource = SeedSource>(
  options: RNGOptions<TSeedSource>,
): RNG<TSeedSource>;
export function createRng(options?: RNGOptions): RNG;
export function createRng({
  seed: seedSource,
  idLength = 10,
  prngFn = sfc32,
}: RNGOptions = {}): RNG {
  const seed = sure(
    seedSource,
    (s) => fif(s, isString, fnv1aHash, (n) => n),
    genSeed,
  );

  const nextStateless = prngFn(seed);

  return nextRng(nextStateless, undefined, { seed, seedSource, idLength });
}

type RNGSettings = Readonly<{
  seed: number;
  seedSource: SeedSource;
  idLength: number;
}>;

const nextRng = (
  nextStateless: RNGNextFnStateless,
  state: unknown,
  settings: RNGSettings,
): RNG => {
  let interState: unknown = state;
  const next = (): number => {
    const [result, newState] = nextStateless(interState);
    interState = newState;
    return result;
  };
  const nextBool = (probability: number = 0.5): boolean => next() < probability;

  const nextInt = (max: number = Number.MAX_SAFE_INTEGER, min = 0): number =>
    Math.floor(next() * (max - min)) + min;

  const nextUInt32 = (max = 2 ** 32): number =>
    nextInt(Math.min(2 ** 32, max)) | 0;

  const nextInRange = (...range: readonly unknown[]): unknown =>
    range.length > 1 ? range[nextInt(range.length)] : range[0];

  const nextItem = (array: readonly unknown[]): unknown =>
    nextInRange(...Object.values(array));

  const nextIntArray = (array: IntArray): IntArray => {
    const { BYTES_PER_ELEMENT } = array;
    const max = 2 ** (8 * BYTES_PER_ELEMENT);
    for (let i = 0; i < array.length; i += 1) {
      array[i] = nextInt(max);
    }

    return array;
  };

  const nextUint8Array = (length: number): Uint8Array =>
    nextIntArray(new Uint8Array(length)) as Uint8Array;

  const nextId = (length = settings.idLength): string =>
    customRandom(urlAlphabet, length, nextUint8Array)();

  const shuffle = (array: readonly unknown[]): unknown[] =>
    array.toSorted(() => next() - 0.5);

  const methods: RNGStatefulMethods = {
    next,
    nextBool,
    nextId,
    nextInRange: nextInRange as RNGStatefulMethods['nextInRange'],
    nextInt,
    nextIntArray: nextIntArray as RNGStatefulMethods['nextIntArray'],
    nextItem: nextItem as RNGStatefulMethods['nextItem'],
    nextUInt32,
    nextUint8Array,
    shuffle: shuffle as RNGStatefulMethods['shuffle'],
  };

  const withState = (
    fn: (statefulRng: typeof methods) => unknown,
  ): [unknown, RNG] => {
    const result = fn(methods);
    return [result, nextRng(nextStateless, interState, settings)];
  };

  const statelessMethods = Object.entries(methods).reduce<RNGGenericMethods>(
    (
      acc,
      [name, fn]: readonly [string, (...args: readonly never[]) => unknown],
    ) => ({
      ...acc,
      [name]: (...args: readonly never[]) => {
        const result = fn(...args);
        return [result, nextRng(nextStateless, interState, settings)];
      },
    }),
    {},
  );

  // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
  return {
    seed: settings.seed,
    seedSource: settings.seedSource,
    ...statelessMethods,
    withState,
  } as RNG;
};
