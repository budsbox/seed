import { describe, test, expect, vi } from 'vitest';
import { union, intersection, ROSet } from '#set';

describe.concurrent('union', () => {
  test('should compute the union of multiple sets', () => {
    const set1 = new Set([1, 2, 3]);
    const set2 = new Set([3, 4, 5]);
    const set3 = new Set([5, 6]);

    const result = union(set1, set2, set3);

    expect(result).toBeInstanceOf(Set);
    expect(result).toEqual(new Set([1, 2, 3, 4, 5, 6]));
  });

  test('should return an empty set when no sets are provided', () => {
    const result = union();
    expect(result.size).toBe(0);
  });

  test('should handle ROSet instances', () => {
    const set1 = new ROSet([1, 2]);
    const set2 = new Set([2, 3]);
    const result = union(set1, set2);
    expect(result).toEqual(new Set([1, 2, 3]));
  });

  test('maintain the order of appearance', () => {
    const set1 = new Set([1, 2, 3]);
    const set2 = new Set([5, 4, 3]);
    const result = union(set1, set2);
    expect([...result]).toEqual([1, 2, 3, 5, 4]);
  });
});

describe.concurrent('intersection', () => {
  test('should compute the intersection of multiple sets', () => {
    const set1 = new Set([1, 2, 3]);
    const set2 = new Set([2, 3, 4]);
    const set3 = new Set([3, 4, 5]);

    const result = intersection(set1, set2, set3);

    expect(result).toBeInstanceOf(Set);
    expect(result).toEqual(new Set([3]));
  });

  test('should return an empty set if there is no common element', () => {
    const set1 = new Set([1, 2]);
    const set2 = new Set([3, 4]);
    const result = intersection(set1, set2);
    expect(result.size).toBe(0);
  });

  test('should return all elements if all sets are identical', () => {
    const set1 = new Set([1, 2]);
    const set2 = new Set([1, 2]);
    const result = intersection(set1, set2);
    expect(result).toEqual(new Set([1, 2]));
  });

  test('maintain the order of appearance', () => {
    const set1 = new Set([1, 2, 3]);
    const set2 = new Set([5, 4, 3, 2]);
    const result = intersection(set1, set2);
    expect([...result]).toEqual([2, 3]);
  });
});

describe.concurrent('ROSet', () => {
  test('should initialize with values', () => {
    const roSet = new ROSet([1, 2, 3]);
    expect(roSet.size).toBe(3);
    expect(roSet.has(1)).toBe(true);
    expect(roSet.has(4)).toBe(false);
  });

  test('should be iterable', () => {
    const values = [1, 2, 3];
    const roSet = new ROSet(values);
    expect([...roSet]).toEqual(values);
  });

  test('should provide keys, values and entries', () => {
    const roSet = new ROSet(['a', 'b']);
    expect([...roSet.keys()]).toEqual(['a', 'b']);
    expect([...roSet.values()]).toEqual(['a', 'b']);
    expect([...roSet.entries()]).toEqual([
      ['a', 'a'],
      ['b', 'b'],
    ]);
  });

  test('should implement forEach', () => {
    const roSet = new ROSet([10]);
    const callback = vi.fn();
    roSet.forEach(callback);

    expect(callback).toHaveBeenCalledWith(10, 10, roSet);
  });

  test('should implement forEach with thisArg', () => {
    const roSet = new ROSet([1]);
    const context = { multiplier: 2 };
    let result = 0;

    roSet.forEach(function (val) {
      result = val * this.multiplier;
    }, context);

    expect(result).toBe(2);
  });

  test('should return a debug native Set', () => {
    const roSet = new ROSet([1, 2]);
    const debug = roSet.toDebug();

    expect(debug).toBeInstanceOf(Set);
    expect(debug.size).toBe(2);
    expect(Object.prototype.toString.call(debug)).toBe('[object read-only]');
  });

  test('should have the correct toStringTag and constructor name', () => {
    const roSet = new ROSet();
    expect(Object.prototype.toString.call(roSet)).toBe('[object ReadonlySet]');
    expect(ROSet.name).toBe('ReadonlySet');
  });

  test('should handle Nil input', () => {
    const roSet = new ROSet(null);
    expect(roSet.size).toBe(0);
  });
});
