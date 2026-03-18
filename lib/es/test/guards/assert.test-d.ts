/* eslint-disable @typescript-eslint/no-invalid-void-type,@typescript-eslint/consistent-type-assertions */
import type { NonNil } from '@budsbox/lib-types';

import { describe, expectTypeOf, test } from 'vitest';

import {
  assertArray,
  assertBoolean,
  assertFunction,
  assertNotNil,
  assertNumber,
  assertObject,
  assertPropKey,
  assertString,
  assertSymbol,
  invariant,
  invariantPredicate,
  normalizeOptionalRest,
} from '#guards/assert';
import { isBoolean, isNumber, isString } from '#guards/check';

describe('invariant', () => {
  test('narrows condition to true', () => {
    const value: boolean = Math.random() > 0.5;
    invariant(value);
    expectTypeOf(value).toEqualTypeOf<true>();
  });

  test('returns void', () => {
    expectTypeOf(invariant).returns.toEqualTypeOf<void>();
  });
});

describe('invariantPredicate', () => {
  test('with type guard narrows unknown to specific type', () => {
    const value: unknown = 'test';
    invariantPredicate(isString, value);
    expectTypeOf(value).toEqualTypeOf<string>();
  });

  test('with type guard narrows union type', () => {
    const value = 'test' as number | string;
    invariantPredicate(isString, value);
    expectTypeOf(value).toEqualTypeOf<string>();
  });

  test('with predicate does not narrow type', () => {
    const isPositive = (value: number): boolean => value > 0;
    const value: number = 5;
    invariantPredicate(isPositive, value);
    expectTypeOf(value).toEqualTypeOf<number>();
  });

  test('accepts optional value name', () => {
    expectTypeOf(invariantPredicate)
      .parameter(2)
      .toEqualTypeOf<string | undefined>();
  });

  test('with narrow type that extends guard input', () => {
    const isPositive = (value: number): value is number => value > 0;
    const value = 5 as const;
    invariantPredicate(isPositive, value);
    expectTypeOf(value).toEqualTypeOf<5>();
  });

  test('returns void', () => {
    expectTypeOf(invariantPredicate).returns.toEqualTypeOf<void>();
  });
});

describe('normalizeOptionalRest', () => {
  const predicates = [isString, isNumber, isBoolean] as const;

  expectTypeOf(normalizeOptionalRest(predicates, ['foo', 1])).toEqualTypeOf<
    [string | undefined, number | undefined, boolean | undefined]
  >();
});

describe('assertNotNil', () => {
  test('narrows unknown to NonNil', () => {
    const value: unknown = 'test';
    assertNotNil(value);
    expectTypeOf(value).toEqualTypeOf<NonNil>();
  });

  test('narrows nullable type', () => {
    const value = 'test' as string | null | undefined;
    assertNotNil(value);
    expectTypeOf(value).toEqualTypeOf<string>();
  });

  test('narrows union with null', () => {
    const value = 'test' as number | string | null;
    assertNotNil(value);
    expectTypeOf(value).toEqualTypeOf<number | string>();
  });

  test('accepts optional name parameter', () => {
    expectTypeOf(assertNotNil).parameter(1).toEqualTypeOf<string | undefined>();
  });

  test('returns void', () => {
    expectTypeOf(assertNotNil).returns.toEqualTypeOf<void>();
  });
});

describe('assertString', () => {
  test('narrows unknown to string', () => {
    const value: unknown = 'test';
    assertString(value);
    expectTypeOf(value).toEqualTypeOf<string>();
  });

  test('narrows union type to string', () => {
    const value = 'test' as number | string;
    assertString(value);
    expectTypeOf(value).toEqualTypeOf<string>();
  });

  test('accepts optional name parameter', () => {
    expectTypeOf(assertString).parameter(1).toEqualTypeOf<string | undefined>();
  });

  test('returns void', () => {
    expectTypeOf(assertString).returns.toEqualTypeOf<void>();
  });
});

describe('assertNumber', () => {
  test('narrows unknown to number', () => {
    const value: unknown = 123;
    assertNumber(value);
    expectTypeOf(value).toEqualTypeOf<number>();
  });

  test('narrows union type to number', () => {
    const value = 123 as boolean | number | string;
    assertNumber(value);
    expectTypeOf(value).toEqualTypeOf<number>();
  });

  test('accepts optional name parameter', () => {
    expectTypeOf(assertNumber).parameter(1).toEqualTypeOf<string | undefined>();
  });

  test('returns void', () => {
    expectTypeOf(assertNumber).returns.toEqualTypeOf<void>();
  });
});

describe('assertSymbol', () => {
  test('narrows unknown to symbol', () => {
    const value: unknown = Symbol();
    assertSymbol(value);
    expectTypeOf(value).toEqualTypeOf<symbol>();
  });

  test('narrows union type to symbol', () => {
    const value = Symbol() as string | symbol;
    assertSymbol(value);
    expectTypeOf(value).toEqualTypeOf<symbol>();
  });

  test('accepts optional name parameter', () => {
    expectTypeOf(assertSymbol).parameter(1).toEqualTypeOf<string | undefined>();
  });

  test('returns void', () => {
    expectTypeOf(assertSymbol).returns.toEqualTypeOf<void>();
  });
});

describe('assertPropKey', () => {
  test('narrows unknown to PropertyKey', () => {
    const value: unknown = 'key';
    assertPropKey(value);
    expectTypeOf(value).toEqualTypeOf<PropertyKey>();
  });

  test('narrows union type to PropertyKey', () => {
    const value = 'key' as boolean | string;
    assertPropKey(value);
    expectTypeOf(value).toEqualTypeOf<string>();
  });

  test('accepts string, number, and symbol', () => {
    const str: string = 'key';
    const num: number = 123;
    const sym: symbol = Symbol();
    assertPropKey(str);
    assertPropKey(num);
    assertPropKey(sym);
    expectTypeOf(str).toEqualTypeOf<string>();
    expectTypeOf(num).toEqualTypeOf<number>();
    expectTypeOf(sym).toEqualTypeOf<symbol>();
  });

  test('accepts optional name parameter', () => {
    expectTypeOf(assertPropKey)
      .parameter(1)
      .toEqualTypeOf<string | undefined>();
  });

  test('returns void', () => {
    expectTypeOf(assertPropKey).returns.toEqualTypeOf<void>();
  });
});

describe('assertBoolean', () => {
  test('narrows unknown to boolean', () => {
    const value: unknown = true;
    assertBoolean(value);
    expectTypeOf(value).toEqualTypeOf<boolean>();
  });

  test('narrows union type to boolean', () => {
    const value = true as boolean | string;
    assertBoolean(value);
    expectTypeOf(value).toEqualTypeOf<boolean>();
  });

  test('accepts optional name parameter', () => {
    expectTypeOf(assertBoolean)
      .parameter(1)
      .toEqualTypeOf<string | undefined>();
  });

  test('returns void', () => {
    expectTypeOf(assertBoolean).returns.toEqualTypeOf<void>();
  });
});

describe('assertObject', () => {
  test('narrows unknown to object', () => {
    const value: unknown = {};
    assertObject(value);
    expectTypeOf(value).toEqualTypeOf<object>();
  });

  test('narrows union type to object', () => {
    const value = {} as object | string;
    assertObject(value);
    expectTypeOf(value).toEqualTypeOf<object>();
  });

  test('accepts optional name parameter', () => {
    expectTypeOf(assertObject).parameter(1).toEqualTypeOf<string | undefined>();
  });

  test('returns void', () => {
    expectTypeOf(assertObject).returns.toEqualTypeOf<void>();
  });
});

describe('assertArray', () => {
  test('narrows unknown to unknown[]', () => {
    const value: unknown = [];
    assertArray(value);
    expectTypeOf(value).toEqualTypeOf<unknown[]>();
  });

  test('narrows union type to array', () => {
    const value = [1, 2] as string | number[];
    assertArray(value);
    expectTypeOf(value).toEqualTypeOf<number[]>();
  });

  test('with type guard narrows to typed array', () => {
    const value: unknown = ['a', 'b'];
    assertArray(value, isString);
    expectTypeOf(value).toEqualTypeOf<string[]>();
  });

  test('with type guard narrows union of arrays', () => {
    const value = ['a', 'b'] as number[] | string[];
    assertArray(value, isString);
    expectTypeOf(value).toEqualTypeOf<string[]>();
  });

  test('with predicate maintains array type', () => {
    const isPositive = (value: number): boolean => value > 0;
    const value: number[] = [1, 2, 3];
    assertArray(value, isPositive);
    expectTypeOf(value).toEqualTypeOf<number[]>();
  });

  test('type guard gets inferred item type', () => {
    const value = ['a', 'b'] as const;
    assertArray(value, (item) => {
      expectTypeOf(item).toEqualTypeOf<'a' | 'b'>();
      return typeof item === 'string';
    });
  });

  test('predicate gets inferred item type', () => {
    const value = ['a', 'b'] as const;
    assertArray(value, (item) => {
      expectTypeOf(item).toEqualTypeOf<'a' | 'b'>();
      return true;
    });
  });

  test('accepts readonly arrays', () => {
    const value = ['a', 'b'] as const;
    assertArray(value);
    expectTypeOf(value).toEqualTypeOf<readonly ['a', 'b']>();
  });

  test('with type guard on readonly array', () => {
    const value = ['a', 'b'] as const;
    assertArray(value, isString);
    expectTypeOf(value).toEqualTypeOf<readonly ['a', 'b']>();
  });

  test('with narrow element type', () => {
    const isLiteral = (value: unknown): value is 'a' | 'b' =>
      value === 'a' || value === 'b';
    const value: unknown = ['a', 'b'];
    assertArray(value, isLiteral);
    expectTypeOf(value).toEqualTypeOf<Array<'a' | 'b'>>();
  });

  test('preserves tuple types when possible', () => {
    const value = ['a', 1] as string | [string, number];
    assertArray(value);
    expectTypeOf(value).toEqualTypeOf<[string, number]>();
  });

  test('returns void', () => {
    expectTypeOf(assertArray).returns.toEqualTypeOf<void>();
  });
});

describe('assertFunction', () => {
  test('narrows unknown to function', () => {
    const value: unknown = () => {};
    assertFunction(value);
    expectTypeOf(value).toEqualTypeOf<(...args: unknown[]) => unknown>();
  });

  test('narrows union type to function', () => {
    const value = (() => {}) as string | (() => void);
    assertFunction(value);
    expectTypeOf(value).toEqualTypeOf<() => void>();
  });

  test('with generic type parameter', () => {
    const value: unknown = (x: number) => x * 2;
    assertFunction<(x: number) => number>(value);
    expectTypeOf(value).toEqualTypeOf<(x: number) => number>();
  });

  test('narrows union with multiple function types', () => {
    type Fn1 = () => void;
    type Fn2 = (x: number) => number;
    const value = ((x: number) => x * 2) as string | Fn1 | Fn2;
    assertFunction(value);
    expectTypeOf(value).toEqualTypeOf<Fn1 | Fn2>();
  });

  test('accepts various function types', () => {
    const fn1: () => void = () => {};
    const fn2: (x: number) => string = (x) => String(x);
    const fn3: (...args: unknown[]) => unknown = () => {};
    assertFunction(fn1);
    assertFunction(fn2);
    assertFunction(fn3);
    expectTypeOf(fn1).toEqualTypeOf<() => void>();
    expectTypeOf(fn2).toEqualTypeOf<(x: number) => string>();
    expectTypeOf(fn3).toEqualTypeOf<(...args: unknown[]) => unknown>();
  });

  test('accepts optional name parameter', () => {
    expectTypeOf(assertFunction)
      .parameter(1)
      .toEqualTypeOf<string | undefined>();
  });

  test('returns void', () => {
    expectTypeOf(assertFunction).returns.toEqualTypeOf<void>();
  });
});
