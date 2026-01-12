import { describe, expect, test } from 'vitest';
import { ROMap } from '#map';

describe.concurrent('ROMap', () => {
  describe.concurrent('constructor', () => {
    test('should initialize an empty map when no arguments are provided', () => {
      const map = new ROMap();
      expect(map.size).toBe(0);
    });

    test('should initialize an empty map when Nil (null/undefined) is provided', () => {
      const mapNull = new ROMap(null);
      const mapUndefined = new ROMap(undefined);
      expect(mapNull.size).toBe(0);
      expect(mapUndefined.size).toBe(0);
    });

    test('should initialize with provided entries', () => {
      const entries: [string, number][] = [
        ['a', 1],
        ['b', 2],
      ];
      const map = new ROMap(entries);
      expect(map.size).toBe(2);
      expect(map.get('a')).toBe(1);
      expect(map.get('b')).toBe(2);
    });
  });

  describe.concurrent('has', () => {
    test('should return true if key exists', () => {
      const map = new ROMap([['key', 'value']]);
      expect(map.has('key')).toBe(true);
    });

    test('should return false if key does not exist', () => {
      const map = new ROMap([['key', 'value']]);
      expect(map.has('other')).toBe(false);
    });

    test('should handle null/undefined keys correctly', () => {
      const map = new ROMap([
        [null, 'nullValue'],
        [undefined, 'undefValue'],
      ]);
      expect(map.has(null)).toBe(true);
      expect(map.has(undefined)).toBe(true);
      expect(map.has('random')).toBe(false);
    });
  });

  describe.concurrent('get', () => {
    test('should return value for existing key', () => {
      const obj = { id: 1 };
      const map = new ROMap([[1, obj]]);
      expect(map.get(1)).toStrictEqual(obj);
    });

    test('should return undefined for non-existent key', () => {
      const map = new ROMap<string, number>();
      expect(map.get('missing')).toBe(undefined);
    });
  });

  describe.concurrent('forEach', () => {
    test('should iterate over all entries', () => {
      const map = new ROMap([
        ['a', 1],
        ['b', 2],
      ]);
      const result: Record<string, number> = {};

      map.forEach((value, key) => {
        result[key] = value;
      });

      expect(result).toStrictEqual({ a: 1, b: 2 });
    });

    test('should use provided thisArg', () => {
      const map = new ROMap([['a', 1]]);
      const context = { multiplier: 2 };
      let capturedValue = 0;

      map.forEach(function (this: typeof context, value) {
        capturedValue = value * this.multiplier;
      }, context);

      expect(capturedValue).toBe(2);
    });
  });

  describe.concurrent('iterators', () => {
    test('entries() should return all key-value pairs', () => {
      const map = new ROMap([['a', 1]]);
      const entries = Array.from(map.entries());
      expect(entries).toStrictEqual([['a', 1]]);
    });

    test('keys() should return all keys', () => {
      const map = new ROMap([
        ['a', 1],
        ['b', 2],
      ]);
      const keys = Array.from(map.keys());
      expect(keys).toStrictEqual(['a', 'b']);
    });

    test('values() should return all values', () => {
      const map = new ROMap([
        ['a', 1],
        ['b', 2],
      ]);
      const values = Array.from(map.values());
      expect(values).toStrictEqual([1, 2]);
    });

    test('Symbol.iterator should work (for...of support)', () => {
      const map = new ROMap([['a', 1]]);
      const results: [string, number][] = [];
      for (const entry of map) {
        results.push(entry);
      }
      expect(results).toStrictEqual([['a', 1]]);
    });
  });

  describe.concurrent('debug and metadata', () => {
    test('toDebug should return a Map with correct tag', () => {
      const map = new ROMap([['a', 1]]);
      const debugMap = map.toDebug();

      expect(debugMap instanceof Map).toBe(true);
      expect(debugMap.get('a')).toBe(1);
      expect(Object.prototype.toString.call(debugMap)).toBe(
        '[object read-only]',
      );
    });

    test('toStringTag should be ReadonlyMap', () => {
      const map = new ROMap();
      expect(Object.prototype.toString.call(map)).toBe('[object ReadonlyMap]');
    });

    test('constructor name should be ReadonlyMap', () => {
      expect(ROMap.name).toBe('ReadonlyMap');
    });
  });

  describe.concurrent('negative cases and edge cases', () => {
    test('should handle empty iterables in constructor', () => {
      const map = new ROMap([]);
      expect(map.size).toBe(0);
    });

    test('should handle map with object keys', () => {
      const keyObj = { id: 'test' };
      const map = new ROMap([[keyObj, 'value']]);
      expect(map.has({ id: 'test' })).toBe(false); // Reference equality check
      expect(map.has(keyObj)).toBe(true);
      expect(map.get(keyObj)).toBe('value');
    });

    test('should not allow modification (immutability check)', () => {
      const map = new ROMap([['a', 1]]) as any;
      // We expect these to fail/throw if tried because they aren't implemented
      expect(map.set).toBeUndefined();
      expect(map.delete).toBeUndefined();
      expect(map.clear).toBeUndefined();
    });
  });
});
