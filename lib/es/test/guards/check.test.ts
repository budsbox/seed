import { describe, expect, test } from 'vitest';

import {
  getPredicateDescriptor,
  isArray,
  isBigint,
  isBoolean,
  isDef,
  isFalse,
  isFalsy,
  isFunction,
  isNil,
  isNotNil,
  isNumber,
  isObject,
  isPrimitive,
  isPropKey,
  isString,
  isSymbol,
  isTrue,
  isTruly,
  isUndef,
} from '#guards';

describe.concurrent('isUndef', () => {
  test('returns true for undefined', () => {
    expect(isUndef(undefined)).toBe(true);
  });

  test('returns false for null', () => {
    expect(isUndef(null)).toBe(false);
  });

  test('returns false for other values', () => {
    expect(isUndef(0)).toBe(false);
    expect(isUndef('')).toBe(false);
    expect(isUndef(false)).toBe(false);
    expect(isUndef({})).toBe(false);
  });

  test('has correct descriptor', () => {
    const descriptor = getPredicateDescriptor(isUndef);
    expect(descriptor).toStrictEqual({ type: 'undefined' });
  });
});

describe.concurrent('isDef', () => {
  test('returns false for undefined', () => {
    expect(isDef(undefined)).toBe(false);
  });

  test('returns true for null', () => {
    expect(isDef(null)).toBe(true);
  });

  test('returns true for other values', () => {
    expect(isDef(0)).toBe(true);
    expect(isDef('')).toBe(true);
    expect(isDef(false)).toBe(true);
    expect(isDef({})).toBe(true);
  });

  test('has correct descriptor', () => {
    const descriptor = getPredicateDescriptor(isDef);
    expect(descriptor).toStrictEqual({ type: 'not undefined' });
  });
});

describe.concurrent('isNil', () => {
  test('returns true for null', () => {
    expect(isNil(null)).toBe(true);
  });

  test('returns true for undefined', () => {
    expect(isNil(undefined)).toBe(true);
  });

  test('returns false for other values', () => {
    expect(isNil(0)).toBe(false);
    expect(isNil('')).toBe(false);
    expect(isNil(false)).toBe(false);
    expect(isNil({})).toBe(false);
  });

  test('has correct descriptor', () => {
    const descriptor = getPredicateDescriptor(isNil);
    expect(descriptor).toStrictEqual({ type: 'null or undefined' });
  });
});

describe.concurrent('isNotNil', () => {
  test('returns false for null', () => {
    expect(isNotNil(null)).toBe(false);
  });

  test('returns false for undefined', () => {
    expect(isNotNil(undefined)).toBe(false);
  });

  test('returns true for other values', () => {
    expect(isNotNil(0)).toBe(true);
    expect(isNotNil('')).toBe(true);
    expect(isNotNil(false)).toBe(true);
    expect(isNotNil({})).toBe(true);
  });

  test('has correct descriptor', () => {
    const descriptor = getPredicateDescriptor(isNotNil);
    expect(descriptor).toStrictEqual({ type: 'non-nullable' });
  });
});

describe.concurrent('isTrue', () => {
  test('returns true for true', () => {
    expect(isTrue(true)).toBe(true);
  });

  test('returns false for false', () => {
    expect(isTrue(false)).toBe(false);
  });

  test('returns false for truthy values', () => {
    expect(isTrue(1)).toBe(false);
    expect(isTrue('true')).toBe(false);
    expect(isTrue({})).toBe(false);
  });

  test('has correct descriptor', () => {
    const descriptor = getPredicateDescriptor(isTrue);
    expect(descriptor).toStrictEqual({ type: 'true' });
  });
});

describe.concurrent('isFalse', () => {
  test('returns true for false', () => {
    expect(isFalse(false)).toBe(true);
  });

  test('returns false for true', () => {
    expect(isFalse(true)).toBe(false);
  });

  test('returns false for falsy values', () => {
    expect(isFalse(0)).toBe(false);
    expect(isFalse('')).toBe(false);
    expect(isFalse(null)).toBe(false);
    expect(isFalse(undefined)).toBe(false);
  });

  test('has correct descriptor', () => {
    const descriptor = getPredicateDescriptor(isFalse);
    expect(descriptor).toStrictEqual({ type: 'false' });
  });
});

describe.concurrent('isString', () => {
  test('returns true for strings', () => {
    expect(isString('')).toBe(true);
    expect(isString('hello')).toBe(true);
  });

  test('returns false for non-strings', () => {
    expect(isString(123)).toBe(false);
    expect(isString(true)).toBe(false);
    expect(isString(null)).toBe(false);
    expect(isString(undefined)).toBe(false);
    expect(isString({})).toBe(false);
    expect(isString([])).toBe(false);
  });

  test('has correct descriptor', () => {
    const descriptor = getPredicateDescriptor(isString);
    expect(descriptor).toStrictEqual({ type: 'string' });
  });
});

describe.concurrent('isNumber', () => {
  test('returns true for valid numbers', () => {
    expect(isNumber(0)).toBe(true);
    expect(isNumber(123)).toBe(true);
    expect(isNumber(-456)).toBe(true);
    expect(isNumber(3.14)).toBe(true);
    expect(isNumber(Infinity)).toBe(true);
    expect(isNumber(-Infinity)).toBe(true);
  });

  test('returns false for NaN', () => {
    expect(isNumber(NaN)).toBe(false);
  });

  test('returns false for non-numbers', () => {
    expect(isNumber('123')).toBe(false);
    expect(isNumber(true)).toBe(false);
    expect(isNumber(null)).toBe(false);
    expect(isNumber(undefined)).toBe(false);
    expect(isNumber({})).toBe(false);
  });

  test('has correct descriptor', () => {
    const descriptor = getPredicateDescriptor(isNumber);
    expect(descriptor).toStrictEqual({ type: 'number' });
  });
});

describe.concurrent('isBigint', () => {
  test('returns true for bigints', () => {
    expect(isBigint(0n)).toBe(true);
    expect(isBigint(123n)).toBe(true);
    expect(isBigint(-456n)).toBe(true);
  });

  test('returns false for non-bigints', () => {
    expect(isBigint(123)).toBe(false);
    expect(isBigint('123')).toBe(false);
    expect(isBigint(true)).toBe(false);
    expect(isBigint(null)).toBe(false);
    expect(isBigint(undefined)).toBe(false);
  });

  test('has correct descriptor', () => {
    const descriptor = getPredicateDescriptor(isBigint);
    expect(descriptor).toStrictEqual({ type: 'bigint' });
  });
});

describe.concurrent('isBoolean', () => {
  test('returns true for booleans', () => {
    expect(isBoolean(true)).toBe(true);
    expect(isBoolean(false)).toBe(true);
  });

  test('returns false for non-booleans', () => {
    expect(isBoolean(1)).toBe(false);
    expect(isBoolean(0)).toBe(false);
    expect(isBoolean('true')).toBe(false);
    expect(isBoolean(null)).toBe(false);
    expect(isBoolean(undefined)).toBe(false);
  });

  test('has correct descriptor', () => {
    const descriptor = getPredicateDescriptor(isBoolean);
    expect(descriptor).toStrictEqual({ type: 'boolean' });
  });
});

describe.concurrent('isSymbol', () => {
  test('returns true for symbols', () => {
    expect(isSymbol(Symbol('test'))).toBe(true);
    expect(isSymbol(Symbol.for('test'))).toBe(true);
  });

  test('returns false for non-symbols', () => {
    expect(isSymbol('symbol')).toBe(false);
    expect(isSymbol(123)).toBe(false);
    expect(isSymbol(null)).toBe(false);
    expect(isSymbol(undefined)).toBe(false);
    expect(isSymbol({})).toBe(false);
  });

  test('has correct descriptor', () => {
    const descriptor = getPredicateDescriptor(isSymbol);
    expect(descriptor).toStrictEqual({ type: 'symbol' });
  });
});

describe.concurrent('isPropKey', () => {
  test('returns true for strings', () => {
    expect(isPropKey('key')).toBe(true);
    expect(isPropKey('')).toBe(true);
  });

  test('returns true for symbols', () => {
    expect(isPropKey(Symbol('key'))).toBe(true);
  });

  test('returns true for numbers', () => {
    expect(isPropKey(0)).toBe(true);
    expect(isPropKey(123)).toBe(true);
  });

  test('returns false for other types', () => {
    expect(isPropKey(true)).toBe(false);
    expect(isPropKey(null)).toBe(false);
    expect(isPropKey(undefined)).toBe(false);
    expect(isPropKey({})).toBe(false);
    expect(isPropKey(123n)).toBe(false);
    expect(isPropKey(NaN)).toBe(false);
  });

  test('has correct descriptor', () => {
    const descriptor = getPredicateDescriptor(isPropKey);
    expect(descriptor).toStrictEqual({
      type: 'valid property key (i.e., string, symbol, or number)',
    });
  });
});

describe.concurrent('isPrimitive', () => {
  test('returns true for primitives', () => {
    expect(isPrimitive(null)).toBe(true);
    expect(isPrimitive(undefined)).toBe(true);
    expect(isPrimitive(true)).toBe(true);
    expect(isPrimitive(false)).toBe(true);
    expect(isPrimitive('string')).toBe(true);
    expect(isPrimitive(123)).toBe(true);
    expect(isPrimitive(NaN)).toBe(true);
    expect(isPrimitive(Symbol('sym'))).toBe(true);
    expect(isPrimitive(123n)).toBe(true);
  });

  test('returns false for non-primitives', () => {
    expect(isPrimitive({})).toBe(false);
    expect(isPrimitive([])).toBe(false);
    expect(isPrimitive(() => {})).toBe(false);
    expect(isPrimitive(new Date())).toBe(false);
  });
});

describe.concurrent('isTruly', () => {
  test('returns true for truthy values', () => {
    expect(isTruly(true)).toBe(true);
    expect(isTruly(1)).toBe(true);
    expect(isTruly('hello')).toBe(true);
    expect(isTruly({})).toBe(true);
    expect(isTruly([])).toBe(true);
    expect(isTruly(Infinity)).toBe(true);
  });

  test('returns false for falsy values', () => {
    expect(isTruly(false)).toBe(false);
    expect(isTruly(0)).toBe(false);
    expect(isTruly('')).toBe(false);
    expect(isTruly(null)).toBe(false);
    expect(isTruly(undefined)).toBe(false);
    expect(isTruly(NaN)).toBe(false);
  });

  test('has correct descriptor', () => {
    const descriptor = getPredicateDescriptor(isTruly);
    expect(descriptor).toStrictEqual({
      condition: 'to evaluates to true when coerced to a boolean',
    });
  });
});

describe.concurrent('isFalsy', () => {
  test('returns true for falsy values', () => {
    expect(isFalsy(false)).toBe(true);
    expect(isFalsy(0)).toBe(true);
    expect(isFalsy('')).toBe(true);
    expect(isFalsy(null)).toBe(true);
    expect(isFalsy(undefined)).toBe(true);
    expect(isFalsy(NaN)).toBe(true);
  });

  test('returns false for truthy values', () => {
    expect(isFalsy(true)).toBe(false);
    expect(isFalsy(1)).toBe(false);
    expect(isFalsy('hello')).toBe(false);
    expect(isFalsy({})).toBe(false);
    expect(isFalsy([])).toBe(false);
  });

  test('has correct descriptor', () => {
    const descriptor = getPredicateDescriptor(isFalsy);
    expect(descriptor).toStrictEqual({
      condition: 'to evaluates to false when coerced to a boolean',
    });
  });
});

describe.concurrent('isObject', () => {
  test('returns true for objects', () => {
    expect(isObject({})).toBe(true);
    expect(isObject([])).toBe(true);
    expect(isObject(new Date())).toBe(true);
    expect(isObject(/regex/)).toBe(true);
  });

  test('returns false for null', () => {
    expect(isObject(null)).toBe(false);
  });

  test('returns false for primitives', () => {
    expect(isObject(undefined)).toBe(false);
    expect(isObject(123)).toBe(false);
    expect(isObject('string')).toBe(false);
    expect(isObject(true)).toBe(false);
    expect(isObject(Symbol('sym'))).toBe(false);
    expect(isObject(123n)).toBe(false);
  });

  test('has correct descriptor', () => {
    const descriptor = getPredicateDescriptor(isObject);
    expect(descriptor).toStrictEqual({ type: 'object' });
  });
});

describe.concurrent('isArray', () => {
  test('returns true for arrays', () => {
    expect(isArray([])).toBe(true);
    expect(isArray([1, 2, 3])).toBe(true);
    expect(isArray(new Array(5))).toBe(true);
  });

  test('returns false for non-arrays', () => {
    expect(isArray({})).toBe(false);
    expect(isArray('array')).toBe(false);
    expect(isArray(123)).toBe(false);
    expect(isArray(null)).toBe(false);
    expect(isArray(undefined)).toBe(false);
  });

  test('returns false for array-like objects', () => {
    expect(isArray({ length: 0 })).toBe(false);
    expect(isArray({ 0: 'a', 1: 'b', length: 2 })).toBe(false);
  });

  test('has correct descriptor', () => {
    const descriptor = getPredicateDescriptor(isArray);
    expect(descriptor).toStrictEqual({ type: 'array' });
  });
});

describe.concurrent('isFunction', () => {
  test('returns true for functions', () => {
    expect(isFunction(() => {})).toBe(true);
    expect(isFunction(function () {})).toBe(true);
    expect(isFunction(async () => {})).toBe(true);
    expect(isFunction(function* () {})).toBe(true);
    // eslint-disable-next-line @typescript-eslint/no-extraneous-class
    expect(isFunction(class {})).toBe(true);
  });

  test('returns false for non-functions', () => {
    expect(isFunction({})).toBe(false);
    expect(isFunction([])).toBe(false);
    expect(isFunction('function')).toBe(false);
    expect(isFunction(123)).toBe(false);
    expect(isFunction(null)).toBe(false);
    expect(isFunction(undefined)).toBe(false);
  });

  test('has correct descriptor', () => {
    const descriptor = getPredicateDescriptor(isFunction);
    expect(descriptor).toStrictEqual({ type: 'function' });
  });
});
