import { describe, expect, test } from 'vitest';

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

describe.concurrent('invariant', () => {
  test('does not throw when condition is true', () => {
    expect(() => void invariant(true)).not.toThrow();
  });

  test('throws TypeError when condition is false with default message', () => {
    expect(() => void invariant(false)).toThrow(TypeError);
    expect(() => void invariant(false)).toThrow(
      'Expected condition to be true',
    );
  });

  test('throws TypeError with custom string message', () => {
    expect(() => void invariant(false, 'Custom error message')).toThrow(
      TypeError,
    );
    expect(() => void invariant(false, 'Custom error message')).toThrow(
      'Custom error message',
    );
  });

  test('throws TypeError with lazily evaluated message', () => {
    const messageFn = (): string => 'Lazy error message';
    expect(() => void invariant(false, messageFn)).toThrow(TypeError);
    expect(() => void invariant(false, messageFn)).toThrow(
      'Lazy error message',
    );
  });
});

describe.concurrent('invariantPredicate', () => {
  test('does not throw when predicate returns true', () => {
    const predicate = (value: unknown): value is string =>
      typeof value === 'string';
    expect(() => void invariantPredicate(predicate, 'test')).not.toThrow();
  });

  test('throws TypeError when predicate returns false', () => {
    const predicate = (value: unknown): value is string =>
      typeof value === 'string';
    expect(() => void invariantPredicate(predicate, 123)).toThrow(TypeError);
  });

  test('uses custom value name in error message', () => {
    const predicate = (value: unknown): value is string =>
      typeof value === 'string';
    expect(() => void invariantPredicate(predicate, 123, 'myValue')).toThrow(
      /myValue/,
    );
  });

  test('uses default value name when not provided', () => {
    const predicate = (value: unknown): value is string =>
      typeof value === 'string';
    expect(() => void invariantPredicate(predicate, 123)).toThrow(/value/);
  });

  test('throws TypeError when predicate does not return boolean', () => {
    const predicate = (): unknown => 'not a boolean';
    expect(() => void invariantPredicate(predicate as never, 'test')).toThrow(
      TypeError,
    );
  });

  test('throws TypeError when predicate returns null or undefined', () => {
    expect(
      () => void invariantPredicate((() => undefined) as never, 'test'),
    ).toThrow(TypeError);
    expect(
      () => void invariantPredicate((() => null) as never, 'test'),
    ).toThrow(TypeError);
  });
});

describe.concurrent('normalizeOptionalRest', () => {
  test('works for empty array', () => {
    expect(
      normalizeOptionalRest([isString, isBoolean, isNumber], []),
    ).toStrictEqual([undefined, undefined, undefined]);
  });

  test('works for one of three argument', () => {
    expect(
      normalizeOptionalRest([isString, isBoolean, isNumber], ['foo']),
    ).toStrictEqual(['foo', undefined, undefined]);
    expect(
      normalizeOptionalRest([isString, isBoolean, isNumber], [true]),
    ).toStrictEqual([undefined, true, undefined]);
    expect(
      normalizeOptionalRest([isString, isBoolean, isNumber], [1]),
    ).toStrictEqual([undefined, undefined, 1]);
  });

  test('works for two of three arguments', () => {
    expect(
      normalizeOptionalRest([isString, isBoolean, isNumber], ['foo', true]),
    ).toStrictEqual(['foo', true, undefined]);
    expect(
      normalizeOptionalRest([isString, isBoolean, isNumber], ['foo', 1]),
    ).toStrictEqual(['foo', undefined, 1]);
    expect(
      normalizeOptionalRest([isString, isBoolean, isNumber], [true, 1]),
    ).toStrictEqual([undefined, true, 1]);
  });

  test('works for three arguments', () => {
    expect(
      normalizeOptionalRest([isString, isBoolean, isNumber], ['foo', true, 1]),
    ).toStrictEqual(['foo', true, 1]);
  });

  test('throws for four arguments', () => {
    expect(() =>
      normalizeOptionalRest(
        [isString, isBoolean, isNumber],
        ['foo', true, 1, 2],
      ),
    ).toThrow(TypeError);
    expect(() =>
      normalizeOptionalRest(
        [isString, isBoolean, isNumber],
        ['foo', true, 1, 2],
      ),
    ).toThrow('Too many arguments provided. Expected at most 3, got 4');
    expect(() =>
      normalizeOptionalRest(
        [isString, isBoolean, isNumber],
        ['foo', true, 1, 2],
        1,
      ),
    ).toThrow('Too many arguments provided. Expected at most 4, got 5');
  });

  test('throws for wrong subsequence', () => {
    expect(() =>
      normalizeOptionalRest([isString, isBoolean, isNumber], ['foo', 'foo']),
    ).toThrowError(
      new TypeError(
        'Expected args[1] to be boolean or number, got string instead',
      ),
    );

    expect(() =>
      normalizeOptionalRest(
        [isString, isBoolean, isNumber],
        ['foo', true, 'foo'],
      ),
    ).toThrowError(
      new TypeError('Expected args[2] to be number, got string instead'),
    );

    expect(() =>
      normalizeOptionalRest([isString, isBoolean, isNumber], [true, 'foo']),
    ).toThrowError(
      new TypeError('Expected args[1] to be number, got string instead'),
    );

    expect(() =>
      normalizeOptionalRest(
        [isString, isBoolean, isBoolean, isNumber],
        ['foo', true, 'foo'],
      ),
    ).toThrowError(
      new TypeError(
        'Expected args[2] to be boolean or number, got string instead',
      ),
    );
  });

  test('throws correct error for wrong subsequence with restShift', () => {
    expect(() =>
      normalizeOptionalRest([isString, isBoolean, isNumber], ['foo', 'foo'], 1),
    ).toThrowError(
      new TypeError(
        'Expected args[2] to be boolean or number, got string instead',
      ),
    );

    expect(() =>
      normalizeOptionalRest(
        [isString, isBoolean, isNumber],
        ['foo', true, 'foo'],
        2,
      ),
    ).toThrowError(
      new TypeError('Expected args[4] to be number, got string instead'),
    );

    expect(() =>
      normalizeOptionalRest([isString, isBoolean, isNumber], [true, 'foo'], 2),
    ).toThrowError(
      new TypeError('Expected args[3] to be number, got string instead'),
    );

    expect(() =>
      normalizeOptionalRest(
        [isString, isBoolean, isBoolean, isNumber],
        ['foo', true, 'foo'],
        1,
      ),
    ).toThrowError(
      new TypeError(
        'Expected args[3] to be boolean or number, got string instead',
      ),
    );
  });

  test('ignores trailing undefined values', () => {
    expect(
      normalizeOptionalRest(
        [isString, isBoolean, isNumber],
        ['foo', true, undefined],
      ),
    ).toStrictEqual(['foo', true, undefined]);
  });
});

describe.concurrent('assertNotNil', () => {
  test('does not throw for non-nil values', () => {
    expect(() => void assertNotNil(0)).not.toThrow();
    expect(() => void assertNotNil('')).not.toThrow();
    expect(() => void assertNotNil(false)).not.toThrow();
    expect(() => void assertNotNil({})).not.toThrow();
    expect(() => void assertNotNil([])).not.toThrow();
  });

  test('throws TypeError for null', () => {
    expect(() => void assertNotNil(null)).toThrow(TypeError);
  });

  test('throws TypeError for undefined', () => {
    expect(() => void assertNotNil(undefined)).toThrow(TypeError);
  });

  test('includes custom name in error message', () => {
    expect(() => void assertNotNil(null, 'customName')).toThrow(/customName/);
  });
});

describe.concurrent('assertString', () => {
  test('does not throw for string values', () => {
    expect(() => void assertString('')).not.toThrow();
    expect(() => void assertString('hello')).not.toThrow();
    expect(() => void assertString('123')).not.toThrow();
  });

  test('throws TypeError for non-string values', () => {
    expect(() => void assertString(123)).toThrow(TypeError);
    expect(() => void assertString(true)).toThrow(TypeError);
    expect(() => void assertString({})).toThrow(TypeError);
    expect(() => void assertString([])).toThrow(TypeError);
    expect(() => void assertString(null)).toThrow(TypeError);
    expect(() => void assertString(undefined)).toThrow(TypeError);
  });

  test('includes custom name in error message', () => {
    expect(() => void assertString(123, 'myString')).toThrow(/myString/);
  });
});

describe.concurrent('assertNumber', () => {
  test('does not throw for number values', () => {
    expect(() => void assertNumber(0)).not.toThrow();
    expect(() => void assertNumber(123)).not.toThrow();
    expect(() => void assertNumber(-456)).not.toThrow();
    expect(() => void assertNumber(3.14)).not.toThrow();
    expect(() => void assertNumber(Infinity)).not.toThrow();
    expect(() => void assertNumber(-Infinity)).not.toThrow();
  });

  test('throws TypeError for NaN', () => {
    expect(() => void assertNumber(NaN)).toThrow(TypeError);
  });

  test('throws TypeError for non-number values', () => {
    expect(() => void assertNumber('123')).toThrow(TypeError);
    expect(() => void assertNumber(true)).toThrow(TypeError);
    expect(() => void assertNumber({})).toThrow(TypeError);
    expect(() => void assertNumber([])).toThrow(TypeError);
    expect(() => void assertNumber(null)).toThrow(TypeError);
    expect(() => void assertNumber(undefined)).toThrow(TypeError);
  });

  test('includes custom name in error message', () => {
    expect(() => void assertNumber('123', 'myNumber')).toThrow(/myNumber/);
  });
});

describe.concurrent('assertSymbol', () => {
  test('does not throw for symbol values', () => {
    expect(() => void assertSymbol(Symbol())).not.toThrow();
    expect(() => void assertSymbol(Symbol('test'))).not.toThrow();
    expect(() => void assertSymbol(Symbol.iterator)).not.toThrow();
  });

  test('throws TypeError for non-symbol values', () => {
    expect(() => void assertSymbol('symbol')).toThrow(TypeError);
    expect(() => void assertSymbol(123)).toThrow(TypeError);
    expect(() => void assertSymbol(true)).toThrow(TypeError);
    expect(() => void assertSymbol({})).toThrow(TypeError);
    expect(() => void assertSymbol([])).toThrow(TypeError);
    expect(() => void assertSymbol(null)).toThrow(TypeError);
    expect(() => void assertSymbol(undefined)).toThrow(TypeError);
  });

  test('includes custom name in error message', () => {
    expect(() => void assertSymbol('test', 'mySymbol')).toThrow(/mySymbol/);
  });
});

describe.concurrent('assertPropKey', () => {
  test('does not throw for valid property keys', () => {
    expect(() => void assertPropKey('string')).not.toThrow();
    expect(() => void assertPropKey(123)).not.toThrow();
    expect(() => void assertPropKey(Symbol())).not.toThrow();
    expect(() => void assertPropKey('')).not.toThrow();
    expect(() => void assertPropKey(0)).not.toThrow();
  });

  test('throws TypeError for invalid property keys', () => {
    expect(() => void assertPropKey(true)).toThrow(TypeError);
    expect(() => void assertPropKey({})).toThrow(TypeError);
    expect(() => void assertPropKey([])).toThrow(TypeError);
    expect(() => void assertPropKey(null)).toThrow(TypeError);
    expect(() => void assertPropKey(undefined)).toThrow(TypeError);
  });

  test('includes custom name in error message', () => {
    expect(() => void assertPropKey(true, 'myPropKey')).toThrow(/myPropKey/);
  });
});

describe.concurrent('assertBoolean', () => {
  test('does not throw for boolean values', () => {
    expect(() => void assertBoolean(true)).not.toThrow();
    expect(() => void assertBoolean(false)).not.toThrow();
  });

  test('throws TypeError for non-boolean values', () => {
    expect(() => void assertBoolean(1)).toThrow(TypeError);
    expect(() => void assertBoolean(0)).toThrow(TypeError);
    expect(() => void assertBoolean('true')).toThrow(TypeError);
    expect(() => void assertBoolean('false')).toThrow(TypeError);
    expect(() => void assertBoolean({})).toThrow(TypeError);
    expect(() => void assertBoolean([])).toThrow(TypeError);
    expect(() => void assertBoolean(null)).toThrow(TypeError);
    expect(() => void assertBoolean(undefined)).toThrow(TypeError);
  });

  test('includes custom name in error message', () => {
    expect(() => void assertBoolean(1, 'myBoolean')).toThrow(/myBoolean/);
  });
});

describe.concurrent('assertObject', () => {
  test('does not throw for object values', () => {
    expect(() => void assertObject({})).not.toThrow();
    expect(() => void assertObject([])).not.toThrow();
    expect(() => void assertObject(new Date())).not.toThrow();
  });

  test('throws TypeError for non-object values', () => {
    expect(() => void assertObject(123)).toThrow(TypeError);
    expect(() => void assertObject('string')).toThrow(TypeError);
    expect(() => void assertObject(true)).toThrow(TypeError);
    expect(() => void assertObject(null)).toThrow(TypeError);
    expect(() => void assertObject(undefined)).toThrow(TypeError);
    expect(() => void assertObject(Symbol())).toThrow(TypeError);
    expect(() => void assertObject(() => {})).toThrow(TypeError);
  });

  test('includes custom name in error message', () => {
    expect(() => void assertObject(123, 'myObject')).toThrow(/myObject/);
  });
});

describe.concurrent('assertArray', () => {
  test('does not throw for array values', () => {
    expect(() => void assertArray([])).not.toThrow();
    expect(() => void assertArray([1, 2, 3])).not.toThrow();
    expect(() => void assertArray(['a', 'b'])).not.toThrow();
  });

  test('throws TypeError for non-array values', () => {
    expect(() => void assertArray({})).toThrow(TypeError);
    expect(() => void assertArray('string')).toThrow(TypeError);
    expect(() => void assertArray(123)).toThrow(TypeError);
    expect(() => void assertArray(true)).toThrow(TypeError);
    expect(() => void assertArray(null)).toThrow(TypeError);
    expect(() => void assertArray(undefined)).toThrow(TypeError);
  });

  test('includes custom name in error message', () => {
    expect(() => void assertArray({}, 'myArray')).toThrow(/myArray/);
  });

  test('validates array elements with type guard', () => {
    expect(() => void assertArray(['a', 'b'], isString)).not.toThrow();
    expect(() => void assertArray([1, 2], isString)).toThrow(TypeError);
  });

  test('validates array elements with predicate', () => {
    const isPositive = (value: number): boolean => value > 0;
    expect(() => void assertArray([1, 2, 3], isPositive)).not.toThrow();
    expect(() => void assertArray([1, -2, 3], isPositive)).toThrow(TypeError);
  });

  test('includes element index in error message for failed predicate', () => {
    expect(() => void assertArray(['a', 123], isString, 'items')).toThrow(
      'Expected items[1] to be string, got number instead',
    );
  });

  test('throws TypeError for more than 3 arguments', () => {
    const predicate = (value: unknown): value is string =>
      typeof value === 'string';
    expect(
      () =>
        // @ts-expect-error: TS2554 because testing invalid number of arguments
        void assertArray([], predicate, 'name', 'extra' as never),
    ).toThrow(TypeError);
  });

  test('throws TypeError for invalid argument combination', () => {
    expect(() => void assertArray([], 123 as never, 'name')).toThrow(TypeError);
  });

  test('validates with predicate and custom name', () => {
    expect(
      () => void assertArray([1, 2, 3], isNumber, 'numbers'),
    ).not.toThrow();
    expect(() => void assertArray(['a'], isNumber, 'numbers')).toThrow(
      /numbers/,
    );
  });
});

describe.concurrent('assertFunction', () => {
  test('does not throw for function values', () => {
    expect(() => void assertFunction(() => {})).not.toThrow();
    expect(() => void assertFunction(function () {})).not.toThrow();
    expect(() => void assertFunction(async () => {})).not.toThrow();
    expect(() => void assertFunction(function* () {})).not.toThrow();
    // eslint-disable-next-line @typescript-eslint/no-extraneous-class
    expect(() => void assertFunction(class {})).not.toThrow();
  });

  test('throws TypeError for non-function values', () => {
    expect(() => void assertFunction({})).toThrow(TypeError);
    expect(() => void assertFunction([])).toThrow(TypeError);
    expect(() => void assertFunction('function')).toThrow(TypeError);
    expect(() => void assertFunction(new Date())).toThrow(
      'Expected value to be function, got Date object instead',
    );
    expect(() => void assertFunction(123)).toThrow(TypeError);
    expect(() => void assertFunction(true)).toThrow(TypeError);
    expect(() => void assertFunction(null)).toThrow(TypeError);
    expect(() => void assertFunction(undefined)).toThrow(TypeError);
  });

  test('includes custom name in error message', () => {
    expect(() => void assertFunction({}, 'myFunction')).toThrow(/myFunction/);
  });
});
