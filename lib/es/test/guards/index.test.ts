/* eslint-disable @typescript-eslint/no-extraneous-class */
import { describe, expect, test } from 'vitest';

import { assertIterable, isIterable } from '#guards';

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
