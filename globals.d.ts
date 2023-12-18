/* ------ Extends ES interfaces ------ */

interface ObjectConstructor {
  hasOwn: <K extends string>(
    record: Readonly<Record<K, unknown>>,
    key: unknown,
  ) => key is K;

  keys<T extends Record<string, unknown>>(
    obj: T,
  ): T extends Record<infer K, unknown> ? K[] : never;
  keys<T extends object>(obj: T): Array<keyof T>;
}

interface Array<T> {
  reduce<U>(
    callback: (
      previousValue: U,
      currentValue: T,
      currentIndex: number,
      array: T[],
    ) => U,
    initialValue: Partial<U>, // that's why
  ): U;
}
