import { describe, expect, test } from 'vitest';

import {
  describePredicate,
  describeTypePredicate,
  getPredicateDescriptor,
} from '#guards/describe';

describe.concurrent('describeTypePredicate', () => {
  test('should attach type description to type guard function', () => {
    const typeGuard = (value: unknown): value is string =>
      typeof value === 'string';
    const described = describeTypePredicate(typeGuard, 'string');

    expect(described).toBe(typeGuard);
    const descriptor = getPredicateDescriptor(described);
    expect(descriptor).toStrictEqual({ type: 'string' });
  });

  test('should work with arrow function type guards', () => {
    const isNumber = (value: unknown): value is number =>
      typeof value === 'number';
    const described = describeTypePredicate(isNumber, 'number');

    expect(described).toBe(isNumber);
    const descriptor = getPredicateDescriptor(described);
    expect(descriptor).toStrictEqual({ type: 'number' });
  });

  test('should work with function declaration type guards', () => {
    function isBoolean(value: unknown): value is boolean {
      return typeof value === 'boolean';
    }
    const described = describeTypePredicate(isBoolean, 'boolean');

    expect(described).toBe(isBoolean);
    const descriptor = getPredicateDescriptor(described);
    expect(descriptor).toStrictEqual({ type: 'boolean' });
  });

  test('should accept empty string as description', () => {
    const typeGuard = (value: unknown): value is string =>
      typeof value === 'string';
    const described = describeTypePredicate(typeGuard, '');

    expect(described).toBe(typeGuard);
    const descriptor = getPredicateDescriptor(described);
    expect(descriptor).toStrictEqual({ type: '' });
  });

  test('should preserve function behavior', () => {
    const typeGuard = (value: unknown): value is string =>
      typeof value === 'string';
    const described = describeTypePredicate(typeGuard, 'string');

    expect(described('test')).toBe(true);
    expect(described(123)).toBe(false);
    expect(described(null)).toBe(false);
  });

  test('should allow overwriting description', () => {
    const typeGuard = (value: unknown): value is string =>
      typeof value === 'string';
    const first = describeTypePredicate(typeGuard, 'first');
    const second = describeTypePredicate(first, 'second');

    expect(second).toBe(typeGuard);
    const descriptor = getPredicateDescriptor(second);
    expect(descriptor).toStrictEqual({ type: 'second' });
  });
});

describe.concurrent('describePredicate', () => {
  test('should attach condition description to predicate function', () => {
    const predicate = (value: number): boolean => value > 0;
    const described = describePredicate(predicate, 'to be positive');

    expect(described).toBe(predicate);
    const descriptor = getPredicateDescriptor(described);
    expect(descriptor).toStrictEqual({ condition: 'to be positive' });
  });

  test('should work with arrow function predicates', () => {
    const isEven = (n: number): boolean => n % 2 === 0;
    const described = describePredicate(isEven, 'to be even');

    expect(described).toBe(isEven);
    const descriptor = getPredicateDescriptor(described);
    expect(descriptor).toStrictEqual({ condition: 'to be even' });
  });

  test('should work with function declaration predicates', () => {
    function isPositive(n: number): boolean {
      return n > 0;
    }
    const described = describePredicate(isPositive, 'to be positive');

    expect(described).toBe(isPositive);
    const descriptor = getPredicateDescriptor(described);
    expect(descriptor).toStrictEqual({ condition: 'to be positive' });
  });

  test('should accept empty string as description', () => {
    const predicate = (value: number): boolean => value > 0;
    const described = describePredicate(predicate, '');

    expect(described).toBe(predicate);
    const descriptor = getPredicateDescriptor(described);
    expect(descriptor).toStrictEqual({ condition: '' });
  });

  test('should preserve function behavior', () => {
    const predicate = (value: number): boolean => value > 0;
    const described = describePredicate(predicate, 'to be positive');

    expect(described(5)).toBe(true);
    expect(described(-1)).toBe(false);
    expect(described(0)).toBe(false);
  });

  test('should allow overwriting description', () => {
    const predicate = (value: number): boolean => value > 0;
    const first = describePredicate(predicate, 'first condition');
    const second = describePredicate(first, 'second condition');

    expect(second).toBe(predicate);
    const descriptor = getPredicateDescriptor(second);
    expect(descriptor).toStrictEqual({ condition: 'second condition' });
  });
});

describe.concurrent('getPredicateDescriptor', () => {
  test('should return type descriptor from described type guard', () => {
    const typeGuard = (value: unknown): value is string =>
      typeof value === 'string';
    const described = describeTypePredicate(typeGuard, 'string');

    const descriptor = getPredicateDescriptor(described);
    expect(descriptor).toStrictEqual({ type: 'string' });
  });

  test('should return condition descriptor from described predicate', () => {
    const predicate = (value: number): boolean => value > 0;
    const described = describePredicate(predicate, 'to be positive');

    const descriptor = getPredicateDescriptor(described);
    expect(descriptor).toStrictEqual({ condition: 'to be positive' });
  });

  test('should return undefined for non-described function', () => {
    const plainFunction = (value: number): boolean => value > 0;

    const descriptor = getPredicateDescriptor(plainFunction);
    expect(descriptor).toBe(undefined);
  });

  test('should return undefined for function without descriptor property', () => {
    const fn = (): boolean => true;
    expect(getPredicateDescriptor(fn)).toBe(undefined);
  });

  test('should distinguish between type and condition descriptors', () => {
    const typeGuard = (value: unknown): value is string =>
      typeof value === 'string';
    const predicate = (value: number): boolean => value > 0;

    const describedTypeGuard = describeTypePredicate(typeGuard, 'string');
    const describedPredicate = describePredicate(predicate, 'to be positive');

    const typeGuardDescriptor = getPredicateDescriptor(describedTypeGuard);
    const predicateDescriptor = getPredicateDescriptor(describedPredicate);

    expect('type' in typeGuardDescriptor!).toBe(true);
    expect('condition' in typeGuardDescriptor!).toBe(false);
    expect('condition' in predicateDescriptor!).toBe(true);
    expect('type' in predicateDescriptor!).toBe(false);
  });

  test('should handle function with manually set symbol property', () => {
    const fn = (): boolean => true;
    const symbol = Symbol.for('@budsbox/lib-es/guards#predicateDescription');
    Object.defineProperty(fn, symbol, {
      value: { type: 'custom' },
    });

    const descriptor = getPredicateDescriptor(fn);
    expect(descriptor).toStrictEqual({ type: 'custom' });
  });
});
