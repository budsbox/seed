/**
 * This module provides extended definitions for the ECMAScript standard library.
 * @remarks This is very opinionated and not recommended for general use.
 * @module
 * @internal
 */

/* eslint-disable @typescript-eslint/method-signature-style */

/* ------ Extends ES interfaces ------ */

interface ObjectConstructor {
  hasOwn(source: null | undefined, key: PropertyKey): never;
  hasOwn: <K extends PropertyKey>(
    source: object,
    key: K,
  ) => source is Record<K, unknown>;
  hasOwn: <T>(source: T, key: PropertyKey) => key is keyof T;
  hasOwn: (source: NonNullable<unknown>, key: unknown) => boolean;

  keys<T extends Record<string, unknown>>(
    obj: T,
  ): T extends Record<infer K, unknown> ? K[] : never;
  keys<T extends object>(obj: T): Array<keyof T>;
}

interface ArrayConstructor {
  /** @see https://github.com/microsoft/TypeScript/issues/17002 */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  isArray(arg: any): arg is readonly any[];
}

interface Array<T> {
  reduce<U>(
    callback: (
      previousValue: U,
      currentValue: T,
      currentIndex: number,
      array: readonly T[],
    ) => U,
    initialValue: U extends object ? Partial<U> : U, // that's why
  ): U;
}

interface ReadonlyArray<T> {
  reduce<U>(
    callback: (
      previousValue: U,
      currentValue: T,
      currentIndex: number,
      array: readonly T[],
    ) => U,
    initialValue: U extends object ? Partial<U> : U, // that's why
  ): U;
}

interface Crypto {
  /**
   * Get cryptographically strong random values.
   * @param array - The array to fill with random values.
   * @returns The filled array.
   * @see {@link !Crypto.getRandomValues Crypto.getRandomValues} (MDN)
   * @remarks This method is the only one from Crypto API that can be used in non-secure contexts.
   */
  getRandomValues<T extends ArrayBufferView | null>(array: T): T;
}

declare var crypto: Crypto;

declare global {
  var crypto: Crypto;
}
