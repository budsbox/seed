import { describe, expect, test } from 'vitest';

import {
  isArray,
  isBigint,
  isBoolean,
  isDate,
  isDef,
  isError,
  isFalse,
  isFalsy,
  isFunction,
  isMap,
  isNil,
  isNotNil,
  isNumber,
  isObject,
  isPrimitive,
  isPropKey,
  isRegExp,
  isSet,
  isString,
  isSymbol,
  isTrue,
  isTruly,
  isUndef,
  isWeakMapLike,
  isWeakSetLike,
} from '#guards/check';
import { getPredicateDescriptor } from '#guards/describe';

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
      type: 'valid property key (string, symbol, or number)',
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

describe.concurrent('isDate', () => {
  test('returns true for Date instances', () => {
    expect(isDate(new Date())).toBe(true);
    expect(isDate(new Date('2024-01-01'))).toBe(true);
    expect(isDate(new Date(0))).toBe(true);
  });

  test('returns false for non-Date objects', () => {
    expect(isDate({})).toBe(false);
    expect(isDate({ toISOString: () => '' })).toBe(false);
    expect(isDate(Date.now())).toBe(false);
    expect(isDate(new Number(123))).toBe(false);
  });

  test('returns false for primitives', () => {
    expect(isDate(123)).toBe(false);
    expect(isDate('2024-01-01')).toBe(false);
    expect(isDate(true)).toBe(false);
    expect(isDate(null)).toBe(false);
    expect(isDate(undefined)).toBe(false);
  });

  test('has correct descriptor', () => {
    const descriptor = getPredicateDescriptor(isDate);
    expect(descriptor).toStrictEqual({ type: 'Date' });
  });
});

describe.concurrent('isRegExp', () => {
  test('returns true for RegExp instances', () => {
    expect(isRegExp(/test/)).toBe(true);
    expect(isRegExp(/test/gi)).toBe(true);
    expect(isRegExp(new RegExp('test'))).toBe(true);
    expect(isRegExp(new RegExp('test', 'i'))).toBe(true);
  });

  test('returns false for non-RegExp objects', () => {
    expect(isRegExp({ source: 'test' })).toBe(false);
    expect(isRegExp({})).toBe(false);
  });

  test('returns false for primitives', () => {
    expect(isRegExp('/test/')).toBe(false);
    expect(isRegExp(123)).toBe(false);
    expect(isRegExp(true)).toBe(false);
    expect(isRegExp(null)).toBe(false);
    expect(isRegExp(undefined)).toBe(false);
  });

  test('has correct descriptor', () => {
    const descriptor = getPredicateDescriptor(isRegExp);
    expect(descriptor).toStrictEqual({ type: 'RegExp' });
  });
});

describe.concurrent('isError', () => {
  test('returns true for Error instances', () => {
    expect(isError(new Error())).toBe(true);
    expect(isError(new Error('message'))).toBe(true);
    expect(isError(new TypeError('type error'))).toBe(true);
    expect(isError(new RangeError('range error'))).toBe(true);
    expect(isError(new SyntaxError('syntax error'))).toBe(true);
    expect(isError(new ReferenceError('reference error'))).toBe(true);
  });

  test('returns false for non-Error objects', () => {
    expect(isError({ message: 'error' })).toBe(false);
    expect(isError({ name: 'Error', message: 'error' })).toBe(false);
    expect(isError({})).toBe(false);
  });

  test('returns false for primitives', () => {
    expect(isError('error')).toBe(false);
    expect(isError(123)).toBe(false);
    expect(isError(true)).toBe(false);
    expect(isError(null)).toBe(false);
    expect(isError(undefined)).toBe(false);
  });

  test('has correct descriptor', () => {
    const descriptor = getPredicateDescriptor(isError);
    expect(descriptor).toStrictEqual({ type: 'Error' });
  });
});

describe.concurrent('isMap', () => {
  test('returns true for Map instances', () => {
    expect(isMap(new Map())).toBe(true);
    expect(isMap(new Map([['key', 'value']]))).toBe(true);
  });

  test('returns false for non-Map objects', () => {
    expect(isMap({})).toBe(false);
    expect(isMap(new WeakMap())).toBe(false);
    expect(isMap(new Set())).toBe(false);
    expect(isMap([['key', 'value']])).toBe(false);
  });

  test('returns false for primitives', () => {
    expect(isMap('map')).toBe(false);
    expect(isMap(123)).toBe(false);
    expect(isMap(true)).toBe(false);
    expect(isMap(null)).toBe(false);
    expect(isMap(undefined)).toBe(false);
  });

  test('has correct descriptor', () => {
    const descriptor = getPredicateDescriptor(isMap);
    expect(descriptor).toStrictEqual({ type: 'Map' });
  });
});

describe.concurrent('isSet', () => {
  test('returns true for Set instances', () => {
    expect(isSet(new Set())).toBe(true);
    expect(isSet(new Set([1, 2, 3]))).toBe(true);
  });

  test('returns false for non-Set objects', () => {
    expect(isSet({})).toBe(false);
    expect(isSet(new WeakSet())).toBe(false);
    expect(isSet(new Map())).toBe(false);
    expect(isSet([1, 2, 3])).toBe(false);
  });

  test('returns false for primitives', () => {
    expect(isSet('set')).toBe(false);
    expect(isSet(123)).toBe(false);
    expect(isSet(true)).toBe(false);
    expect(isSet(null)).toBe(false);
    expect(isSet(undefined)).toBe(false);
  });

  test('has correct descriptor', () => {
    const descriptor = getPredicateDescriptor(isSet);
    expect(descriptor).toStrictEqual({ type: 'Set' });
  });
});

describe.concurrent('isWeakMapLike', () => {
  test('returns true for WeakMap instances', () => {
    expect(isWeakMapLike(new WeakMap())).toBe(true);
  });

  test('returns true for Map instances', () => {
    expect(isWeakMapLike(new Map())).toBe(true);
    expect(isWeakMapLike(new Map([['key', 'value']]))).toBe(true);
  });

  test('returns false for non-WeakMap/Map objects', () => {
    expect(isWeakMapLike({})).toBe(false);
    expect(isWeakMapLike(new WeakSet())).toBe(false);
    expect(isWeakMapLike(new Set())).toBe(false);
    expect(isWeakMapLike([['key', 'value']])).toBe(false);
  });

  test('returns false for primitives', () => {
    expect(isWeakMapLike('weakmap')).toBe(false);
    expect(isWeakMapLike(123)).toBe(false);
    expect(isWeakMapLike(true)).toBe(false);
    expect(isWeakMapLike(null)).toBe(false);
    expect(isWeakMapLike(undefined)).toBe(false);
  });

  test('has correct descriptor', () => {
    const descriptor = getPredicateDescriptor(isWeakMapLike);
    expect(descriptor).toStrictEqual({ type: 'WeakMap or Map' });
  });
});

describe.concurrent('isWeakSetLike', () => {
  test('returns true for WeakSet instances', () => {
    expect(isWeakSetLike(new WeakSet())).toBe(true);
  });

  test('returns true for Set instances', () => {
    expect(isWeakSetLike(new Set())).toBe(true);
    expect(isWeakSetLike(new Set([1, 2, 3]))).toBe(true);
  });

  test('returns false for non-WeakSet/Set objects', () => {
    expect(isWeakSetLike({})).toBe(false);
    expect(isWeakSetLike(new WeakMap())).toBe(false);
    expect(isWeakSetLike(new Map())).toBe(false);
    expect(isWeakSetLike([1, 2, 3])).toBe(false);
  });

  test('returns false for primitives', () => {
    expect(isWeakSetLike('weakset')).toBe(false);
    expect(isWeakSetLike(123)).toBe(false);
    expect(isWeakSetLike(true)).toBe(false);
    expect(isWeakSetLike(null)).toBe(false);
    expect(isWeakSetLike(undefined)).toBe(false);
  });

  test('has correct descriptor', () => {
    const descriptor = getPredicateDescriptor(isWeakSetLike);
    expect(descriptor).toStrictEqual({ type: 'WeakSet or Set' });
  });
});
