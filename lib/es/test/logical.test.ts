import type { Predicate } from '@budsbox/lib-types';

import { describe, expect, test, vi } from 'vitest';

import { fif, fifs, sure } from '#logical';

describe.concurrent('fif', () => {
  test('returns onTrue value when test passes', () => {
    const result = fif(10, (n: number) => n > 5, 'Greater');
    expect(result).toBe('Greater');
  });

  test('returns onFalse value when test fails', () => {
    const result = fif(3, (n: number) => n > 5, 'Greater', 'Smaller');
    expect(result).toBe('Smaller');
  });

  test('executes onTrue function when test passes', () => {
    const result = fif(
      10,
      (n: number) => n > 5,
      (n) => `${String(n)} is greater`,
    );
    expect(result).toBe('10 is greater');
  });

  test('executes onFalse function when test fails', () => {
    const result = fif(
      3,
      (n: number) => n > 5,
      (n) => `${String(n)} greater`,
      (n) => `${String(n)} below`,
    );
    expect(result).toBe('3 below');
  });

  test('returns undefined when test fails and onFalse is not provided', () => {
    const result = fif(3, (n: number) => n > 5, 'Greater');
    expect(result).toBe(undefined);
  });

  test('onTrue function receives tested value', () => {
    const trueFn = vi.fn((n: number) => n * 2);
    const falseFn = vi.fn((n: number) => n * 3);
    fif(10, (n: number) => n > 5, trueFn);
    expect(trueFn).toHaveBeenCalled();
    expect(falseFn).not.toHaveBeenCalled();
    expect(trueFn).toHaveBeenCalledWith(10);
  });

  test('onFalse function receives tested value', () => {
    const trueFn = vi.fn((n: number) => n * 3);
    const falseFn = vi.fn((n: number) => n * 2);
    fif(3, (n: number) => n > 5, 'result', falseFn);
    expect(falseFn).toHaveBeenCalled();
    expect(trueFn).not.toHaveBeenCalled();
    expect(falseFn).toHaveBeenCalledWith(3);
  });

  test('throws TypeError when test is not a function', () => {
    expect(() => fif(10, 'not a function' as never, 'value')).toThrowError(
      TypeError,
    );
  });

  test('throws TypeError when test does not return boolean', () => {
    const badTest = (() => 'not boolean') as never as Predicate;
    expect(() => fif(10, badTest, 'value')).toThrowError(TypeError);
  });

  test('works with null values', () => {
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    const result = fif(null, (v) => v === null, 'is null', 'not null');
    expect(result).toBe('is null');
  });

  test('works with undefined values', () => {
    const result = fif(
      undefined,
      // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
      (v) => v === undefined,
      'is undefined',
      'not undefined',
    );
    expect(result).toBe('is undefined');
  });
});

describe.concurrent('fifs', () => {
  test('returns onTrue value when condition is true', () => {
    const result = fifs(true, 'truthy');
    expect(result).toBe('truthy');
  });

  test('returns onFalse value when condition is false', () => {
    const result = fifs(false, 'truthy', 'falsy');
    expect(result).toBe('falsy');
  });

  test('executes onTrue function when condition is true', () => {
    const result = fifs(true, () => 'computed true');
    expect(result).toBe('computed true');
  });

  test('executes onFalse function when condition is false', () => {
    const result = fifs(
      false,
      () => 'computed true',
      () => 'computed false',
    );
    expect(result).toBe('computed false');
  });

  test('returns undefined when condition is false and onFalse is not provided', () => {
    const result = fifs(false, 'truthy');
    expect(result).toBe(undefined);
  });

  test('onTrue function is called when condition is true', () => {
    const fn = vi.fn(() => 'result');
    fifs(true, fn);
    expect(fn).toHaveBeenCalled();
  });

  test('onFalse function is called when condition is false', () => {
    const fn = vi.fn(() => 'result');
    fifs(false, 'other', fn);
    expect(fn).toHaveBeenCalled();
  });

  test('onTrue function is not called when condition is false', () => {
    const fn = vi.fn(() => 'result');
    fifs(false, fn, 'fallback');
    expect(fn).not.toHaveBeenCalled();
  });

  test('onFalse function is not called when condition is true', () => {
    const fn = vi.fn(() => 'result');
    fifs(true, 'primary', fn);
    expect(fn).not.toHaveBeenCalled();
  });

  test('works with complex expressions as condition', () => {
    const value = 10;
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    const result = fifs(value > 5 && value < 15, 'in range', 'out of range');
    expect(result).toBe('in range');
  });
});

describe.concurrent('sure', () => {
  test('returns onTrue value when value is not nil', () => {
    const result = sure('test', 'not nil');
    expect(result).toBe('not nil');
  });

  test('returns onFalse value when value is null', () => {
    const result = sure(null, 'not nil', 'is nil');
    expect(result).toBe('is nil');
  });

  test('returns onFalse value when value is undefined', () => {
    const result = sure(undefined, 'not nil', 'is nil');
    expect(result).toBe('is nil');
  });

  test('executes onTrue function when value is not nil', () => {
    const result = sure(42, (n) => `Value is ${String(n)}`);
    expect(result).toBe('Value is 42');
  });

  test('executes onFalse function when value is null', () => {
    const result = sure(
      null,
      // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
      (v) => `Has ${v}`,
      () => 'No value',
    );
    expect(result).toBe('No value');
  });

  test('executes onFalse function when value is undefined', () => {
    const result = sure(
      undefined,
      // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
      (v) => `Has ${v}`,
      () => 'No value',
    );
    expect(result).toBe('No value');
  });

  test('returns undefined when value is nil and onFalse is not provided', () => {
    const result = sure(null, 'not nil');
    expect(result).toBe(undefined);
  });

  test('works with falsy but non-nil values', () => {
    const result1 = sure(0, 'not nil', 'is nil');
    expect(result1).toBe('not nil');

    const result2 = sure('', 'not nil', 'is nil');
    expect(result2).toBe('not nil');

    const result3 = sure(false, 'not nil', 'is nil');
    expect(result3).toBe('not nil');
  });

  test('onTrue function receives non-nil value', () => {
    const fn = vi.fn((v: number) => v * 2);
    sure(10, fn);
    expect(fn).toHaveBeenCalled();
    expect(fn).toHaveBeenCalledWith(10);
  });

  test('onFalse function is called when value is nil', () => {
    const fn = vi.fn(() => 'fallback');
    sure(null, 'primary', fn);
    expect(fn).toHaveBeenCalled();
  });

  test('onTrue function is not called when value is nil', () => {
    const fn = vi.fn(() => 'result');
    sure(null, fn, 'fallback');
    expect(fn).not.toHaveBeenCalled();
  });

  test('works with objects', () => {
    const obj = { key: 'value' };
    const result = sure(obj, (o) => o.key, 'no object');
    expect(result).toBe('value');
  });

  test('works with arrays', () => {
    const arr = [1, 2, 3];
    const result = sure(arr, (a) => a.length, 0);
    expect(result).toBe(3);
  });
});
