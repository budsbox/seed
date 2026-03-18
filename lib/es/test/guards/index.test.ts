/* eslint-disable @typescript-eslint/consistent-type-assertions */
import { describe, expect, test } from 'vitest';

import {
  describePredicate,
  describeTypePredicate,
  formatError,
  formatPredicateExpectedMessage,
  getPredicateDescriptor,
  invariant,
  isString,
} from '#guards';

describe.concurrent('type-safe reexports', () => {
  describe('assert.ts', () => {
    describe('invariant', () => {
      test('throws TypeError for non-boolean condition', () => {
        expect(() => void invariant(1 as never)).toThrow(TypeError);
        expect(() => void invariant('' as never)).toThrow(
          'Expected condition to be boolean, got string instead',
        );
        expect(() => void invariant(null as never)).toThrow(TypeError);
        expect(() => void invariant(undefined as never)).toThrow(TypeError);
      });
    });
  });

  describe('describe.ts', () => {
    describe('describeTypePredicate', () => {
      test('should throw TypeError when typeGuard is not a function', () => {
        expect(() => describeTypePredicate(null as never, 'string')).toThrow(
          TypeError,
        );
        expect(() =>
          describeTypePredicate(undefined as never, 'string'),
        ).toThrow('Expected');
        expect(() => describeTypePredicate(123 as never, 'string')).toThrow(
          TypeError,
        );
        expect(() =>
          describeTypePredicate('not a function' as never, 'string'),
        ).toThrow(TypeError);
        expect(() => describeTypePredicate({} as never, 'string')).toThrow(
          TypeError,
        );
        expect(() => describeTypePredicate([] as never, 'string')).toThrow(
          TypeError,
        );
      });

      test('should throw TypeError when typeDescription is not a string', () => {
        const typeGuard = (value: unknown): value is string =>
          typeof value === 'string';

        expect(() => describeTypePredicate(typeGuard, null as never)).toThrow(
          TypeError,
        );
        expect(() =>
          describeTypePredicate(typeGuard, undefined as never),
        ).toThrow(TypeError);
        expect(() => describeTypePredicate(typeGuard, 123 as never)).toThrow(
          TypeError,
        );
        expect(() => describeTypePredicate(typeGuard, {} as never)).toThrow(
          TypeError,
        );
        expect(() => describeTypePredicate(typeGuard, [] as never)).toThrow(
          TypeError,
        );
      });
    });

    describe('describePredicate', () => {
      test('should throw TypeError when predicate is not a function', () => {
        expect(() => describePredicate(null as never, 'description')).toThrow(
          TypeError,
        );
        expect(() =>
          describePredicate(undefined as never, 'description'),
        ).toThrow(TypeError);
        expect(() => describePredicate(123 as never, 'description')).toThrow(
          TypeError,
        );
        expect(() =>
          describePredicate('not a function' as never, 'description'),
        ).toThrow(TypeError);
        expect(() => describePredicate({} as never, 'description')).toThrow(
          TypeError,
        );
        expect(() => describePredicate([] as never, 'description')).toThrow(
          TypeError,
        );
      });

      test('should throw TypeError when conditionDescription is not a string', () => {
        const predicate = (value: number): boolean => value > 0;

        expect(() => describePredicate(predicate, null as never)).toThrow(
          TypeError,
        );
        expect(() => describePredicate(predicate, undefined as never)).toThrow(
          TypeError,
        );
        expect(() => describePredicate(predicate, 123 as never)).toThrow(
          TypeError,
        );
        expect(() => describePredicate(predicate, {} as never)).toThrow(
          TypeError,
        );
        expect(() => describePredicate(predicate, [] as never)).toThrow(
          TypeError,
        );
      });
    });

    describe('getPredicateDescriptor', () => {
      test('should throw TypeError when predicate is not a function', () => {
        expect(() => getPredicateDescriptor(null as never)).toThrow(TypeError);
        expect(() => getPredicateDescriptor(undefined as never)).toThrow(
          TypeError,
        );
        expect(() => getPredicateDescriptor(123 as never)).toThrow(TypeError);
        expect(() => getPredicateDescriptor('not a function' as never)).toThrow(
          TypeError,
        );
        expect(() => getPredicateDescriptor({} as never)).toThrow(TypeError);
        expect(() => getPredicateDescriptor([] as never)).toThrow(TypeError);
      });
    });
  });

  describe('format.ts', () => {
    describe('formatPredicateExpectedMessage', () => {
      test('works with valid arguments', () => {
        expect(formatPredicateExpectedMessage(isString, 123, 'myValue')).toBe(
          'Expected myValue to be string, got number instead',
        );
      });

      test('throws when predicate is not a function', () => {
        expect(() =>
          formatPredicateExpectedMessage(
            'not a function' as never,
            123,
            'myValue',
          ),
        ).toThrow(TypeError);
      });

      test('throws when name is not a string', () => {
        expect(() =>
          formatPredicateExpectedMessage(isString, 123, null as never),
        ).toThrow(TypeError);
      });
    });

    describe('formatError', () => {
      test('works with Error', () => {
        expect(formatError(new TypeError('test'))).toContain(
          'TypeError("test",stack=at',
        );
      });
    });
  });
});

/*describe.concurrent('invalid arguments', () => {
    test('throws TypeError when predicate is not a function', (): void => {
      expect(() => getPredicateConditions('not a function' as never)).toThrow(
        TypeError,
      );
    });

    test('throws TypeError when predicate is null', (): void => {
      expect(() => getPredicateConditions(null as never)).toThrow(TypeError);
    });

    test('throws TypeError when predicate is undefined', (): void => {
      expect(() => getPredicateConditions(undefined as never)).toThrow(
        TypeError,
      );
    });

    test('throws TypeError when predicate is a number', (): void => {
      expect(() => getPredicateConditions(42 as never)).toThrow(TypeError);
    });

    test('throws TypeError when predicate is an object', (): void => {
      expect(() => getPredicateConditions({} as never)).toThrow(TypeError);
    });
  });*/
