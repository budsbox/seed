import { describe, expect, test } from 'vitest';

import {
  assertArray,
  assertBoolean,
  assertFunction,
  assertIterable,
  assertNotNil,
  assertNumber,
  assertObject,
  assertProp,
  assertPropertyKey,
  assertString,
  invariant,
} from '#asserts';

describe.concurrent('assertions', () => {
  describe('invariant', () => {
    test('should not throw if condition is true', () => {
      expect(() => invariant(true)).not.toThrow();
    });

    test('should throw TypeError if condition is false', () => {
      expect(() => invariant(false)).toThrow(TypeError);
      expect(() => invariant(false)).toThrow('Expected condition to be true');
    });

    test('should throw with custom message', () => {
      expect(() => invariant(false, 'Custom error')).toThrow('Custom error');
    });
  });

  describe('assertNotNil', () => {
    test('should pass for non-nil values', () => {
      expect(() => assertNotNil(0)).not.toThrow();
      expect(() => assertNotNil('')).not.toThrow();
      expect(() => assertNotNil(false)).not.toThrow();
    });

    test('should throw for null or undefined', () => {
      expect(() => assertNotNil(null)).toThrow(TypeError);
      expect(() => assertNotNil(undefined)).toThrow(TypeError);
    });

    test('should include name in error message', () => {
      expect(() => assertNotNil(null, 'testVar')).toThrow(/testVar/u);
    });
  });

  describe('assertString', () => {
    test('should pass for strings', () => {
      expect(() => assertString('hello')).not.toThrow();
      expect(() => assertString('')).not.toThrow();
    });

    test('should throw for non-string values', () => {
      expect(() => assertString(123)).toThrow(TypeError);
      expect(() => assertString(null)).toThrow(TypeError);
      expect(() => assertString({})).toThrow(TypeError);
    });
  });

  describe('assertNumber', () => {
    test('should pass for numbers', () => {
      expect(() => assertNumber(123)).not.toThrow();
      expect(() => assertNumber(0)).not.toThrow();
    });

    test('should throw for non-number values', () => {
      expect(() => assertNumber('123')).toThrow(TypeError);
      expect(() => assertNumber(null)).toThrow(TypeError);
    });

    test('should throw for NaN', () => {
      expect(() => assertNumber(NaN)).toThrow();
    });
  });

  describe('assertPropertyKey', () => {
    test('should pass for string, number, and symbol', () => {
      expect(() => assertPropertyKey('key')).not.toThrow();
      expect(() => assertPropertyKey(123)).not.toThrow();
      expect(() => assertPropertyKey(Symbol('key'))).not.toThrow();
    });

    test('should throw for other types', () => {
      expect(() => assertPropertyKey({})).toThrow(TypeError);
      expect(() => assertPropertyKey(null)).toThrow(TypeError);
    });
  });

  describe('assertBoolean', () => {
    test('should pass for booleans', () => {
      expect(() => assertBoolean(true)).not.toThrow();
      expect(() => assertBoolean(false)).not.toThrow();
    });

    test('should throw for non-boolean values', () => {
      expect(() => assertBoolean(1)).toThrow(TypeError);
      expect(() => assertBoolean('true')).toThrow(TypeError);
    });
  });

  describe('assertObject', () => {
    test('should pass for objects and arrays', () => {
      expect(() => assertObject({})).not.toThrow();
      expect(() => assertObject([])).not.toThrow();
    });

    test('should throw for primitives or null', () => {
      expect(() => assertObject(null)).toThrow(TypeError);
      expect(() => assertObject('obj')).toThrow(TypeError);
    });
  });

  describe('assertArray', () => {
    test('should pass for arrays', () => {
      expect(() => assertArray([])).not.toThrow();
      expect(() => assertArray([1, 2, 3])).not.toThrow();
    });

    test('should throw for non-array values', () => {
      expect(() => assertArray({})).toThrow(TypeError);
      expect(() => assertArray('array')).toThrow(TypeError);
    });
  });

  describe('assertFunction', () => {
    test('should pass for functions', () => {
      expect(() => assertFunction(() => {})).not.toThrow();
      expect(() => assertFunction(function test() {})).not.toThrow();
    });

    test('should throw for non-function values', () => {
      expect(() => assertFunction({})).toThrow(TypeError);
      expect(() => assertFunction(null)).toThrow(TypeError);
    });
  });

  describe('assertIterable', () => {
    test('should pass for iterables', () => {
      expect(() => assertIterable([])).not.toThrow();
      expect(() => assertIterable('str')).not.toThrow();
      expect(() => assertIterable(new Map())).not.toThrow();
    });

    test('should throw for non-iterable values', () => {
      expect(() => assertIterable({})).toThrow(TypeError);
      expect(() => assertIterable(123)).toThrow(); // Strings are iterable, but numbers are not
      expect(() => assertIterable(123)).toThrow(TypeError);
    });
  });

  describe.sequential('assertProp', () => {
    const obj = { a: 1, b: 'str' };

    test('should pass if property exists', () => {
      expect(() => assertProp(obj, 'a')).not.toThrow();
    });

    test('should throw if property is missing', () => {
      expect(() => assertProp(obj, 'c')).toThrow(
        'Expected source to have own property "c"',
      );
    });

    test('should pass with predicate', () => {
      expect(() => assertProp(obj, 'a', (val) => val === 1)).not.toThrow();
    });

    test('should throw with a correct message if predicate fails', () => {
      const isString = (val: unknown): val is string => typeof val === 'string';
      expect(() => assertProp(obj, 'a', isString)).toThrow(
        'Expected source["a"] to be string',
      );
    });

    test('should throw if source is nil', () => {
      expect(() => assertProp(null, 'a')).toThrow(TypeError);
    });

    test('should handle prototype check flag', () => {
      const parent = { p: 1 };
      const child = Object.create(parent);

      expect(() => assertProp(child, 'p', 'parent')).toThrow(
        'Expected parent to have own property "p"',
      );
      expect(() => assertProp(child, 'p', true)).not.toThrow();
    });

    test('should handle custom source name in message', () => {
      expect(() => assertProp(obj, 'x', false, 'myObj')).toThrow(
        'Expected myObj to have own property "x"',
      );
    });

    test('should fails gracefully if arguments are invalid', () => {
      // @ts-expect-error: Invalid arguments test
      expect(() => assertProp(obj, 'a', Symbol())).toThrow(TypeError);
    });
  });
});
