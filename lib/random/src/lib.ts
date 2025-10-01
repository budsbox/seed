import type { TupleN } from '@budsbox/lib-types';

import type { PRNGFn } from './types.js';

import { nArray } from '@budsbox/lib-es/array';

/**
 * Generates a hash value for the given string using the FNV-1a hashing algorithm.
 *
 * @param seed - The input string to hash.
 * @returns The 32-bit unsigned integer hash of the input string.
 */
export function fnv1aHash(seed: string): number {
  let h = 2166136261 >>> 0;
  for (let i = 0; i < seed.length; i += 1) {
    h ^= seed.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

/**
 * Represents a pseudo-random number generator (PRNG) using the Mulberry32 algorithm.
 *
 * The Mulberry32 algorithm is a simple and fast PRNG that produces deterministic results
 * based on an initial seed. It generates numbers in the range [0, 1) with a cycle length
 * suited for non-cryptographic purposes, such as simulations, procedural generation, or
 * general randomness needs.
 *
 * @param seed - The initial seed value for the generator. Must be a non-negative integer.
 * @returns A function that, when called, generates the next pseudorandom number in the sequence.
 */
export const mulberry32: PRNGFn = (seed) => {
  const initialState = seed >>> 0;
  const next = (state: number = initialState): [number, number] => {
    const t = state + 0x6d2b79f5;
    let x = Math.imul(t ^ (t >>> 15), 1 | t);
    x ^= x + Math.imul(x ^ (x >>> 7), 61 | x);
    return [((x ^ (x >>> 14)) >>> 0) / 2 ** 32, t];
  };

  return next;
};

/**
 * A simple and fast pseudorandom number generator (PRNG) implementation based on the sfc32 algorithm.
 *
 * This generator produces floating-point random numbers in the range of [0, 1)
 * and is initialized with a seed value to create a deterministic sequence of random numbers.
 *
 * Internally, it utilizes four 32-bit state variables (`a`, `b`, `c`, `d`), which are seeded
 * using another PRNG, `mulberry32`, initialized with the provided seed. The generator function
 * updates these states and computes the next random value each time it is called.
 *
 * @param seed - A numeric seed used to initialize the PRNG. The same seed will produce the same sequence of random numbers.
 * @returns A function that, when called, generates the next pseudorandom number in the sequence.
 */
export const sfc32: PRNGFn = (seed) => {
  const seeder = mulberry32(seed);

  type State = TupleN<4, number>;

  const [initialState] = nArray(4).reduce<[readonly number[], unknown]>(
    ([acc, state]) => {
      const [v, newState] = seeder(state);

      return [[...acc, (v * 2 ** 32) | 0], newState];
    },
    [[]],
  ) as [State, unknown];

  const next = (state: TupleN<4, number> = initialState): [number, State] => {
    let [a, b, c, d] = state;

    const t = (((a + b) | 0) + d) | 0;
    d = (d + 1) | 0;
    a = b ^ (b >>> 9);
    b = (c + (c << 3)) | 0;
    c = (c << 21) | (c >>> 11);
    c = (c + t) | 0;
    return [(t >>> 0) / 2 ** 32, [a, b, c, d]];
  };

  return next;
};

/**
 * Generates a random seed value as a number.
 *
 * This function utilizes the `crypto.getRandomValues` method to generate
 * a cryptographically secure random value. It uses a `Uint32Array` of length 1
 * to obtain a single random 32-bit integer and returns it.
 *
 * @returns A cryptographically secure random 32-bit integer.
 */
export const genSeed = (): number =>
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  globalThis.crypto.getRandomValues(new Uint32Array(1))[0]!;
