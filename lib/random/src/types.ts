import type { Undef } from '@budsbox/lib-types';

/**
 * Represents the configuration options for a Random Number Generator (RNG).
 *
 * @typeParam TSeedSource - Specifies the type of seed source for the RNG, which can be a number, string, or undefined.
 */
export interface RNGOptions<TSeedSource extends SeedSource = SeedSource> {
  /**
   * An optional seed source for the RNG, which can be a number, string, or undefined (then a random seed is generated).
   */
  readonly seed?: TSeedSource;

  /**
   * Specifies the length for an identifier, should be a positive number if defined
   */
  readonly idLength?: number;

  /**
   * A custom pseudorandom number generator function.
   *
   * @remarks
   * This function takes a numeric seed as input and returns a function conforming to the `RngNextFnStateless` type.
   * It is used as a mechanism to generate deterministic random number sequences based on the provided seed.
   * @param seed - A numeric seed that initializes the pseudorandom number generator.
   * @returns A function of type `RngNextFnStateless` that generates random numbers when invoked.
   */
  readonly prngFn?: PRNGFn;
}

/**
 * Interface defining a set of stateful random number generation methods.
 */
export interface RNGStatefulMethods {
  /**
   * Get the next random number in the range `[0, 1)`.
   */
  readonly next: () => number;

  /**
   * Get the next boolean value.
   *
   * @param probability - Optional probability of returning true. Defaults to `0.5`.
   */
  readonly nextBool: (probability?: Undef<number>) => boolean;

  /**
   * Fill an integer typed array with random values.
   *
   * @remarks Use with caution, as this method mutates the input array.
   * @param array - The input integer array to be filled.
   * @returns The same array instance filled with new values.
   */
  readonly nextIntArray: <TArray extends IntArray>(array: TArray) => TArray;

  /**
   * Generate a Uint8Array of the specified length filled with random values.
   *
   * @param length - The desired length of the Uint8Array.
   * @returns A new Uint8Array filled with random values.
   */
  readonly nextUint8Array: (length: number) => Uint8Array;

  /**
   * Generate a unique URL-safe identifier.
   *
   * @param length - Optional desired length of the identifier. Defaults to 10.
   */
  readonly nextId: (length?: number) => string;

  /**
   * Get a random item from a provided range.
   *
   * @param range - Variadic tuple of items to select from.
   * @returns A random item (or undefined if range is empty).
   */
  readonly nextInRange: <TRange extends readonly unknown[]>(
    ...range: TRange
  ) => TypeFromRange<TRange>;

  /**
   * Get a random item from an array. Empty values are ignored.
   *
   * @param items - array of items to select from.
   * @returns A random item (or undefined if `items` are empty).
   */
  readonly nextItem: <T>(...items: readonly T[]) => T;

  /**
   * Shuffle an array without mutating the input.
   *
   * @param array - The input array to shuffle.
   * @returns A new shuffled array.
   */
  readonly shuffle: <T>(array: readonly T[]) => T[];

  /**
   * Generate a random integer within a range.
   *
   * @param max - Upper bound (exclusive). Defaults to `Number.MAX_SAFE_INTEGER`.
   * @param min - Lower bound (inclusive). Defaults to `0`.
   * @returns The random integer.
   */
  readonly nextInt: (max: number, min?: number) => number;
  /**
   * Generate a random integer coerced to 32-bit unsigned integer.
   * `max` is clamped to `[0, 2 ** 32]`.
   *
   * @param max - Upper bound (exclusive). Defaults to `2 ** 32`.
   * @returns The random integer.
   */
  readonly nextUInt32: (max: number) => number;
}

/**
 * All the same methods as RNGStatefulMethods, but with the return type of the tuple,
 * where the first item is the result of the method and the second item is the updated RNG.
 */
export type RNGGenericMethods = {
  [K in keyof RNGStatefulMethods]: RNGStatefulMethods[K] extends (
    (...args: infer TArgs) => infer TResult
  ) ?
    (...args: TArgs) => [TResult, RNG]
  : never;
};

/**
 * Interface representing a random number generator (RNG) with methods
 * for generating random values and sequences.
 *
 * @typeParam TSeedSource - The type for the seed source, which can be a number, string, or undefined.
 */
export interface RNG<TSeedSource extends SeedSource = SeedSource> {
  /**
   * Represents the numeric seed value used for initializing a random number generator or any process requiring a fixed starting point.
   * This value is immutable and must be set at the time of creation.
   */
  readonly seed: number;

  /**
   * Represents the source of the seed used for generating values or performing operations.
   * It's undefined if the seed was not explicitly provided and is generated at runtime.
   */
  readonly seedSource: TSeedSource;

  /**
   * Get the next random number.
   *
   * @returns Tuple, where first item is the next random number, and the second item is the updated RNG.
   */
  readonly next: () => RNGResult<number, TSeedSource>;

  /**
   * Get the next boolean value.
   *
   * @param probability - Optional probability of returning true. Defaults to `0.5`.
   * @returns Tuple, where first item is the boolean value, and the second item is the updated RNG.
   */
  readonly nextBool: (
    probability?: Undef<number>,
  ) => RNGResult<boolean, TSeedSource>;

  /**
   * Fill an integer typed array with random values.
   *
   * @typeParam TArray - The type of the integer array to be processed.
   * @param array - The input integer array to be filled.
   * @returns Tuple, where first item is the same array instance filled with new values, and the second item is the updated RNG.
   */
  readonly nextIntArray: <TArray extends IntArray>(
    array: TArray,
  ) => RNGResult<TArray, TSeedSource>;

  /**
   * Generate a Uint8Array of the specified length.
   *
   * @param length - The desired length of the Uint8Array.
   */
  readonly nextUint8Array: (
    length: number,
  ) => RNGResult<Uint8Array, TSeedSource>;

  /**
   * Generate a unique URL-safe identifier.
   *
   * @param length - Optional desired length of the identifier.
   * @returns Tuple, where first item is the identifier string, and the second item is the updated RNG.
   */
  readonly nextId: (length?: number) => RNGResult<string, TSeedSource>;

  /**
   * Select an item from a provided range.
   *
   * @param range - Variadic tuple of items to select from.
   * @returns Tuple, where first item is the selected item (or undefined if range is empty), and the second item is the updated RNG.
   */
  readonly nextInRange: <TRange extends readonly unknown[]>(
    ...range: TRange
  ) => RNGResult<TypeFromRange<TRange>, TSeedSource>;

  /**
   * Shuffle an array without mutating the input.
   *
   * @param array - The input array to shuffle.
   * @returns Tuple, where first item is a new shuffled array, and the second item is the updated RNG.
   */
  readonly shuffle: <T>(array: readonly T[]) => RNGResult<T[], TSeedSource>;

  /**
   * Generate a random integer within a range.
   *
   * @param max - Upper bound (exclusive). Defaults to `Number.MAX_SAFE_INTEGER`.
   * @param min - Lower bound (inclusive). Defaults to `0`.
   * @returns Tuple, where first item is the random integer, and the second item is the updated RNG.
   */
  readonly nextInt: (
    max?: number,
    min?: number,
  ) => RNGResult<number, TSeedSource>;

  /**
   * Generate a random integer coerced to 32-bit unsigned integer.
   * Max is clamped to `[0, 2 ** 32]`.
   *
   * @param max - Upper bound (exclusive). Defaults to `2 ** 32`.
   */
  readonly nextUInt32: (max?: number) => RNGResult<number, TSeedSource>;

  /**
   * Execute a function with the stateful methods of the RNG.
   *
   * @param fn - The function to execute with the stateful methods.
   * @param args - Optional arguments to pass to the function.
   */
  readonly withState: <TArgs extends readonly unknown[], TResult>(
    fn: (rng: RNGStatefulMethods, ...args: TArgs) => TResult,
    ...args: TArgs
  ) => RNGResult<TResult, TSeedSource>;
}

/**
 * Represents a source for a seed, which could either be a number, string, or undefined.
 */
export type SeedSource = Undef<number | string>;

/**
 * Represents the result of a random number generation operation.
 *
 * The RNGResult is a tuple where the first element is the generated result
 * and the second element is the updated random number generator (RNG) state.
 *
 * @typeParam TResult - The type of the generated result.
 * @typeParam TSeedSource - The type of the seed source used by the RNG. Defaults to `SeedSource`.
 * @remarks
 * This type allows functions to return both the generated value and the updated RNG state,
 * which enables deterministic random number generation by threading the RNG state through successive calculations.
 */
export type RNGResult<TResult, TSeedSource extends SeedSource = SeedSource> = [
  result: TResult,
  nextRng: RNG<TSeedSource>,
];

/**
 * Represents a stateless function that generates a random number.
 *
 * @param state - The current state of the RNG.
 * @returns A tuple containing the next random number and the updated state.
 */
export type RNGNextFnStateless = (
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  state: any,
) => [result: number, state: unknown];

/**
 * Represents a stateless function that generates a random number.
 */
export type RNGNextFn = () => number;

/**
 * Represents a pseudorandom number generator (PRNG) function factory.
 *
 * The `Prng` type defines a function that generates a new random number generator
 * instance providing pseudorandom sequences based on a given seed value.
 *
 * @param seed - The initial seed value to initialize the pseudorandom number generator.
 *               The seed ensures reproducibility of the generated random number sequence.
 * @returns A stateless function of type `RngNextFnStateless` that generates random numbers when invoked.
 */
export type PRNGFn = (seed: number) => RNGNextFnStateless;

/**
 * A composite type that represents a union of typed arrays for integer values.
 */
export type IntArray =
  | Int8Array
  | Int16Array
  | Int32Array
  | Uint8Array
  | Uint8ClampedArray
  | Uint16Array
  | Uint32Array;

/**
 * A utility type that derives a new type from a tuple/array type based on its structure.
 *
 * If the given type is an empty tuple/array (`[]`), the resulting type will be `undefined`.
 *
 * If the given type is a tuple, the resulting type will be the union of its elements.
 *
 * If the given type is an array, the resulting type will be the type of its elements or `undefined`.
 *
 * If the given type does not conform to an array-like structure, the resulting type is `never`.
 *
 * @typeParam TRange - The source tuple/array type from which the resulting type will be derived.
 */
export type TypeFromRange<TRange extends readonly unknown[]> =
  TRange extends [] ? undefined
  : TRange extends Array<infer T> ?
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    any[] extends TRange ?
      T | undefined
    : T
  : never;
