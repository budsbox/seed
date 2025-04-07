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
    initialValue: Partial<U>, // that's why
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
    initialValue: Partial<U>, // that's why
  ): U;
}
