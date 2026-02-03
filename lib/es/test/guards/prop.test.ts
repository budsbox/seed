import { describe, expect, test, vi } from 'vitest';

import {
  assertProp,
  describeTypePredicate,
  hasProp,
  isFunction,
  isNumber,
  isObject,
  isString,
} from '#guards';

/* eslint-disable @typescript-eslint/consistent-type-assertions */

describe.concurrent('hasProp', () => {
  describe('basic property checks with string keys', () => {
    test('returns true when property exists on object', () => {
      const obj = { foo: 'bar' };
      expect(hasProp(obj, 'foo')).toBe(true);
    });

    test('returns false when property does not exist on object', () => {
      const obj = { foo: 'bar' };
      expect(hasProp(obj, 'baz')).toBe(false);
    });

    test('returns false for nullable values', () => {
      expect(hasProp(null, 'foo')).toBe(false);
      expect(hasProp(undefined, 'foo')).toBe(false);
    });

    test('returns true for property with falsy values', () => {
      const obj = {
        empty: '',
        falseBool: false,
        null: null,
        undefined: undefined,
        zero: 0,
      };
      expect(hasProp(obj, 'zero')).toBe(true);
      expect(hasProp(obj, 'empty')).toBe(true);
      expect(hasProp(obj, 'falseBool')).toBe(true);
      expect(hasProp(obj, 'null')).toBe(true);
      expect(hasProp(obj, 'undefined')).toBe(true);
    });
  });

  describe('property checks with symbol keys', () => {
    test('returns true when symbol property exists', () => {
      const sym = Symbol('test');
      const obj = { [sym]: 'value' };
      expect(hasProp(obj, sym)).toBe(true);
    });

    test('returns false when symbol property does not exist', () => {
      const sym1 = Symbol('test1');
      const sym2 = Symbol('test2');
      const obj = { [sym1]: 'value' };
      expect(hasProp(obj, sym2)).toBe(false);
    });
  });

  describe('property checks with number keys', () => {
    test('returns true when numeric property exists on array', () => {
      const arr = ['a', 'b', 'c'];
      expect(hasProp(arr, 0)).toBe(true);
      expect(hasProp(arr, 2)).toBe(true);
    });

    test('returns false when numeric property does not exist on array', () => {
      const arr = ['a', 'b'];
      expect(hasProp(arr, 5)).toBe(false);
    });

    test('returns true when numeric property exists on object', () => {
      const obj = { 0: 'zero', 1: 'one' };
      expect(hasProp(obj, 0)).toBe(true);
      expect(hasProp(obj, 1)).toBe(true);
    });

    test('returns false when numeric property does not exist on object', () => {
      const obj = { 0: 'zero' };
      expect(hasProp(obj, 1)).toBe(false);
    });
  });

  describe('hasProp with checkProto flag', () => {
    test('returns false for prototype properties when checkProto is false', () => {
      const obj = { __proto__: { inherited: 'value' } };
      expect(hasProp(obj, 'inherited', false)).toBe(false);
    });

    test('returns true for prototype properties when checkProto is true', () => {
      const obj = { __proto__: { inherited: 'value' } };
      expect(hasProp(obj, 'inherited', true)).toBe(true);
    });

    test('returns true for own properties regardless of checkProto value', () => {
      const obj = { own: 'value' };
      expect(hasProp(obj, 'own')).toBe(true);
      expect(hasProp(obj, 'own', false)).toBe(true);
      expect(hasProp(obj, 'own', true)).toBe(true);
    });

    test('returns true for built-in prototype methods when checkProto is true', () => {
      const obj = {};
      expect(hasProp(obj, 'toString', true)).toBe(true);
      expect(hasProp(obj, 'hasOwnProperty', true)).toBe(true);
    });

    test('returns false for prototype properties and true for own properties when checkProto is false or omitted', () => {
      const obj = { __proto__: { inherited: 'value' } };
      expect(hasProp(obj, 'toString', false)).toBe(false);
      expect(hasProp(obj, 'hasOwnProperty', false)).toBe(false);
      expect(hasProp(obj, 'inherited')).toBe(false);
    });
  });

  describe('hasProp with type guard', () => {
    test('returns true when property exists and passes type guard', () => {
      const obj = { name: 'John', age: 30 };
      expect(hasProp(obj, 'name', isString)).toBe(true);
      expect(hasProp(obj, 'age', isNumber)).toBe(true);
    });

    test('returns false when property exists but fails type guard', () => {
      const obj = { name: 'John', age: 30 };
      expect(hasProp(obj, 'name', isNumber)).toBe(false);
      expect(hasProp(obj, 'age', isString)).toBe(false);
    });

    test('returns false when property does not exist', () => {
      const obj = { name: 'John' };
      expect(hasProp(obj, 'age', isNumber)).toBe(false);
    });

    test('works with custom type guards', () => {
      const isPositive = (value: unknown): value is number =>
        isNumber(value) && value > 0;
      describeTypePredicate(isPositive, 'positive number');

      const obj = { a: 5, b: -3, c: 0 };
      expect(hasProp(obj, 'a', isPositive)).toBe(true);
      expect(hasProp(obj, 'b', isPositive)).toBe(false);
      expect(hasProp(obj, 'c', isPositive)).toBe(false);
    });

    test('type guard is not called when property does not exist', () => {
      const testGuard = vi.fn((value: unknown): value is string =>
        isString(value),
      );

      const obj = { name: 'John' };
      hasProp(obj, 'missing', testGuard);

      expect(testGuard).not.toHaveBeenCalled();
    });

    test('type guard is called when property exists', () => {
      const testGuard = vi.fn((value: unknown): value is string =>
        isString(value),
      );

      const obj = { name: 'John' };
      hasProp(obj, 'name', testGuard);

      expect(testGuard).toHaveBeenCalledOnce();
      expect(testGuard).toHaveBeenCalledWith('John');
    });
  });

  describe('hasProp with type guard and checkProto', () => {
    test('returns true when inherited property passes type guard and checkProto is true', () => {
      const obj = { __proto__: { inherited: 'value' } };
      expect(hasProp(obj, 'inherited', isString, true)).toBe(true);
    });

    test('returns false when inherited property fails type guard even when checkProto is true', () => {
      const obj = { __proto__: { inherited: 'value' } };
      expect(hasProp(obj, 'inherited', isNumber, true)).toBe(false);
    });

    test('returns false when inherited property passes type guard but checkProto is false', () => {
      const obj = { __proto__: { inherited: 'value' } };
      expect(hasProp(obj, 'inherited', isString, false)).toBe(false);
    });

    test('returns true when own property passes type guard regardless of checkProto', () => {
      const obj = { own: 'value' };
      expect(hasProp(obj, 'own', isString, false)).toBe(true);
      expect(hasProp(obj, 'own', isString, true)).toBe(true);
    });
  });

  describe('hasProp with plain predicate', () => {
    test('returns true when property exists and passes predicate', () => {
      const obj = { name: 'John', age: 30 };
      const isLongString = (value: unknown): boolean =>
        isString(value) && value.length > 3;

      expect(hasProp(obj, 'name', isLongString)).toBe(true);
    });

    test('returns false when property exists but fails predicate', () => {
      const obj = { name: 'Jo', age: 30 };
      const isLongString = (value: unknown): boolean =>
        isString(value) && value.length > 3;

      expect(hasProp(obj, 'name', isLongString)).toBe(false);
    });

    test('works with complex predicates', () => {
      const obj = { items: [1, 2, 3], empty: [] };
      const hasItems = (value: unknown): boolean =>
        Array.isArray(value) && value.length > 0;

      expect(hasProp(obj, 'items', hasItems)).toBe(true);
      expect(hasProp(obj, 'empty', hasItems)).toBe(false);
    });

    test('predicate is called with correct property value', () => {
      const obj = { name: 'John', age: 30 };
      const predicate = vi.fn((value: unknown): boolean => isString(value));

      hasProp(obj, 'name', predicate);

      expect(predicate).toHaveBeenCalledOnce();
      expect(predicate).toHaveBeenCalledWith('John');
    });

    test('predicate is not called when property does not exist', () => {
      const obj = { name: 'John' };
      const predicate = vi.fn((value: unknown): boolean => isString(value));

      hasProp(obj, 'missing', predicate);

      expect(predicate).not.toHaveBeenCalled();
    });
  });

  describe('hasProp with protected keys (__proto__, constructor)', () => {
    test('returns false for __proto__ key', () => {
      const obj = { __proto__: { malicious: 'value' } };
      expect(hasProp(obj, '__proto__')).toBe(false);
      expect(hasProp(obj, '__proto__', isObject)).toBe(false);
      expect(hasProp(obj, '__proto__', true)).toBe(false);
      expect(hasProp(obj, '__proto__', isObject, true)).toBe(false);
    });

    test('returns false for constructor key', () => {
      const obj = { constructor: 'value' };
      expect(hasProp(obj, 'constructor')).toBe(false);
      expect(hasProp(obj, 'constructor', isString)).toBe(false);
      expect(hasProp(obj, 'constructor', true)).toBe(false);
      expect(hasProp(obj, 'constructor', isString, true)).toBe(false);
    });

    test('type guard is not called for protected keys', () => {
      const obj = { __proto__: { malicious: 'value' }, constructor: 'value' };
      const testGuard = vi.fn((value: unknown): value is string =>
        isString(value),
      );

      hasProp(obj, '__proto__', testGuard);
      hasProp(obj, 'constructor', testGuard);

      expect(testGuard).not.toHaveBeenCalled();
    });
  });

  describe('error cases', () => {
    test('throws TypeError when key is not a valid property key', () => {
      const obj = { name: 'John' };
      expect(() => hasProp(obj, {} as never)).toThrow(TypeError);
      expect(() => hasProp(obj, [] as never)).toThrow(TypeError);
      expect(() => hasProp(obj, null as never)).toThrow(TypeError);
    });

    test('throws TypeError when checkProto is not a boolean ', () => {
      const obj = { name: 'John' };
      expect(() => hasProp(obj, 'name', 'invalid' as never)).toThrow(TypeError);
      expect(() => hasProp(obj, 'name', 123 as never)).toThrow(TypeError);
      expect(() => hasProp(obj, 'name', null as never)).toThrow(TypeError);
      expect(() => hasProp(obj, 'name', isString, 'invalid' as never)).toThrow(
        TypeError,
      );
      expect(() => hasProp(obj, 'name', isString, 123 as never)).toThrow(
        TypeError,
      );
    });

    test('throws TypeError when test function returns non-boolean', () => {
      const obj = { name: 'John' };
      const invalidGuard = (): string => 'not a boolean';

      expect(() => hasProp(obj, 'name', invalidGuard as never)).toThrow(
        TypeError,
      );
    });
  });

  describe('edge cases', () => {
    test('works with objects that have no prototype', () => {
      const obj = Object.create(null) as { prop?: string };
      obj.prop = 'value';
      expect(hasProp(obj, 'prop')).toBe(true);
      expect(hasProp(obj, 'missing')).toBe(false);
    });

    test('works with primitive values', () => {
      expect(hasProp('string', 'length')).toBe(true);
      expect(hasProp(123, 'toString', true)).toBe(true);
    });

    test('works with arrays', () => {
      const arr = [1, 2, 3];
      expect(hasProp(arr, 'length')).toBe(true);
      expect(hasProp(arr, 'push', true)).toBe(true);
      expect(hasProp(arr, 'push', false)).toBe(false);
    });

    test('works with functions', () => {
      const fn = (): void => {};
      fn.customProp = 'value';
      expect(hasProp(fn, 'customProp')).toBe(true);
      expect(hasProp(fn, 'name')).toBe(true);
    });

    test('handles Symbol.iterator', () => {
      const arr = [1, 2, 3];
      expect(hasProp(arr, Symbol.iterator, isFunction, true)).toBe(true);
    });
  });
});

// ... existing code ...

describe.concurrent('assertProp', () => {
  describe('basic property assertions with string keys', () => {
    test('does not throw when property exists on object', () => {
      const obj = { foo: 'bar' };
      expect(() => void assertProp(obj, 'foo')).not.toThrow();
    });

    test('throws when property does not exist on object', () => {
      const obj = { foo: 'bar' };
      expect(() => assertProp(obj, 'baz' as never)).toThrow(TypeError);
    });

    test('throws for nullable values', () => {
      expect(() => assertProp(null, 'foo')).toThrow(TypeError);
      expect(() => assertProp(undefined, 'foo')).toThrow(TypeError);
    });

    test('does not throw for property with falsy values', () => {
      const obj = {
        empty: '',
        falseBool: false,
        null: null,
        undefined: undefined,
        zero: 0,
      };
      expect(() => void assertProp(obj, 'zero')).not.toThrow();
      expect(() => void assertProp(obj, 'empty')).not.toThrow();
      expect(() => void assertProp(obj, 'falseBool')).not.toThrow();
      expect(() => void assertProp(obj, 'null')).not.toThrow();
      expect(() => void assertProp(obj, 'undefined')).not.toThrow();
    });
  });

  describe('property assertions with symbol keys', () => {
    test('does not throw when symbol property exists', () => {
      const sym = Symbol('test');
      const obj = { [sym]: 'value' };
      expect(() => void assertProp(obj, sym)).not.toThrow();
    });

    test('throws when symbol property does not exist', () => {
      const sym1 = Symbol('test1');
      const sym2 = Symbol('test2');
      const obj = { [sym1]: 'value' };
      expect(() => assertProp(obj, sym2 as never)).toThrow(TypeError);
    });
  });

  describe('property assertions with number keys', () => {
    test('does not throw when numeric property exists on array', () => {
      const arr = ['a', 'b', 'c'];
      expect(() => void assertProp(arr, 0)).not.toThrow();
      expect(() => void assertProp(arr, 2)).not.toThrow();
    });

    test('throws when numeric property does not exist on array', () => {
      const arr = ['a', 'b'];
      expect(() => void assertProp(arr, 5)).toThrow(TypeError);
    });

    test('does not throw when numeric property exists on object', () => {
      const obj = { 0: 'zero', 1: 'one' };
      expect(() => void assertProp(obj, 0)).not.toThrow();
      expect(() => void assertProp(obj, 1)).not.toThrow();
    });

    test('throws when numeric property does not exist on object', () => {
      const obj = { 0: 'zero' };
      expect(() => assertProp(obj, 1 as never)).toThrow(TypeError);
    });
  });

  describe('assertProp with checkProto flag', () => {
    test('throws for inherited properties when checkProto is false', () => {
      const obj = { __proto__: { inherited: 'value' } } as unknown as {
        inherited: 'value';
      };
      expect(() => void assertProp(obj, 'inherited', false)).toThrow(TypeError);
    });

    test('does not throw for inherited properties when checkProto is true', () => {
      const obj = { __proto__: { inherited: 'value' } } as unknown as {
        inherited: 'value';
      };
      expect(() => void assertProp(obj, 'inherited', true)).not.toThrow();
    });

    test('does not throw for own properties regardless of checkProto value', () => {
      const obj = { own: 'value' };
      expect(() => void assertProp(obj, 'own')).not.toThrow();
      expect(() => void assertProp(obj, 'own', false)).not.toThrow();
      expect(() => void assertProp(obj, 'own', true)).not.toThrow();
    });

    test('does not throw for built-in prototype methods when checkProto is true', () => {
      const obj = {};
      expect(() => void assertProp(obj, 'toString', true)).not.toThrow();
      expect(() => void assertProp(obj, 'hasOwnProperty', true)).not.toThrow();
    });

    test('throws for prototype properties when checkProto is false or omitted', () => {
      const obj = { __proto__: { inherited: 'value' } };
      expect(() => assertProp(obj, 'toString' as never, false)).toThrow(
        TypeError,
      );
      expect(() => assertProp(obj, 'hasOwnProperty' as never, false)).toThrow(
        TypeError,
      );
      expect(() => assertProp(obj, 'inherited' as never)).toThrow(TypeError);
    });
  });

  describe('assertProp with type guard', () => {
    test('does not throw when property exists and passes type guard', () => {
      const obj = { name: 'John', age: 30 };
      expect(() => void assertProp(obj, 'name', isString)).not.toThrow();
      expect(() => void assertProp(obj, 'age', isNumber)).not.toThrow();
    });

    test('throws when property exists but fails type guard', () => {
      const obj = { name: 'John', age: 30 };
      expect(() => void assertProp(obj, 'name', isNumber)).toThrow(TypeError);
      expect(() => void assertProp(obj, 'age', isString)).toThrow(TypeError);
    });

    test('throws when property does not exist', () => {
      const obj = { name: 'John' };
      expect(() => assertProp(obj, 'age' as never, isNumber)).toThrow(
        TypeError,
      );
    });

    test('works with custom type guards', () => {
      const isPositive = (value: unknown): value is number =>
        isNumber(value) && value > 0;
      describeTypePredicate(isPositive, 'positive number');

      const obj = { a: 5, b: -3, c: 0 };
      expect(() => void assertProp(obj, 'a', isPositive)).not.toThrow();
      expect(() => void assertProp(obj, 'b', isPositive)).toThrow(TypeError);
      expect(() => void assertProp(obj, 'c', isPositive)).toThrow(TypeError);
    });

    test('type guard is not called when property does not exist', () => {
      const testGuard = vi.fn((value: unknown): value is string =>
        isString(value),
      );

      const obj = { name: 'John' };
      try {
        assertProp(obj, 'missing' as never, testGuard);
      } catch {
        // Expected to throw
      }

      expect(testGuard).not.toHaveBeenCalled();
    });

    test('type guard is called when property exists', () => {
      const testGuard = vi.fn((value: unknown): value is string =>
        isString(value),
      );

      const obj = { name: 'John' };
      assertProp(obj, 'name', testGuard);

      expect(testGuard).toHaveBeenCalledOnce();
      expect(testGuard).toHaveBeenCalledWith('John');
    });
  });

  describe('assertProp with type guard and checkProto', () => {
    test('does not throw when inherited property passes type guard and checkProto is true', () => {
      const obj = { __proto__: { inherited: 'value' } } as unknown as {
        inherited: 'value';
      };
      expect(
        () => void assertProp(obj, 'inherited', isString, true),
      ).not.toThrow();
    });

    test('throws when inherited property fails type guard even when checkProto is true', () => {
      const obj = { __proto__: { inherited: 'value' } } as unknown as {
        inherited: 'value';
      };
      expect(() => void assertProp(obj, 'inherited', isNumber, true)).toThrow(
        TypeError,
      );
    });

    test('throws when inherited property passes type guard but checkProto is false', () => {
      const obj = { __proto__: { inherited: 'value' } } as unknown as {
        inherited: 'value';
      };
      expect(() => void assertProp(obj, 'inherited', isString, false)).toThrow(
        TypeError,
      );
    });

    test('does not throw when own property passes type guard regardless of checkProto', () => {
      const obj = { own: 'value' };
      expect(() => void assertProp(obj, 'own', isString, false)).not.toThrow();
      expect(() => void assertProp(obj, 'own', isString, true)).not.toThrow();
    });
  });

  describe('assertProp with plain predicate', () => {
    test('does not throw when property exists and passes predicate', () => {
      const obj = { name: 'John', age: 30 };
      const isLongString = (value: unknown): boolean =>
        isString(value) && value.length > 3;

      expect(() => void assertProp(obj, 'name', isLongString)).not.toThrow();
    });

    test('throws when property exists but fails predicate', () => {
      const obj = { name: 'Jo', age: 30 };
      const isLongString = (value: unknown): boolean =>
        isString(value) && value.length > 3;

      expect(() => void assertProp(obj, 'name', isLongString)).toThrow(
        TypeError,
      );
    });

    test('works with complex predicates', () => {
      const obj = { items: [1, 2, 3], empty: [] };
      const hasItems = (value: unknown): boolean =>
        Array.isArray(value) && value.length > 0;

      expect(() => void assertProp(obj, 'items', hasItems)).not.toThrow();
      expect(() => void assertProp(obj, 'empty', hasItems)).toThrow(TypeError);
    });

    test('predicate is called with correct property value', () => {
      const obj = { name: 'John', age: 30 };
      const predicate = vi.fn((value: unknown): boolean => isString(value));

      assertProp(obj, 'name', predicate);

      expect(predicate).toHaveBeenCalledOnce();
      expect(predicate).toHaveBeenCalledWith('John');
    });

    test('predicate is not called when property does not exist', () => {
      const obj = { name: 'John' };
      const predicate = vi.fn((value: unknown): boolean => isString(value));

      try {
        assertProp(obj, 'missing' as never, predicate);
      } catch {
        // Expected to throw
      }

      expect(predicate).not.toHaveBeenCalled();
    });
  });

  describe('assertProp with protected keys (__proto__, constructor)', () => {
    test('throws for __proto__ key', () => {
      const obj = { __proto__: { malicious: 'value' } };
      expect(() => assertProp(obj, '__proto__')).toThrow(TypeError);
      expect(() => assertProp(obj, '__proto__', isObject)).toThrow(TypeError);
      expect(() => assertProp(obj, '__proto__', true)).toThrow(TypeError);
      expect(() => assertProp(obj, '__proto__', isObject, true)).toThrow(
        TypeError,
      );
    });

    test('throws for constructor key', () => {
      const obj = { constructor: 'value' };
      expect(() => assertProp(obj, 'constructor')).toThrow(TypeError);
      expect(() => assertProp(obj, 'constructor', isString)).toThrow(TypeError);
      expect(() => assertProp(obj, 'constructor', true)).toThrow(TypeError);
      expect(() => assertProp(obj, 'constructor', isString, true)).toThrow(
        TypeError,
      );
    });

    test('type guard is not called for protected keys', () => {
      const obj = { __proto__: { malicious: 'value' }, constructor: 'value' };
      const testGuard = vi.fn((value: unknown): value is string =>
        isString(value),
      );

      try {
        assertProp(obj, '__proto__', testGuard);
      } catch {
        // Expected
      }

      try {
        assertProp(obj, 'constructor', testGuard);
      } catch {
        // Expected
      }

      expect(testGuard).not.toHaveBeenCalled();
    });
  });

  describe('assertProp with sourceName parameter', () => {
    test('includes sourceName in error message for non-existent property', () => {
      const obj = { foo: 'bar' };
      expect(() => assertProp(obj, 'baz' as never, 'config')).toThrow(
        /config.*baz/,
      );
    });

    test('includes sourceName in error message for nil source', () => {
      expect(() => assertProp(null, 'foo', 'user')).toThrow(/user/);
    });

    test('includes sourceName in error message for type guard failure', () => {
      const obj = { name: 'John' };
      expect(() => void assertProp(obj, 'name', isNumber, 'data')).toThrow(
        /data.name/,
      );
    });

    test('includes sourceName in error message for predicate failure', () => {
      const obj = { name: 'Jo' };
      const isLongString = (value: unknown): boolean =>
        isString(value) && value.length > 3;
      expect(
        () => void assertProp(obj, 'name', isLongString, 'profile'),
      ).toThrow(/profile.name/);
    });

    test('uses default sourceName when not provided', () => {
      const obj = { foo: 'bar' };
      expect(() => assertProp(obj, 'baz' as never)).toThrow(/source/);
    });
  });

  describe('assertProp with checkProto and sourceName', () => {
    test('throws with correct message when inherited property missing and checkProto is true', () => {
      const obj = { foo: 'bar' };
      expect(() => assertProp(obj, 'baz' as never, true, 'settings')).toThrow(
        /settings/,
      );
    });

    test('throws with correct message when inherited property missing and checkProto is false', () => {
      const obj = { foo: 'bar' };
      expect(() => assertProp(obj, 'baz' as never, false, 'config')).toThrow(
        /config/,
      );
    });

    test('does not throw when inherited property exists with checkProto true and sourceName provided', () => {
      const obj = { __proto__: { inherited: 'value' } } as unknown as {
        inherited: 'value';
      };
      expect(
        () => void assertProp(obj, 'inherited', true, 'data'),
      ).not.toThrow();
    });
  });

  describe('assertProp with type guard, checkProto, and sourceName', () => {
    test('includes all parameters in error message for type guard failure', () => {
      const obj = { __proto__: { inherited: 'value' } } as unknown as {
        inherited: 'value';
      };
      expect(
        () => void assertProp(obj, 'inherited', isNumber, true, 'config'),
      ).toThrow(/config.inherited/);
    });

    test('does not throw when type guard succeeds with all parameters', () => {
      const obj = { __proto__: { inherited: 'value' } } as unknown as {
        inherited: 'value';
      };
      expect(
        () => void assertProp(obj, 'inherited', isString, true, 'data'),
      ).not.toThrow();
    });
  });

  describe('assertProp with predicate, checkProto, and sourceName', () => {
    test('includes all parameters in error message for predicate failure', () => {
      const obj = { __proto__: { inherited: 'hello' } } as unknown as {
        inherited: 'value';
      };
      const isLongString = (value: unknown): boolean =>
        isString(value) && value.length > 10;
      expect(
        () => void assertProp(obj, 'inherited', isLongString, true, 'metadata'),
      ).toThrow(/metadata.inherited/);
    });

    test('does not throw when predicate succeeds with all parameters', () => {
      const obj = { __proto__: { inherited: 'hello world' } } as unknown as {
        inherited: string;
      };
      const isLongString = (value: unknown): boolean =>
        isString(value) && value.length > 5;
      expect(
        () => void assertProp(obj, 'inherited', isLongString, true, 'metadata'),
      ).not.toThrow();
    });
  });

  describe('error cases', () => {
    test('throws TypeError when key is not a valid property key', () => {
      const obj = { name: 'John' };
      expect(() => assertProp(obj, {} as never)).toThrow(TypeError);
      expect(() => assertProp(obj, [] as never)).toThrow(TypeError);
      expect(() => assertProp(obj, null as never)).toThrow(TypeError);
    });

    test('throws TypeError when third argument is not string, boolean or predicate', () => {
      const obj = { name: 'John' };
      expect(() => void assertProp(obj, 'name', 123 as never)).toThrow(
        TypeError,
      );
      expect(() => void assertProp(obj, 'name', null as never)).toThrow(
        TypeError,
      );
      expect(
        () => void assertProp(obj, 'name', isString, 123 as never),
      ).toThrow(TypeError);
    });

    test('throws TypeError when test function returns non-boolean', () => {
      const obj = { name: 'John' };
      const invalidGuard = (): string => 'not a boolean';

      expect(() => void assertProp(obj, 'name', invalidGuard as never)).toThrow(
        TypeError,
      );
    });

    test('throws TypeError when source is nil', () => {
      expect(() => assertProp(null, 'prop')).toThrow(TypeError);
      expect(() => assertProp(undefined, 'prop')).toThrow(TypeError);
    });
  });

  describe('edge cases', () => {
    test('works with objects that have no prototype', () => {
      const obj = Object.create(null) as { prop?: string };
      obj.prop = 'value';
      expect(() => void assertProp(obj, 'prop')).not.toThrow();
      expect(() => assertProp(obj, 'missing' as never)).toThrow();
    });

    test('works with primitive values', () => {
      expect(() => void assertProp('string', 'length')).not.toThrow();
      expect(() => void assertProp(123, 'toString', true)).not.toThrow();
    });

    test('works with arrays', () => {
      const arr = [1, 2, 3];
      expect(() => void assertProp(arr, 'length')).not.toThrow();
      expect(() => void assertProp(arr, 'push', true)).not.toThrow();
      expect(() => void assertProp(arr, 'push', false)).toThrow();
    });

    test('works with functions', () => {
      const fn = (): void => {};
      fn.customProp = 'value';
      expect(() => void assertProp(fn, 'customProp')).not.toThrow();
      expect(() => assertProp(fn, 'name' as never)).not.toThrow();
    });

    test('handles Symbol.iterator', () => {
      const arr = [1, 2, 3];
      expect(
        () => void assertProp(arr, Symbol.iterator, isFunction, true),
      ).not.toThrow();
    });
  });

  describe('assertProp integration with hasProp', () => {
    test('assertProp throws when hasProp returns false', () => {
      const obj = { foo: 'bar' };
      if (hasProp(obj, 'baz')) {
        assertProp(obj, 'baz');
      } else {
        expect(() => assertProp(obj, 'baz' as never)).toThrow();
      }
    });

    test('assertProp does not throw when hasProp returns true', () => {
      const obj = { foo: 'bar' };
      if (hasProp(obj, 'foo')) {
        expect(() => void assertProp(obj, 'foo')).not.toThrow();
      }
    });

    test('assertProp and hasProp are consistent with type guards', () => {
      const obj = { name: 'John', age: 30 };
      if (hasProp(obj, 'name', isString)) {
        expect(() => void assertProp(obj, 'name', isString)).not.toThrow();
      }
      if (!hasProp(obj, 'age', isString)) {
        expect(() => void assertProp(obj, 'age', isString)).toThrow();
      }
    });
  });
});
