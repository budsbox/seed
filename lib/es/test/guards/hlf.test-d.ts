import { describe, expectTypeOf, test } from 'vitest';

import { isBoolean, isNumber, isString, isTruly } from '#guards/check';
import {
  assertAnyOf,
  assertEvery,
  assertIterable,
  assertOfType,
  assertSome,
  everyPredicate,
  isIterable,
  ofType,
  somePredicate,
} from '#guards/hlf';

describe('isIterable', () => {
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

describe('assertIterable', () => {
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

describe('ofType', () => {
  test('narrows unknown to the instance of class', () => {
    const value = new Date() as unknown;

    if (ofType(Date)(value)) {
      expectTypeOf(value).toEqualTypeOf<Date>();
    }
  });

  test('narrows union type to the instance of class', () => {
    const value = new Date() as string | Date;
    if (ofType(Date)(value)) {
      expectTypeOf(value).toEqualTypeOf<Date>();
    }
  });

  test('narrows union of subclass instance to this instance', () => {
    class SubDate extends Date {}
    const value = new SubDate() as string | SubDate;
    if (ofType(SubDate)(value)) {
      expectTypeOf(value).toEqualTypeOf<SubDate>();
    }
  });
});

describe('assertOfType', () => {
  test('narrows unknown to the instance of class', () => {
    const value = new Date() as unknown;
    assertOfType(Date, value);
    expectTypeOf(value).toEqualTypeOf<Date>();
  });

  test('narrows union type to the instance of class', () => {
    const value = new Date() as string | Date;
    assertOfType(Date, value);
    expectTypeOf(value).toEqualTypeOf<Date>();
  });

  test('narrows union of subclass instance to this instance', () => {
    class SubDate extends Date {}
    const value = new SubDate() as string | SubDate;
    assertOfType(SubDate, value);
    expectTypeOf(value).toEqualTypeOf<SubDate>();
  });
});

describe('somePredicate', () => {
  test('narrows unknown to union type', () => {
    const predicate = somePredicate(isString, isNumber, isBoolean);

    const value = 42 as unknown;
    if (predicate(value)) {
      expectTypeOf(value).toEqualTypeOf<boolean | number | string>();
    }
  });

  test('narrows unions correctly', () => {
    const predicate = somePredicate(isString, isNumber, isBoolean);
    const value = 42 as number | string | undefined;
    if (predicate(value)) {
      expectTypeOf(value).toEqualTypeOf<number | string>();
    }
  });

  test('works with one type guard', () => {
    const predicate = somePredicate(isString);
    const value = 42 as unknown;
    if (predicate(value)) {
      expectTypeOf(value).toEqualTypeOf<string>();
    }
  });

  test('does not narrow the value type if not all the predicates are type guards', () => {
    const predicate = somePredicate(isString, isNumber, isTruly);
    const value = 42 as unknown;
    if (predicate(value)) {
      expectTypeOf(value).toEqualTypeOf<unknown>();
    }
  });
});

describe('assertSome', () => {
  test('narrows unknown to union type', () => {
    const value = 42 as unknown;
    assertSome(value, isString, isNumber, isBoolean);
    expectTypeOf(value).toEqualTypeOf<boolean | number | string>();
  });

  test('narrows unions correctly', () => {
    const value = 42 as number | string | undefined;
    assertSome(value, isString, isNumber, isBoolean);
    expectTypeOf(value).toEqualTypeOf<number | string>();
  });

  test('works with one type guard', () => {
    const value = 42 as unknown;
    assertSome(value, isString);
    expectTypeOf(value).toEqualTypeOf<string>();
  });

  test('does not narrow the value type if not all the predicates are type guards', () => {
    const value = 42 as unknown;
    assertSome(value, isString, isNumber, isTruly);
    expectTypeOf(value).toEqualTypeOf<unknown>();
  });
});

describe('everyPredicate', () => {
  test('narrows unknown to intersection type', () => {
    const predicate = everyPredicate(isString, isIterable);
    const value = 42 as unknown;
    if (predicate(value)) {
      expectTypeOf(value).toEqualTypeOf<string & Iterable<unknown>>();
    }
  });

  test('narrows union correctly', () => {
    const value = 42 as number | string | undefined;
    const predicate = everyPredicate(isString, isIterable);
    if (predicate(value)) {
      // typescript infers a more specific type in case of union
      expectTypeOf(value).toEqualTypeOf<string>();
    }
  });

  test("doesn't narrow the type if some of the predicates is not a type guard", () => {
    const predicate = everyPredicate(isString, isNumber, isTruly);
    const value = 42 as unknown;
    if (predicate(value)) {
      expectTypeOf(value).toEqualTypeOf<unknown>();
    }
  });
});

describe('assertEvery', () => {
  test('narrows unknown to intersection type', () => {
    const value = 42 as unknown;
    assertEvery(value, isString, isIterable);
    expectTypeOf(value).toEqualTypeOf<string & Iterable<unknown>>();
  });

  test('narrows union correctly', () => {
    const value = 42 as number | string | undefined;
    assertEvery(value, isString, isIterable);
    expectTypeOf(value).toEqualTypeOf<string>();
  });

  test('still narrows the value type if not all the predicates are type guards', () => {
    const value = 42 as unknown;
    assertEvery(value, isString, isTruly);
    expectTypeOf(value).toEqualTypeOf<string>();
  });
});

describe('assertAnyOf', () => {
  test('asserts that a value is of tested type', () => {
    const value = 'red' as unknown;
    assertAnyOf(['red', 'green', 'blue'], value);
    expectTypeOf(value).toEqualTypeOf<string>();
  });

  test('asserts that a value is one of the specified literals', () => {
    const value = 'red' as unknown;
    assertAnyOf(['red', 'green', 'blue'] as const, value);
    expectTypeOf(value).toEqualTypeOf<'blue' | 'green' | 'red'>();
  });

  test('handles mixed types', () => {
    const value = 'red' as unknown;
    assertAnyOf(['red', 1, true], value);
    expectTypeOf(value).toEqualTypeOf<boolean | number | string>();
  });

  test('handles mixed literals', () => {
    const value = 'red' as unknown;
    assertAnyOf(['red', 1, true] as const, value);
    expectTypeOf(value).toEqualTypeOf<1 | 'red' | true>();
  });

  test('handles string iterable', () => {
    const input = 'foobar';
    const value = 'o' as unknown;
    assertAnyOf(input, value);
    expectTypeOf(value).toEqualTypeOf<string>();
  });

  test('handles Set iterable', () => {
    const setValue = new Set(['foo', 1, false] as const);
    const value = 'foo' as unknown;
    assertAnyOf(setValue, value);
    expectTypeOf(value).toEqualTypeOf<1 | 'foo' | false>();
  });
});
