import { describe, expectTypeOf, test } from 'vitest';

import { assertIterable, isIterable } from '#guards';

describe('isIterable type tests', () => {
  test('narrows unknown to Iterable<unknown>', () => {
    const value = 'test' as unknown;
    if (isIterable(value)) {
      expectTypeOf(value).toEqualTypeOf<Iterable<unknown>>();
    }
  });

  test('narrows union type to iterable types', () => {
    const value = 'test' as number | string;
    if (isIterable(value)) {
      expectTypeOf(value).toEqualTypeOf<string>();
    } else {
      expectTypeOf(value).toEqualTypeOf<number>();
    }
  });

  test('narrows from nullable type', () => {
    const value = [] as string[] | null | undefined;
    if (isIterable(value)) {
      expectTypeOf(value).toEqualTypeOf<string[]>();
    } else {
      expectTypeOf(value).toEqualTypeOf<null | undefined>();
    }
  });

  test('preserves iterable type for arrays', () => {
    const arr: unknown[] = [];
    const tuple = [1, 2, 3] as const;
    if (isIterable(arr)) {
      expectTypeOf(arr).toEqualTypeOf<unknown[]>();
    }
    if (isIterable(tuple)) {
      expectTypeOf(tuple).toEqualTypeOf<readonly [1, 2, 3]>();
    }
  });

  test('function returns boolean', () => {
    expectTypeOf(isIterable).returns.toBeBoolean();
  });

  test('function parameter accepts unknown', () => {
    expectTypeOf(isIterable).parameter(0).toBeUnknown();
  });
});

describe('assertIterable type tests', () => {
  test('narrows unknown to Iterable<unknown>', () => {
    const value = [] as unknown;
    assertIterable(value);
    expectTypeOf(value).toEqualTypeOf<Iterable<unknown>>();
  });

  test('narrows union type to iterable types', () => {
    const value = 'test' as number | string;
    assertIterable(value);
    expectTypeOf(value).toEqualTypeOf<string>();
  });

  test('narrows from nullable type', () => {
    const value = [] as string[] | null | undefined;
    assertIterable(value);
    expectTypeOf(value).toEqualTypeOf<string[]>();
  });

  test('preserves iterable type for arrays', () => {
    const arr: unknown[] = [];
    const tuple = [1, 2, 3] as const;
    assertIterable(arr);
    expectTypeOf(arr).toEqualTypeOf<unknown[]>();
    assertIterable(tuple);
    expectTypeOf(tuple).toEqualTypeOf<readonly [1, 2, 3]>();
  });

  test('function parameter accepts unknown', () => {
    expectTypeOf(assertIterable).parameter(0).toEqualTypeOf<unknown>();
  });

  test('function second parameter is optional string', () => {
    expectTypeOf(assertIterable)
      .parameter(1)
      .toEqualTypeOf<string | undefined>();
  });

  test('does not return a value (asserts function)', () => {
    expectTypeOf(assertIterable).returns.toBeVoid();
  });
});
