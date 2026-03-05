/* eslint-disable @typescript-eslint/no-extraneous-class,@typescript-eslint/consistent-type-assertions */
import type { Predicate } from '@budsbox/lib-types';

import { describe, expect, test, vi } from 'vitest';

import { isBoolean, isNotNil, isNumber, isString } from '#guards/check';
import {
  anyOf,
  assertAnyOf,
  assertEvery,
  assertIterable,
  assertOfType,
  assertSome,
  assertTuple,
  everyPredicate,
  isIterable,
  isTuple,
  ofType,
  somePredicate,
} from '#guards/hlf';

describe.concurrent('isIterable', () => {
  describe('positive cases', () => {
    test('returns true for arrays', () => {
      expect(isIterable([])).toBe(true);
      expect(isIterable([1, 2, 3])).toBe(true);
    });

    test('returns true for strings', () => {
      expect(isIterable('')).toBe(true);
      expect(isIterable('hello')).toBe(true);
    });

    test('returns true for sets', () => {
      expect(isIterable(new Set())).toBe(true);
      expect(isIterable(new Set([1, 2, 3]))).toBe(true);
    });

    test('returns true for maps', () => {
      expect(isIterable(new Map())).toBe(true);
      expect(isIterable(new Map([['a', 1]]))).toBe(true);
    });

    test('returns true for objects with Symbol.iterator', () => {
      const customIterable = {
        [Symbol.iterator]: () => ({
          next: () => ({ done: true, value: undefined }),
        }),
      };
      expect(isIterable(customIterable)).toBe(true);
    });

    test('returns true for generators', () => {
      function* generator(): Generator {
        yield 1;
      }
      expect(isIterable(generator())).toBe(true);
    });
  });

  describe('negative cases', () => {
    test('returns false for plain objects', () => {
      expect(isIterable({})).toBe(false);
      expect(isIterable({ a: 1, b: 2 })).toBe(false);
    });

    test('returns false for numbers', () => {
      expect(isIterable(0)).toBe(false);
      expect(isIterable(42)).toBe(false);
      expect(isIterable(-1)).toBe(false);
      expect(isIterable(NaN)).toBe(false);
    });

    test('returns false for booleans', () => {
      expect(isIterable(true)).toBe(false);
      expect(isIterable(false)).toBe(false);
    });

    test('returns false for symbols', () => {
      expect(isIterable(Symbol('test'))).toBe(false);
    });

    test('returns false for functions', () => {
      expect(isIterable(() => {})).toBe(false);
      expect(isIterable(function (): void {})).toBe(false);
      expect(isIterable(class Test {})).toBe(false);
    });

    test('returns false for null', () => {
      expect(isIterable(null)).toBe(false);
    });

    test('returns false for undefined', () => {
      expect(isIterable(undefined)).toBe(false);
    });

    test('returns false when Symbol.iterator is not a function', () => {
      expect(isIterable({ [Symbol.iterator]: 'not a function' })).toBe(false);
      expect(isIterable({ [Symbol.iterator]: 42 })).toBe(false);
      expect(isIterable({ [Symbol.iterator]: {} })).toBe(false);
    });
  });
});

describe.concurrent('assertIterable', () => {
  describe('positive cases', () => {
    test('does not throw for arrays', () => {
      expect(() => {
        assertIterable([]);
        assertIterable([1, 2, 3]);
      }).not.toThrow();
    });

    test('does not throw for strings', () => {
      expect(() => {
        assertIterable('');
        assertIterable('hello');
      }).not.toThrow();
    });

    test('does not throw for sets', () => {
      expect(() => {
        assertIterable(new Set());
        assertIterable(new Set([1, 2, 3]));
      }).not.toThrow();
    });

    test('does not throw for maps', () => {
      expect(() => {
        assertIterable(new Map());
        assertIterable(new Map([['a', 1]]));
      }).not.toThrow();
    });

    test('does not throw for custom iterables', () => {
      const customIterable = {
        [Symbol.iterator]: () => ({
          next: () => ({ done: true, value: undefined }),
        }),
      };
      expect(() => {
        assertIterable(customIterable);
      }).not.toThrow();
    });

    test('does not throw for generators', () => {
      function* generator(): Generator {
        yield 1;
      }
      expect(() => {
        assertIterable(generator());
      }).not.toThrow();
    });
  });

  describe('negative cases', () => {
    test('throws TypeError for plain objects', () => {
      expect(() => {
        assertIterable({});
      }).toThrow(TypeError);

      expect(() => {
        assertIterable({ a: 1, b: 2 });
      }).toThrow(TypeError);
    });

    test('throws TypeError for numbers', () => {
      expect(() => {
        assertIterable(0);
      }).toThrow(TypeError);

      expect(() => {
        assertIterable(42);
      }).toThrow(TypeError);
    });

    test('throws TypeError for booleans', () => {
      expect(() => {
        assertIterable(true);
      }).toThrow(TypeError);

      expect(() => {
        assertIterable(false);
      }).toThrow(TypeError);
    });

    test('throws TypeError for symbols', () => {
      expect(() => {
        assertIterable(Symbol('test'));
      }).toThrow(TypeError);
    });

    test('throws TypeError for functions', () => {
      expect(() => {
        assertIterable(() => {});
      }).toThrow(TypeError);
      expect(() => {
        assertIterable(function (): void {});
      }).toThrow(TypeError);
    });

    test('throws TypeError for null', () => {
      expect(() => {
        assertIterable(null);
      }).toThrow(TypeError);
    });

    test('throws TypeError for undefined', () => {
      expect(() => {
        assertIterable(undefined);
      }).toThrow(TypeError);
    });

    test('throws TypeError when Symbol.iterator is not a function', () => {
      expect(() => {
        assertIterable({ [Symbol.iterator]: 'not a function' });
      }).toThrow(TypeError);

      expect(() => {
        assertIterable({ [Symbol.iterator]: 42 });
      }).toThrow(TypeError);
    });

    test('uses custom valueName in error message', () => {
      expect(() => {
        assertIterable({}, 'myVariable');
      }).toThrow(TypeError);
    });

    test('uses default valueName when not provided', () => {
      expect(() => {
        assertIterable({});
      }).toThrow(TypeError);
    });
  });

  describe('edge cases', () => {
    test('throws TypeError with invalid valueName argument type', () => {
      expect(() => void assertIterable([], 42 as never)).toThrow(TypeError);
      expect(() => void assertIterable([], 42 as never)).toThrow(
        'Expected valueName to be string, got number instead',
      );
    });
  });
});

describe.concurrent('ofType', () => {
  test('creates a type predicate for built-in constructors', () => {
    const isDate = ofType(Date);
    const date = new Date();

    expect(isDate(date)).toBe(true);
    expect(isDate('2024-01-01')).toBe(false);
    expect(isDate(123)).toBe(false);
    expect(isDate(null)).toBe(false);
    expect(isDate(undefined)).toBe(false);
  });

  test('creates a type predicate for custom classes', () => {
    class CustomClass {
      public constructor(public value: number) {}
    }

    const isCustom = ofType(CustomClass);
    const instance = new CustomClass(42);

    expect(isCustom(instance)).toBe(true);
    expect(isCustom({})).toBe(false);
    expect(isCustom({ value: 42 })).toBe(false);
  });

  test('works with Error constructors', () => {
    const isError = ofType(Error);
    const isTypeError = ofType(TypeError);

    expect(isError(new Error())).toBe(true);
    expect(isError(new TypeError())).toBe(true);
    expect(isTypeError(new TypeError())).toBe(true);
    expect(isTypeError(new Error())).toBe(false);
  });

  test('works with Array constructor', () => {
    const isArray = ofType(Array);

    expect(isArray([])).toBe(true);
    expect(isArray([1, 2, 3])).toBe(true);
    expect(isArray('array')).toBe(false);
    expect(isArray({ length: 0 })).toBe(false);
  });

  test('returns false for primitives', () => {
    const isDate = ofType(Date);

    expect(isDate(42)).toBe(false);
    expect(isDate('string')).toBe(false);
    expect(isDate(true)).toBe(false);
    expect(isDate(Symbol('test'))).toBe(false);
  });

  test('returns false for null and undefined', () => {
    const isDate = ofType(Date);

    expect(isDate(null)).toBe(false);
    expect(isDate(undefined)).toBe(false);
  });

  test('works with inheritance chain', () => {
    class Parent {}
    class Child extends Parent {}

    const isParent = ofType(Parent);
    const isChild = ofType(Child);
    const child = new Child();

    expect(isChild(child)).toBe(true);
    expect(isParent(child)).toBe(true);
  });

  test('throws TypeError when ctor is not a function', () => {
    expect(() => ofType(null as never)).toThrow(TypeError);
    expect(() => ofType(undefined as never)).toThrow(TypeError);
    expect(() => ofType(42 as never)).toThrow(TypeError);
    expect(() => ofType('Date' as never)).toThrow(TypeError);
    expect(() => ofType({} as never)).toThrow(TypeError);
  });
});

describe.concurrent('assertOfType', () => {
  test('does not throw for valid instances', () => {
    const date = new Date();

    expect(() => void assertOfType(Date, date)).not.toThrow();
    expect(() => void assertOfType(Date, date, 'myDate')).not.toThrow();
  });

  test('does not throw for custom class instances', () => {
    class CustomClass {
      public constructor(public value: number) {}
    }

    const instance = new CustomClass(42);

    expect(() => void assertOfType(CustomClass, instance)).not.toThrow();
  });

  test('throws TypeError when value is not an instance of constructor', () => {
    expect(() => void assertOfType(Date, '2024-01-01')).toThrow(TypeError);
    expect(() => void assertOfType(Date, 123)).toThrow(TypeError);
    expect(() => void assertOfType(Date, {})).toThrow(TypeError);
  });

  test('throws TypeError with custom name in error message', () => {
    expect(() => void assertOfType(Date, 'invalid', 'dateParam')).toThrow(
      TypeError,
    );
    expect(() => void assertOfType(Date, 'invalid', 'dateParam')).toThrow(
      /dateParam/,
    );
  });

  test('throws TypeError for primitives', () => {
    expect(() => void assertOfType(Date, null)).toThrow(TypeError);
    expect(() => void assertOfType(Date, undefined)).toThrow(TypeError);
    expect(() => void assertOfType(Date, 42)).toThrow(TypeError);
    expect(() => void assertOfType(Date, 'string')).toThrow(TypeError);
    expect(() => void assertOfType(Date, true)).toThrow(TypeError);
  });

  test('throws TypeError when ctor is not a function', () => {
    expect(() => void assertOfType(null as never, new Date())).toThrow(
      TypeError,
    );
    expect(() => void assertOfType(undefined as never, new Date())).toThrow(
      TypeError,
    );
    expect(() => void assertOfType(42 as never, new Date())).toThrow(TypeError);
    expect(() => void assertOfType('Date' as never, new Date())).toThrow(
      TypeError,
    );
  });

  test('works with inheritance', () => {
    class Parent {}
    class Child extends Parent {}

    const child = new Child();

    expect(() => void assertOfType(Child, child)).not.toThrow();
    expect(() => void assertOfType(Parent, child)).not.toThrow();
  });

  test('throws when checking parent type against child constructor', () => {
    class Parent {}
    class Child extends Parent {}

    const parent = new Parent();

    expect(() => void assertOfType(Child, parent)).toThrow(TypeError);
  });

  test('uses default value name when not provided', () => {
    expect(() => void assertOfType(Date, 'invalid')).toThrow(/value/);
    expect(() => void assertOfType(Date, 'new Date()', undefined)).toThrow(
      /value/,
    );
  });

  test('throws TypeError when name is not a string', () => {
    expect(() => void assertOfType(Date, new Date(), 42 as never)).toThrow(
      TypeError,
    );
    expect(() => void assertOfType(Date, new Date(), null as never)).toThrow(
      TypeError,
    );
  });
});

describe.concurrent('somePredicate', () => {
  test('returns true when at least one predicate matches', () => {
    const predicate = somePredicate(isString, isNumber);

    expect(predicate('hello')).toBe(true);
    expect(predicate(42)).toBe(true);
  });

  test('returns false when no predicates match', () => {
    const predicate = somePredicate(isString, isNumber);

    expect(predicate(true)).toBe(false);
    expect(predicate({})).toBe(false);
    expect(predicate(null)).toBe(false);
    expect(predicate(undefined)).toBe(false);
  });

  test('returns true when first predicate matches', () => {
    const predicate = somePredicate(isString, isNumber);

    expect(predicate('test')).toBe(true);
  });

  test('returns true when last predicate matches', () => {
    const predicate = somePredicate(isString, isNumber);

    expect(predicate(123)).toBe(true);
  });

  test('works with single predicate', () => {
    const predicate = somePredicate(isString);

    expect(predicate('hello')).toBe(true);
    expect(predicate(42)).toBe(false);
  });

  test('works with multiple predicates', () => {
    const predicate = somePredicate(isString, isNumber, isBoolean);

    expect(predicate('string')).toBe(true);
    expect(predicate(42)).toBe(true);
    expect(predicate(true)).toBe(true);
    expect(predicate({})).toBe(false);
  });

  test('works with custom type predicates', () => {
    const isPositive = (value: unknown): value is number =>
      typeof value === 'number' && value > 0;
    const isNonEmpty = (value: unknown): value is string =>
      typeof value === 'string' && value.length > 0;

    const predicate = somePredicate(isPositive, isNonEmpty);

    expect(predicate(5)).toBe(true);
    expect(predicate('test')).toBe(true);
    expect(predicate(-5)).toBe(false);
    expect(predicate('')).toBe(false);
  });

  test('returns false for null and undefined when predicates do not match', () => {
    const predicate = somePredicate(isString, isNumber);

    expect(predicate(null)).toBe(false);
    expect(predicate(undefined)).toBe(false);
  });

  test('throws TypeError when predicates array contains non-function', () => {
    expect(() => somePredicate(isString, 'not a function' as never)).toThrow(
      TypeError,
    );
    expect(() => somePredicate(42 as never)).toThrow(TypeError);
    expect(() => somePredicate(null as never)).toThrow(TypeError);
    expect(() => somePredicate(isString, undefined as never)).toThrow(
      TypeError,
    );
  });

  test('handles empty predicates array', () => {
    expect(somePredicate()(42 as never)).toBe(false);
  });
});

describe.concurrent('assertSome', () => {
  test('does not throw when at least one predicate matches', () => {
    expect(() => void assertSome('hello', isString, isNumber)).not.toThrow();
    expect(() => void assertSome(42, isString, isNumber)).not.toThrow();
  });

  test('does not throw with custom value name', () => {
    expect(
      () => void assertSome('hello', 'param', isString, isNumber),
    ).not.toThrow();
    expect(
      () => void assertSome(42, 'count', isString, isNumber),
    ).not.toThrow();
  });

  test('throws TypeError when no predicates match', () => {
    expect(() => void assertSome(true, isString, isNumber)).toThrow(TypeError);
    expect(() => void assertSome({}, isString, isNumber)).toThrow(TypeError);
    expect(() => void assertSome(null, isString, isNumber)).toThrow(TypeError);
    expect(() => void assertSome(undefined, isString, isNumber)).toThrow(
      TypeError,
    );
  });

  test('throws TypeError with custom name in error message', () => {
    expect(
      () => void assertSome(true, 'customParam', isString, isNumber),
    ).toThrow(TypeError);
    expect(
      () => void assertSome(true, 'customParam', isString, isNumber),
    ).toThrow(/customParam/);
  });

  test('works with single predicate', () => {
    expect(() => void assertSome('test', isString)).not.toThrow();
    expect(() => void assertSome(42, isString)).toThrow(TypeError);
  });

  test('works with multiple predicates', () => {
    expect(
      () => void assertSome('string', isString, isNumber, isBoolean),
    ).not.toThrow();
    expect(
      () => void assertSome(42, isString, isNumber, isBoolean),
    ).not.toThrow();
    expect(
      () => void assertSome(true, isString, isNumber, isBoolean),
    ).not.toThrow();
    expect(() => void assertSome({}, isString, isNumber, isBoolean)).toThrow(
      TypeError,
    );
  });

  test('uses default value name when not provided', () => {
    expect(() => void assertSome(true, isString, isNumber)).toThrow(/value/);
  });

  test('throws TypeError when predicates contain non-function', () => {
    expect(
      () =>
        void assertSome(
          'test',
          isString,
          'not a function' as unknown as Predicate,
        ),
    ).toThrow(TypeError);
    expect(
      () => void assertSome('test', isString, null as unknown as Predicate),
    ).toThrow('Expected predicates[1] to be function, got null instead');
    expect(
      () =>
        void assertSome('test', 'param', isString, 42 as unknown as Predicate),
    ).toThrow('Expected predicates[1] to be function, got number instead');
  });

  test('correctly distinguishes between valueName and predicate', () => {
    const alwaysFalse = (): boolean => false;

    expect(() => void assertSome('test', alwaysFalse, isString)).not.toThrow();
    expect(
      () => void assertSome('test', 'param', alwaysFalse, isString),
    ).not.toThrow();
    expect(() => void assertSome(42, alwaysFalse, isString)).toThrow(TypeError);
  });

  test('works with custom type predicates', () => {
    const isPositive = (value: unknown): value is number =>
      typeof value === 'number' && value > 0;
    const isNonEmpty = (value: unknown): value is string =>
      typeof value === 'string' && value.length > 0;

    expect(() => void assertSome(5, isPositive, isNonEmpty)).not.toThrow();
    expect(() => void assertSome('test', isPositive, isNonEmpty)).not.toThrow();
    expect(() => void assertSome(-5, isPositive, isNonEmpty)).toThrow(
      TypeError,
    );
    expect(() => void assertSome('', isPositive, isNonEmpty)).toThrow(
      TypeError,
    );
  });
});

describe.concurrent('everyPredicate', () => {
  test('returns true when all predicates match', () => {
    const isPositiveNumber = (value: unknown): value is number =>
      typeof value === 'number' && value > 0;
    const predicate = everyPredicate(isNumber, isPositiveNumber);

    expect(predicate(42)).toBe(true);
    expect(predicate(1)).toBe(true);
  });

  test('returns false when at least one predicate does not match', () => {
    const isPositiveNumber = (value: unknown): value is number =>
      typeof value === 'number' && value > 0;
    const predicate = everyPredicate(isNumber, isPositiveNumber);

    expect(predicate(-5)).toBe(false);
    expect(predicate(0)).toBe(false);
    expect(predicate('42')).toBe(false);
  });

  test('returns false when first predicate does not match', () => {
    const isPositiveNumber = (value: unknown): value is number =>
      typeof value === 'number' && value > 0;
    const predicate = everyPredicate(isNumber, isPositiveNumber);

    expect(predicate('test')).toBe(false);
  });

  test('returns false when last predicate does not match', () => {
    const isPositiveNumber = (value: unknown): value is number =>
      typeof value === 'number' && value > 0;
    const predicate = everyPredicate(isNumber, isPositiveNumber);

    expect(predicate(-10)).toBe(false);
  });

  test('works with single predicate', () => {
    const predicate = everyPredicate(isString);

    expect(predicate('hello')).toBe(true);
    expect(predicate(42)).toBe(false);
  });

  test('works with multiple predicates', () => {
    const hasLength = (value: unknown): boolean =>
      isNotNil(value) && 'length' in Object(value);
    const isNonEmpty = (value: unknown): boolean =>
      typeof value === 'string' && value.length > 0;
    const predicate = everyPredicate(isString, hasLength, isNonEmpty);

    expect(predicate('test')).toBe(true);
    expect(predicate('')).toBe(false);
    expect(predicate(42)).toBe(false);
  });

  test('works with custom type predicates', () => {
    const isPositive = (value: unknown): value is number =>
      typeof value === 'number' && value > 0;
    const isLessThan100 = (value: unknown): value is number =>
      typeof value === 'number' && value < 100;

    const predicate = everyPredicate(isPositive, isLessThan100);

    expect(predicate(50)).toBe(true);
    expect(predicate(99)).toBe(true);
    expect(predicate(-5)).toBe(false);
    expect(predicate(150)).toBe(false);
  });

  test('returns false for null and undefined when predicates do not match', () => {
    const predicate = everyPredicate(isString, isNumber);

    expect(predicate(null)).toBe(false);
    expect(predicate(undefined)).toBe(false);
  });

  test('throws TypeError when predicates array contains non-function', () => {
    expect(() => everyPredicate(isString, 'not a function' as never)).toThrow(
      TypeError,
    );
    expect(() => everyPredicate(42 as never)).toThrow(TypeError);
    expect(() => everyPredicate(null as never)).toThrow(TypeError);
    expect(() => everyPredicate(isString, undefined as never)).toThrow(
      TypeError,
    );
  });

  test('handles empty predicates array', () => {
    expect(everyPredicate()('foo' as never)).toBe(true);
  });

  test('short-circuits on first failing predicate', () => {
    const alwaysFalse = (): boolean => false;
    const trackCall = vi.fn((): boolean => {
      return true;
    });

    const predicate = everyPredicate(alwaysFalse, trackCall);
    predicate('test');

    expect(trackCall).not.toHaveBeenCalled();
  });
});

describe.concurrent('assertEvery', () => {
  test('does not throw when all predicates match', () => {
    const isPositiveNumber = (value: unknown): value is number =>
      typeof value === 'number' && value > 0;

    expect(
      () => void assertEvery(42, isNumber, isPositiveNumber),
    ).not.toThrow();
    expect(
      () => void assertEvery(10, isNumber, isPositiveNumber),
    ).not.toThrow();
  });

  test('does not throw with custom value name', () => {
    const isPositiveNumber = (value: unknown): value is number =>
      typeof value === 'number' && value > 0;

    expect(
      () => void assertEvery(42, 'count', isNumber, isPositiveNumber),
    ).not.toThrow();
  });

  test('throws TypeError when any predicate does not match', () => {
    const isPositiveNumber = (value: unknown): value is number =>
      typeof value === 'number' && value > 0;

    expect(() => void assertEvery(-5, isNumber, isPositiveNumber)).toThrow(
      TypeError,
    );
    expect(() => void assertEvery('test', isNumber, isPositiveNumber)).toThrow(
      TypeError,
    );
  });

  test('throws TypeError with custom name in error message', () => {
    const isPositiveNumber = (value: unknown): value is number =>
      typeof value === 'number' && value > 0;

    expect(
      () => void assertEvery(-5, 'amount', isNumber, isPositiveNumber),
    ).toThrow(TypeError);
    expect(
      () => void assertEvery(-5, 'amount', isNumber, isPositiveNumber),
    ).toThrow(/amount/);
  });

  test('throws TypeError for null when predicates do not match', () => {
    expect(() => void assertEvery(null, isString, isNumber)).toThrow(TypeError);
  });

  test('throws TypeError for undefined when predicates do not match', () => {
    expect(() => void assertEvery(undefined, isString, isNumber)).toThrow(
      TypeError,
    );
  });

  test('works with single predicate', () => {
    expect(() => void assertEvery('test', isString)).not.toThrow();
    expect(() => void assertEvery(42, isString)).toThrow(TypeError);
  });

  test('works with multiple predicates', () => {
    const hasLength = (value: unknown): boolean =>
      isNotNil(value) && 'length' in Object(value);
    const isNonEmpty = (value: unknown): boolean =>
      typeof value === 'string' && value.length > 0;

    expect(
      () => void assertEvery('test', isString, hasLength, isNonEmpty),
    ).not.toThrow();
    expect(() => void assertEvery('', isString, hasLength, isNonEmpty)).toThrow(
      TypeError,
    );
    expect(() => void assertEvery(42, isString, hasLength, isNonEmpty)).toThrow(
      TypeError,
    );
  });

  test('uses default value name when not provided', () => {
    const isPositiveNumber = (value: unknown): value is number =>
      typeof value === 'number' && value > 0;

    expect(() => void assertEvery(-5, isNumber, isPositiveNumber)).toThrow(
      /value/,
    );
  });

  test('throws TypeError when valueName is not a string', () => {
    expect(() => void assertEvery('test', 42 as never, isString)).toThrow(
      TypeError,
    );
    expect(() => void assertEvery('test', null as never, isString)).toThrow(
      'Expected predicates[0] to be function, got null instea',
    );
    expect(
      () => void assertEvery('test', undefined as never, isString),
    ).toThrow(TypeError);
    expect(() => void assertEvery('test', {} as never, isString)).toThrow(
      TypeError,
    );
  });

  test('throws TypeError when predicates contain non-function', () => {
    expect(
      () =>
        void assertEvery(
          'test',
          isString,
          'not a function' as unknown as Predicate,
        ),
    ).toThrow(TypeError);
    expect(
      () => void assertEvery('test', isString, null as unknown as Predicate),
    ).toThrow('Expected predicates[1] to be function, got null instead');
  });

  test('throws TypeError when predicates contain non-function with custom name', () => {
    expect(
      () =>
        void assertEvery('test', 'param', isString, 42 as unknown as Predicate),
    ).toThrow('Expected predicates[1] to be function, got number instead');
  });

  test('correctly distinguishes between valueName and predicate', () => {
    const alwaysTrue = (): boolean => true;

    expect(() => void assertEvery('test', alwaysTrue, isString)).not.toThrow();
    expect(
      () => void assertEvery('test', 'param', alwaysTrue, isString),
    ).not.toThrow();
    expect(() => void assertEvery(42, alwaysTrue, isString)).toThrow(TypeError);
  });

  test('works with custom type predicates', () => {
    const isPositive = (value: unknown): value is number =>
      typeof value === 'number' && value > 0;
    const isLessThan100 = (value: unknown): value is number =>
      typeof value === 'number' && value < 100;

    expect(() => void assertEvery(50, isPositive, isLessThan100)).not.toThrow();
    expect(() => void assertEvery(-5, isPositive, isLessThan100)).toThrow(
      TypeError,
    );
    expect(() => void assertEvery(150, isPositive, isLessThan100)).toThrow(
      TypeError,
    );
  });

  test('validates all predicates in order', () => {
    const isNonEmptyString = (value: unknown): value is string =>
      typeof value === 'string' && value.length > 0;

    expect(
      () => void assertEvery('hello', isString, isNonEmptyString),
    ).not.toThrow();
    expect(() => void assertEvery('', isString, isNonEmptyString)).toThrow(
      TypeError,
    );
  });
});

describe.concurrent('anyOf', () => {
  describe('positive cases', () => {
    test('returns true when value matches one of the provided values', () => {
      const isColor = anyOf('red', 'green', 'blue');

      expect(isColor('red')).toBe(true);
      expect(isColor('green')).toBe(true);
      expect(isColor('blue')).toBe(true);
    });

    test('works with numbers', () => {
      const isValidCode = anyOf(200, 201, 204);

      expect(isValidCode(200)).toBe(true);
      expect(isValidCode(201)).toBe(true);
      expect(isValidCode(204)).toBe(true);
      expect(isValidCode(404)).toBe(false);
    });

    test('works with mixed types', () => {
      const isValid = anyOf('error', 404, null);

      expect(isValid('error')).toBe(true);
      expect(isValid(404)).toBe(true);
      expect(isValid(null)).toBe(true);
      expect(isValid('success')).toBe(false);
    });

    test('works with boolean values', () => {
      const isTruthy = anyOf(true);

      expect(isTruthy(true)).toBe(true);
      expect(isTruthy(false)).toBe(false);
    });

    test('works with objects using SameValueZero equality', () => {
      const obj1 = { id: 1 };
      const obj2 = { id: 2 };
      const isKnownObject = anyOf(obj1, obj2);

      expect(isKnownObject(obj1)).toBe(true);
      expect(isKnownObject(obj2)).toBe(true);
      expect(isKnownObject({ id: 1 })).toBe(false);
    });

    test('handles NaN using SameValueZero equality', () => {
      const includesNaN = anyOf(NaN, 0);

      expect(includesNaN(NaN)).toBe(true);
      expect(includesNaN(0)).toBe(true);
      expect(includesNaN(1)).toBe(false);
    });

    test('handles -0 and +0 as equal', () => {
      const includesZero = anyOf(0);

      expect(includesZero(0)).toBe(true);
      // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-conversion
      expect(includesZero(+0)).toBe(true);
      expect(includesZero(-0)).toBe(true);
    });

    test('works with symbols', () => {
      const sym1 = Symbol('test');
      const sym2 = Symbol('test');
      const isKnownSymbol = anyOf(sym1, sym2);

      expect(isKnownSymbol(sym1)).toBe(true);
      expect(isKnownSymbol(sym2)).toBe(true);
      expect(isKnownSymbol(Symbol('test'))).toBe(false);
    });

    test('works with undefined', () => {
      const isNullish = anyOf(null, undefined);

      expect(isNullish(null)).toBe(true);
      expect(isNullish(undefined)).toBe(true);
      expect(isNullish('')).toBe(false);
    });
  });

  describe('negative cases', () => {
    test('returns false when value does not match any provided values', () => {
      const isColor = anyOf('red', 'green', 'blue');

      expect(isColor('yellow')).toBe(false);
      expect(isColor('purple')).toBe(false);
      expect(isColor(null)).toBe(false);
      expect(isColor(undefined)).toBe(false);
    });

    test('returns false for similar but not equal values', () => {
      const isExactNumber = anyOf(42);

      expect(isExactNumber('42')).toBe(false);
      expect(isExactNumber(42.0)).toBe(true);
      expect(isExactNumber(42.1)).toBe(false);
    });
  });

  describe('edge cases', () => {
    test('works with single value', () => {
      const isAdmin = anyOf('admin');

      expect(isAdmin('admin')).toBe(true);
      expect(isAdmin('user')).toBe(false);
    });

    test('works with empty values array', () => {
      const neverMatches = anyOf();

      expect(neverMatches('anything')).toBe(false);
      expect(neverMatches(null)).toBe(false);
      expect(neverMatches(undefined)).toBe(false);
    });

    test('works with duplicate values', () => {
      const isDuplicate = anyOf('a', 'a', 'b');

      expect(isDuplicate('a')).toBe(true);
      expect(isDuplicate('b')).toBe(true);
      expect(isDuplicate('c')).toBe(false);
    });
  });
});

describe.concurrent('assertAnyOf', () => {
  describe('positive cases', () => {
    test('does not throw when value matches one of the provided values', () => {
      expect(
        () => void assertAnyOf(['red', 'green', 'blue'], 'red'),
      ).not.toThrow();
      expect(
        () => void assertAnyOf(['red', 'green', 'blue'], 'green'),
      ).not.toThrow();
      expect(
        () => void assertAnyOf(['red', 'green', 'blue'], 'blue'),
      ).not.toThrow();
    });

    test('does not throw with custom value name', () => {
      expect(
        () => void assertAnyOf(['red', 'green', 'blue'], 'red', 'color'),
      ).not.toThrow();
    });

    test('works with numbers', () => {
      expect(() => void assertAnyOf([200, 201, 204], 200)).not.toThrow();
      expect(() => void assertAnyOf([200, 201, 204], 201)).not.toThrow();
    });

    test('works with mixed types', () => {
      expect(
        () => void assertAnyOf(['error', 404, null], 'error'),
      ).not.toThrow();
      expect(() => void assertAnyOf(['error', 404, null], 404)).not.toThrow();
      expect(() => void assertAnyOf(['error', 404, null], null)).not.toThrow();
    });

    test('works with objects using SameValueZero equality', () => {
      const obj1 = { id: 1 };
      const obj2 = { id: 2 };

      expect(() => void assertAnyOf([obj1, obj2], obj1)).not.toThrow();
      expect(() => void assertAnyOf([obj1, obj2], obj2)).not.toThrow();
    });

    test('handles NaN using SameValueZero equality', () => {
      expect(() => void assertAnyOf([NaN, 0], NaN)).not.toThrow();
      expect(() => void assertAnyOf([NaN, 0], 0)).not.toThrow();
    });

    test('handles -0 and +0 as equal', () => {
      expect(() => void assertAnyOf([0], 0)).not.toThrow();
      expect(() => void assertAnyOf([0], -0)).not.toThrow();
      expect(() => void assertAnyOf([-0], 0)).not.toThrow();
    });
  });

  describe('negative cases', () => {
    test('throws TypeError when value does not match any provided values', () => {
      expect(
        () => void assertAnyOf(['red', 'green', 'blue'], 'yellow'),
      ).toThrow(TypeError);
      expect(() => void assertAnyOf([200, 201, 204], 404)).toThrow(
        'Expected value to be any of: 200, 201, or 204, got 404 instead.',
      );
    });

    test('throws TypeError with custom name in error message', () => {
      expect(
        () => void assertAnyOf(['red', 'green', 'blue'], 'yellow', 'color'),
      ).toThrow(TypeError);
      expect(
        () => void assertAnyOf(['red', 'green', 'blue'], 'yellow', 'color'),
      ).toThrow(/color/);
    });

    test('throws for similar but not equal values', () => {
      expect(() => void assertAnyOf([42], '42')).toThrow(TypeError);
      expect(() => void assertAnyOf([42], 42.1)).toThrow(TypeError);
    });

    test('throws for objects with same structure but different reference', () => {
      const obj1 = { id: 1 };

      expect(() => void assertAnyOf([obj1], { id: 1 })).toThrow(TypeError);
    });

    test('uses default value name when not provided', () => {
      expect(() => void assertAnyOf(['red', 'green'], 'yellow')).toThrow(
        /value/,
      );
      expect(
        () => void assertAnyOf(['red', 'green'], 'yellow', undefined),
      ).toThrow(/value/);
    });
  });

  describe('edge cases', () => {
    test('throws TypeError when values is not iterable', () => {
      expect(() => void assertAnyOf(null as never, 'test')).toThrow(TypeError);
      expect(() => void assertAnyOf(undefined as never, 'test')).toThrow(
        'Expected values to be non-nullable, got undefined instead',
      );
      expect(() => void assertAnyOf(42 as never, 'test')).toThrow(
        'Expected values[Symbol(Symbol.iterator)] to exist',
      );
      expect(() => void assertAnyOf({} as never, 'test')).toThrow(TypeError);
    });

    test('throws TypeError when valueName is not a string', () => {
      expect(() => void assertAnyOf(['a', 'b'], 'a', 42 as never)).toThrow(
        TypeError,
      );
      expect(() => void assertAnyOf(['a', 'b'], 'a', null as never)).toThrow(
        'Expected valueName to be string, got null instead',
      );
    });

    test('works with empty values iterable', () => {
      expect(() => void assertAnyOf([], 'anything')).toThrow(TypeError);
    });

    test('works with Set as values iterable', () => {
      const validValues = new Set(['red', 'green', 'blue']);

      expect(() => void assertAnyOf(validValues, 'red')).not.toThrow();
      expect(() => void assertAnyOf(validValues, 'yellow')).toThrow(TypeError);
    });

    test('works with generators as values iterable', () => {
      function* colors(): Generator<string> {
        yield 'red';
        yield 'green';
        yield 'blue';
      }

      expect(() => void assertAnyOf(colors(), 'red')).not.toThrow();
      expect(() => void assertAnyOf(colors(), 'yellow')).toThrow(TypeError);
      expect(() => void assertAnyOf(colors(), 'yellow')).toThrow(
        'Expected value to be any of: "red", "green", or "blue", got "yellow" instead.',
      );
    });

    test('error message includes all possible values', () => {
      expect(
        () => void assertAnyOf(['red', 'green', 'blue'], 'yellow'),
      ).toThrow(/red.*green.*blue/);
    });

    test('error message includes received value', () => {
      expect(() => void assertAnyOf(['red', 'green'], 'yellow')).toThrow(
        /yellow/,
      );
    });
  });
});

describe.concurrent('isTuple', () => {
  describe('positive cases', () => {
    test('returns true for a matching single-element tuple', () => {
      const isStrTuple = isTuple(isString);

      expect(isStrTuple(['hello'])).toBe(true);
    });

    test('returns true for a matching multi-element tuple', () => {
      const isPoint = isTuple(isNumber, isNumber);

      expect(isPoint([1, 2])).toBe(true);
    });

    test('returns true for a mixed-type tuple', () => {
      const isPair = isTuple(isString, isNumber);

      expect(isPair(['hello', 42])).toBe(true);
    });

    test('returns true for an empty tuple', () => {
      const isEmpty = isTuple();

      expect(isEmpty([])).toBe(true);
    });
  });

  describe('negative cases', () => {
    test('returns false when an element fails its predicate', () => {
      const isPoint = isTuple(isNumber, isNumber);

      expect(isPoint([1, 'x'])).toBe(false);
      expect(isPoint(['x', 1])).toBe(false);
    });

    test('returns false when array is too short', () => {
      const isPoint = isTuple(isNumber, isNumber);

      expect(isPoint([1])).toBe(false);
      expect(isPoint([])).toBe(false);
    });

    test('returns false when array is too long', () => {
      const isPoint = isTuple(isNumber, isNumber);

      expect(isPoint([1, 2, 3])).toBe(false);
    });

    test('returns false for non-array values', () => {
      const isPair = isTuple(isString, isNumber);

      expect(isPair(null)).toBe(false);
      expect(isPair(undefined)).toBe(false);
      expect(isPair({})).toBe(false);
      expect(isPair('hello')).toBe(false);
      expect(isPair(42)).toBe(false);
    });

    test('returns false for non-empty array when no predicates given', () => {
      const isEmpty = isTuple();

      expect(isEmpty([1])).toBe(false);
      expect(isEmpty(['anything'])).toBe(false);
    });
  });

  describe('error cases', () => {
    test('throws TypeError when predicates contain non-function values', () => {
      expect(() => isTuple(isString, 42 as never)).toThrow(TypeError);
      expect(() => isTuple(null as never)).toThrow(TypeError);
      expect(() => isTuple(isString, undefined as never)).toThrow(TypeError);
    });
  });
});

describe.concurrent('assertTuple', () => {
  describe('positive cases', () => {
    test('does not throw for a valid single-element tuple', () => {
      expect(() => void assertTuple(['hello'], isString)).not.toThrow();
    });

    test('does not throw for a valid multi-element tuple', () => {
      expect(() => void assertTuple([1, 2], isNumber, isNumber)).not.toThrow();
    });

    test('does not throw for a valid mixed-type tuple', () => {
      expect(
        () => void assertTuple(['hello', 42], isString, isNumber),
      ).not.toThrow();
    });

    test('does not throw for an empty tuple w/o predicates', () => {
      expect(() => void assertTuple([])).not.toThrow();
    });

    test('does not throw with a custom value name', () => {
      expect(
        () => void assertTuple([1, 2], 'point', isNumber, isNumber),
      ).not.toThrow();
    });
  });

  describe('negative cases', () => {
    test('throws TypeError when an element fails its predicate', () => {
      expect(() => void assertTuple([1, 'x'], isNumber, isNumber)).toThrowError(
        new TypeError(
          'Expected value to be a tuple [number,number], got [1,"x"] instead',
        ),
      );
      expect(() => void assertTuple(['x', 1], isNumber, isNumber)).toThrow(
        TypeError,
      );
    });

    test('throws TypeError when array is too short', () => {
      expect(() => void assertTuple([1], isNumber, isNumber)).toThrowError(
        new TypeError(
          'Expected value to be a tuple [number,number], got [1] instead',
        ),
      );
      expect(() => void assertTuple([], isNumber, isNumber)).toThrow(TypeError);
    });

    test('throws TypeError when array is too long', () => {
      expect(() => void assertTuple([1, 2, 3], isNumber, isNumber)).toThrow(
        TypeError,
      );
    });

    test('throws TypeError for non-array values', () => {
      expect(() => void assertTuple(null, isString)).toThrowError(
        new TypeError(
          'Expected value to be a tuple [string], got null instead',
        ),
      );
      expect(() => void assertTuple(undefined, isString)).toThrow(TypeError);
      expect(() => void assertTuple({}, isString)).toThrow(TypeError);
      expect(() => void assertTuple('hello', isString)).toThrow(TypeError);
      expect(() => void assertTuple(42, isNumber)).toThrow(TypeError);
    });

    test('throws TypeError with custom name in error message', () => {
      expect(
        () => void assertTuple([1, 'x'], 'point', isNumber, isNumber),
      ).toThrowError(
        new TypeError(
          'Expected point to be a tuple [number,number], got [1,"x"] instead',
        ),
      );
      expect(
        () => void assertTuple([1, 'x'], 'point', isNumber, isNumber),
      ).toThrow(/point/);
    });

    test('uses default value name when not provided', () => {
      expect(() => void assertTuple('bad', isString)).toThrow(/value/);
    });
  });

  describe('error cases', () => {
    test('throws TypeError when predicates contain non-function values', () => {
      expect(() => void assertTuple(['hello'], isString, 42 as never)).toThrow(
        TypeError,
      );
      expect(() => void assertTuple(['hello'], null as never)).toThrow(
        TypeError,
      );
    });

    test('throws TypeError when predicates contain non-function values with custom name', () => {
      expect(
        () => void assertTuple(['hello'], 'myVal', isString, 42 as never),
      ).toThrow(TypeError);
    });
  });
});
