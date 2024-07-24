/* eslint-disable @typescript-eslint/method-signature-style */

/* ------ Extends ES interfaces ------ */

interface ObjectConstructor {
  hasOwn: <T extends object>(object: T, key: keyof any) => key is keyof T;
  hasOwn: <K extends string>(
    record: Readonly<Record<K, unknown>>,
    key: unknown,
  ) => key is K;

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
