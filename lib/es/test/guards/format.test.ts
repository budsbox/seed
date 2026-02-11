import type { Predicate } from '@budsbox/lib-types';

import { describe, expect, test } from 'vitest';

import { isIterable } from '#guards';
import {
  isArray,
  isBigint,
  isFunction,
  isNil,
  isNumber,
  isObject,
  isString,
  isSymbol,
  isTruly,
} from '#guards/check';
import { describeComplexPredicate, describePredicate } from '#guards/describe';
import {
  formatError,
  formatPredicateExpectedMessage,
  getPredicateConditions,
} from '#guards/format';

describe.concurrent('getPredicateConditions', () => {
  describe.concurrent('with type predicates', () => {
    test('returns correct result for isString', (): void => {
      const result = getPredicateConditions(isString);

      expect(result).toStrictEqual({
        condition: 'to be string',
        isType: true,
        isValue: false,
      });
    });

    test('returns correct result for isNumber', (): void => {
      const result = getPredicateConditions(isNumber);

      expect(result).toStrictEqual({
        condition: 'to be number',
        isType: true,
        isValue: false,
      });
    });

    test('returns correct result for isObject', (): void => {
      const result = getPredicateConditions(isObject);

      expect(result).toStrictEqual({
        condition: 'to be object',
        isType: true,
        isValue: false,
      });
    });

    test('returns correct result for isNil', (): void => {
      const result = getPredicateConditions(isNil);

      expect(result).toStrictEqual({
        condition: 'to be null or undefined',
        isType: true,
        isValue: false,
      });
    });

    test('returns correct result for isSymbol', (): void => {
      const result = getPredicateConditions(isSymbol);

      expect(result).toStrictEqual({
        condition: 'to be symbol',
        isType: true,
        isValue: false,
      });
    });

    test('returns correct result for isBigint', (): void => {
      const result = getPredicateConditions(isBigint);

      expect(result).toStrictEqual({
        condition: 'to be bigint',
        isType: true,
        isValue: false,
      });
    });

    test('returns correct result for isFunction', (): void => {
      const result = getPredicateConditions(isFunction);

      expect(result).toStrictEqual({
        condition: 'to be function',
        isType: true,
        isValue: false,
      });
    });

    test('returns correct result for isArray', (): void => {
      const result = getPredicateConditions(isArray);

      expect(result).toStrictEqual({
        condition: 'to be array',
        isType: true,
        isValue: false,
      });
    });
  });

  describe.concurrent('with condition predicates', () => {
    test('returns correct result for isTruly', (): void => {
      const result = getPredicateConditions(isTruly);

      expect(result).toStrictEqual({
        condition: 'to evaluates to true when coerced to a boolean',
        isType: false,
        isValue: true,
      });
    });

    test('returns correct result for custom condition predicate', (): void => {
      const customPredicate: Predicate = (value: unknown): boolean =>
        value !== null;
      describePredicate(customPredicate, 'to be non-null');

      const result = getPredicateConditions(customPredicate);

      expect(result).toStrictEqual({
        condition: 'to be non-null',
        isType: false,
        isValue: true,
      });
    });
  });

  describe.concurrent('with undescribed predicates', () => {
    test('returns default description for named predicate without descriptor', (): void => {
      function myCustomCheck(value: unknown): boolean {
        return value != null;
      }

      const result = getPredicateConditions(myCustomCheck);

      expect(result).toStrictEqual({
        condition: 'to satisfy myCustomCheck predicate',
        isType: false,
        isValue: true,
      });
    });

    test('returns default description for anonymous predicate without descriptor', (): void => {
      const result = getPredicateConditions(
        (value: unknown): boolean => value != null,
      );

      expect(result).toStrictEqual({
        condition: 'to satisfy (anonymous) predicate',
        isType: false,
        isValue: true,
      });
    });
  });

  describe.concurrent('with complex predicates', () => {
    describe('or', () => {
      test('returns correct result for type predicates', (): void => {
        const result = getPredicateConditions(
          describeComplexPredicate(() => true, false, isString, isNumber),
        );

        expect(result).toStrictEqual({
          condition: 'to be string or number',
          isType: true,
          isValue: false,
        });
      });

      test('returns correct result for value predicates', (): void => {
        const conditionA: Predicate = (v: unknown): boolean => v === 'a';
        const conditionB: Predicate = (v: unknown): boolean => v === 'b';
        describePredicate(conditionA, 'to equal "a"');
        describePredicate(conditionB, 'to equal "b"');

        const result = getPredicateConditions(
          describeComplexPredicate(() => true, false, conditionA, conditionB),
        );

        expect(result).toStrictEqual({
          condition: 'to equal "a" or to equal "b"',
          isType: false,
          isValue: true,
        });
      });

      test('returns correct result for mixed predicates', (): void => {
        const conditionPredicate: Predicate = (v: unknown): boolean =>
          v === 'a';
        describePredicate(conditionPredicate, 'to equal "a"');

        const result = getPredicateConditions(
          describeComplexPredicate(
            () => true,
            false,
            isNumber,
            conditionPredicate,
          ),
        );

        expect(result).toStrictEqual({
          condition: 'to be number or to equal "a"',
          isType: true,
          isValue: true,
        });
      });

      test('formats three or more type predicates with correct comma placement', (): void => {
        const result = getPredicateConditions(
          describeComplexPredicate(
            () => true,
            false,
            isString,
            isNumber,
            isSymbol,
          ),
        );

        expect(result).toStrictEqual({
          condition: 'to be string, number, or symbol',
          isType: true,
          isValue: false,
        });
      });
    });

    describe('and', () => {
      test('returns correct result for type predicates', (): void => {
        const result = getPredicateConditions(
          describeComplexPredicate(() => true, true, isString, isNumber),
        );

        expect(result).toStrictEqual({
          condition: 'to be string and number',
          isType: true,
          isValue: false,
        });
      });

      test('returns correct result for value predicates', (): void => {
        const conditionA: Predicate = (v: unknown): boolean => v === 'a';
        const conditionB: Predicate = (v: unknown): boolean => v === 'b';
        describePredicate(conditionA, 'to equal "a"');
        describePredicate(conditionB, 'to equal "b"');

        const result = getPredicateConditions(
          describeComplexPredicate(() => true, true, conditionA, conditionB),
        );

        expect(result).toStrictEqual({
          condition: 'to equal "a" and to equal "b"',
          isType: false,
          isValue: true,
        });
      });

      test('returns correct result for mixed predicates', (): void => {
        const conditionPredicate: Predicate = (v: unknown): boolean =>
          v === 'a';
        describePredicate(conditionPredicate, 'to equal "a"');

        const result = getPredicateConditions(
          describeComplexPredicate(
            () => true,
            true,
            isNumber,
            conditionPredicate,
          ),
        );

        expect(result).toStrictEqual({
          condition: 'to be number and to equal "a"',
          isType: true,
          isValue: true,
        });
      });

      test('formats three or more type predicates with correct comma placement', (): void => {
        const result = getPredicateConditions(
          describeComplexPredicate(
            () => true,
            true,
            isString,
            isNumber,
            isSymbol,
          ),
        );

        expect(result).toStrictEqual({
          condition: 'to be string, number, and symbol',
          isType: true,
          isValue: false,
        });
      });
    });

    test('returns correct result for mixed nested conditions', () => {
      const valuePredicate = describePredicate(
        () => true,
        'to satisfy some condition',
      );
      const typePredicate = describeComplexPredicate(
        () => true,
        true,
        isObject,
        isIterable,
      );
      const result = getPredicateConditions(
        describeComplexPredicate(
          () => true,
          false,
          typePredicate,
          valuePredicate,
        ),
      );

      expect(result).toStrictEqual({
        condition:
          '(to be object and to be iterable) or to satisfy some condition',
        isType: true,
        isValue: true,
      });
    });
  });
});

describe.concurrent('formatPredicateExpectedMessage', () => {
  describe.concurrent('with type predicates', () => {
    test('format message for isNil with string value', (): void => {
      const result = formatPredicateExpectedMessage(isNil, 'value');

      expect(result).toBe(
        'Expected value to be null or undefined, got string instead',
      );
    });

    test('formats message for isString with string value', (): void => {
      const result = formatPredicateExpectedMessage(isString, 42);

      expect(result).toBe('Expected value to be string, got number instead');
    });

    test('formats message for isNumber with string value', (): void => {
      const result = formatPredicateExpectedMessage(isNumber, 'hello');

      expect(result).toBe('Expected value to be number, got string instead');
    });

    test('formats message for isObject with primitive value', (): void => {
      const result = formatPredicateExpectedMessage(isObject, true);

      expect(result).toBe('Expected value to be object, got boolean instead');
    });

    test('formats message with custom valueName', (): void => {
      const result = formatPredicateExpectedMessage(isString, 123, 'myParam');

      expect(result).toBe('Expected myParam to be string, got number instead');
    });
  });

  describe.concurrent('with condition predicates', () => {
    test('formats message for isTruly with falsy value', (): void => {
      const result = formatPredicateExpectedMessage(isTruly, 0);

      expect(result).toBe(
        'Expected value to evaluates to true when coerced to a boolean, got 0 instead',
      );
    });

    test('formats message for custom condition predicate', (): void => {
      const customPredicate: Predicate = (value: unknown): boolean =>
        value !== null;
      describePredicate(customPredicate, 'to be non-null');

      const result = formatPredicateExpectedMessage(customPredicate, null);

      expect(result).toBe('Expected value to be non-null, got null instead');
    });
  });

  describe.concurrent('with undescribed predicates', () => {
    test('formats message for named predicate without descriptor', (): void => {
      function myCustomCheck(value: unknown): boolean {
        return value != null;
      }

      const result = formatPredicateExpectedMessage(myCustomCheck, null);

      expect(result).toBe(
        'Expected value to satisfy myCustomCheck predicate, got null instead',
      );
    });

    test('formats message for anonymous predicate without descriptor', (): void => {
      const result = formatPredicateExpectedMessage(
        (value: unknown): boolean => value != null,
        undefined,
      );

      expect(result).toBe(
        'Expected value to satisfy (anonymous) predicate, got undefined instead',
      );
    });
  });

  describe.concurrent('with complex predicates', () => {
    describe('or', () => {
      test('formats message for type predicates', (): void => {
        const result = formatPredicateExpectedMessage(
          describeComplexPredicate(() => true, false, isString, isNumber),
          true,
        );

        expect(result).toBe(
          'Expected value to be string or number, got boolean instead',
        );
      });

      test('formats message for value predicates', (): void => {
        const conditionA: Predicate = (v: unknown): boolean => v === 'a';
        const conditionB: Predicate = (v: unknown): boolean => v === 'b';
        describePredicate(conditionA, 'to equal "a"');
        describePredicate(conditionB, 'to equal "b"');

        const result = formatPredicateExpectedMessage(
          describeComplexPredicate(() => true, false, conditionA, conditionB),
          'c',
        );

        expect(result).toBe(
          'Expected value to equal "a" or to equal "b", got "c" instead',
        );
      });

      test('formats message for mixed predicates', (): void => {
        const conditionPredicate: Predicate = (v: unknown): boolean =>
          v === 'a';
        describePredicate(conditionPredicate, 'to equal "a"');

        const result = formatPredicateExpectedMessage(
          describeComplexPredicate(
            () => true,
            false,
            isNumber,
            conditionPredicate,
          ),
          'b',
        );

        expect(result).toBe(
          'Expected value to be number or to equal "a", got string ("b") instead',
        );
      });
    });

    describe('and', () => {
      test('formats message for type predicates', (): void => {
        const result = formatPredicateExpectedMessage(
          describeComplexPredicate(() => true, true, isObject, isArray),
          'not an array',
        );

        expect(result).toBe(
          'Expected value to be object and array, got string instead',
        );
      });

      test('formats message for value predicates', (): void => {
        const conditionA: Predicate = (v: unknown): boolean =>
          typeof v === 'string' && v.length > 0;
        const conditionB: Predicate = (v: unknown): boolean =>
          typeof v === 'string' && v.length < 10;
        describePredicate(conditionA, 'to have length > 0');
        describePredicate(conditionB, 'to have length < 10');

        const result = formatPredicateExpectedMessage(
          describeComplexPredicate(() => true, true, conditionA, conditionB),
          '',
        );

        expect(result).toBe(
          'Expected value to have length > 0 and to have length < 10, got "" instead',
        );
      });
    });
  });

  describe.concurrent('value type formatting', () => {
    test('formats null value correctly', (): void => {
      const result = formatPredicateExpectedMessage(isString, null);

      expect(result).toBe('Expected value to be string, got null instead');
    });

    test('formats undefined value correctly', (): void => {
      const result = formatPredicateExpectedMessage(isString, undefined);

      expect(result).toBe('Expected value to be string, got undefined instead');
    });

    test('formats symbol value correctly', (): void => {
      const result = formatPredicateExpectedMessage(isString, Symbol('test'));

      expect(result).toBe(
        'Expected value to be string, got Symbol(test) instead',
      );
    });

    test('formats NaN value correctly', (): void => {
      const result = formatPredicateExpectedMessage(isString, NaN);

      expect(result).toBe('Expected value to be string, got NaN instead');
    });

    test('formats array value correctly', (): void => {
      const result = formatPredicateExpectedMessage(isString, [1, 2, 3]);

      expect(result).toBe('Expected value to be string, got array instead');
    });

    test('formats function value correctly', (): void => {
      const result = formatPredicateExpectedMessage(isString, () => {});

      expect(result).toBe('Expected value to be string, got function instead');
    });

    test('formats plain object value correctly', (): void => {
      const result = formatPredicateExpectedMessage(isString, { a: 1 });

      expect(result).toBe('Expected value to be string, got object instead');
    });

    test('formats Map object correctly', (): void => {
      const result = formatPredicateExpectedMessage(isString, new Map());

      expect(result).toBe(
        'Expected value to be string, got Map object instead',
      );
    });

    test('formats bigint value correctly', (): void => {
      const result = formatPredicateExpectedMessage(isString, 123n);

      expect(result).toBe('Expected value to be string, got bigint instead');
    });
  });

  describe.concurrent('value string formatting in condition predicates', () => {
    test('formats long string with truncation', (): void => {
      const result = formatPredicateExpectedMessage(
        isTruly,
        'this is a very long string that should be truncated',
      );

      expect(result).toBe(
        'Expected value to evaluates to true when coerced to a boolean, got "this is a very long string tha..." instead',
      );
    });

    test('formats named function correctly', (): void => {
      function myNamedFunction(): void {}
      const result = formatPredicateExpectedMessage(isTruly, myNamedFunction);

      expect(result).toBe(
        'Expected value to evaluates to true when coerced to a boolean, got function myNamedFunction instead',
      );
    });

    test('formats anonymous function correctly', (): void => {
      const result = formatPredicateExpectedMessage(isTruly, () => {});

      expect(result).toBe(
        'Expected value to evaluates to true when coerced to a boolean, got anonymous function instead',
      );
    });

    test('formats array with more than 5 elements with truncation', (): void => {
      const result = formatPredicateExpectedMessage(
        isTruly,
        [1, 2, 3, 4, 5, 6, 7],
      );

      expect(result).toBe(
        'Expected value to evaluates to true when coerced to a boolean, got [1,2,3,4,5, ...] instead',
      );
    });

    test('formats object with truncation', (): void => {
      const result = formatPredicateExpectedMessage(isTruly, {
        key: 'value',
        another: 'prop',
      });

      expect(result).toBe(
        'Expected value to evaluates to true when coerced to a boolean, got {"key":"value","another":"prop...} instead',
      );
    });
  });
});

// doesn't check stack value, as it's different every time
describe.concurrent('formatError', () => {
  describe.concurrent('basic error formatting', () => {
    test('formats error with message', (): void => {
      const error = new Error('Something went wrong');

      const result = formatError(error);
      expect(result).toContain('Error("Something went wrong",stack=at');
    });

    test('formats error without message', (): void => {
      const error = new Error();

      const result = formatError(error);

      expect(result).toContain('Error(stack=at');
    });

    test('formats TypeError', (): void => {
      const error = new TypeError('Invalid argument');

      const result = formatError(error);
      expect(result).toContain('TypeError("Invalid argument",stack=at');
    });

    test('formats RangeError', (): void => {
      const error = new RangeError('Out of bounds');

      const result = formatError(error);

      expect(result).toContain('RangeError("Out of bounds",stack=at');
    });

    test('formats custom error class', (): void => {
      class CustomError extends Error {
        public constructor(message: string) {
          super(message);
          this.name = 'CustomError';
        }
      }

      const error = new CustomError('Custom message');
      const result = formatError(error);

      expect(result).toContain('CustomError("Custom message",stack=at');
    });
  });

  describe.concurrent('message truncation', () => {
    test('truncates long message by default', (): void => {
      const error = new Error('This is a very long error message that exceeds');

      const result = formatError(error);

      expect(result).toContain(
        'Error("This is a very long error mess...",stack=at',
      );
    });

    test('truncates message with custom maxLength', (): void => {
      const error = new Error('This is a long message');

      const result = formatError(error, { maxLength: 7 });

      expect(result).toContain('Error("This is...",stack=at');
    });

    test('respects maxLength of 0', (): void => {
      const error = new Error('Message');

      const result = formatError(error, { maxLength: 0 });

      expect(result).toBe('Error("...",stack=...)');
    });
  });

  describe.concurrent('error with code property', () => {
    test('includes code property when present', (): void => {
      const error = new Error('File not found') as Error & { code?: string };
      error.code = 'ENOENT';

      const result = formatError(error);

      expect(result).toContain('Error("File not found",code="ENOENT",stack=at');
    });

    test('formats numeric code', (): void => {
      const error = new Error('Error') as Error & { code?: number };
      error.code = 404;

      const result = formatError(error);

      expect(result).toContain('Error("Error",code=404,stack=at');
    });

    test('formats code with custom maxDepth', (): void => {
      const error = new Error('Test') as Error & { code?: object };
      error.code = { nested: { value: 'test' } };

      const result = formatError(error, { maxDepth: 1 });

      expect(result).toContain(
        'Error("Test",code={"nested":{"value":"test"}},stack=at',
      );
    });
  });

  describe.concurrent('error with cause property', () => {
    test('includes cause property when present', (): void => {
      const cause = new Error('Root cause');
      const error = new Error('Wrapped error') as Error & { cause?: Error };
      error.cause = cause;

      const result = formatError(error);

      expect(result).toContain(
        'Error("Wrapped error",cause=Error("Root cause",stack=at',
      );
    });

    test('formats cause as string', (): void => {
      const error = new Error('Test') as Error & { cause?: string };
      error.cause = 'String cause';

      const result = formatError(error);

      expect(result).toContain('Error("Test",cause="String cause",stack=at');
    });

    test('formats cause with custom maxDepth limits nesting', (): void => {
      const deepestCause = new Error('Deepest cause');
      const cause = new Error('Deep cause') as Error & { cause?: Error };
      const error = new Error('Top') as Error & { cause?: Error };
      cause.cause = deepestCause;
      error.cause = cause;

      const result = formatError(error, { maxDepth: 0 });

      expect(result).toContain(
        'Error("Top",cause=Error("Deep cause"...),stack=at',
      );
    });
  });

  describe.concurrent('error with stack trace', () => {
    test('includes stack trace without first line', (): void => {
      const error = new Error('Stack test');
      error.stack = 'Error: Stack test\n  at Object.<anonymous>';

      const result = formatError(error);

      expect(result).toBe('Error("Stack test",stack=at Object.<anonymous>)');
    });

    test('truncates long stack trace', (): void => {
      const error = new Error('Test');
      error.stack =
        'Error: Test\n  at Function.test (file.ts:10:15)\n  at Object.<anonymous> (file.ts:20:25)';

      const result = formatError(error, { maxLength: 20 });

      expect(result).toBe(
        'Error("Test",stack=at Function.test (file.ts:10:15)\n  at Ob...)',
      );
    });

    test('omits empty stack trace', (): void => {
      const error = new Error('Test');
      error.stack = '';

      const result = formatError(error);

      expect(result).toBe('Error("Test")');
    });
  });

  describe.concurrent('combined properties', () => {
    test('formats error with all properties', (): void => {
      const cause = new Error('Caused by');
      const error = new Error('Main error') as Error & {
        code?: string;
        cause?: Error;
      };
      error.code = 'ERR_INVALID';
      error.cause = cause;
      error.stack = 'Stack trace here';

      const result = formatError(error);

      expect(result).toContain(
        'Error("Main error",code="ERR_INVALID",cause=Error("Caused by",stack=at',
      );
    });

    test('maintains order: message, code, cause, stack', (): void => {
      const error = new Error('Test') as Error & {
        code?: string;
        cause?: string;
      };
      error.code = 'CODE';
      error.cause = 'CAUSE';
      error.stack = 'STACK';

      const result = formatError(error);

      const messageIdx = result.indexOf('"Test"');
      const codeIdx = result.indexOf('code=');
      const causeIdx = result.indexOf('cause=');
      const stackIdx = result.indexOf('stack=');

      expect(messageIdx < codeIdx).toBe(true);
      expect(codeIdx < causeIdx).toBe(true);
      expect(causeIdx < stackIdx).toBe(true);
    });
  });

  describe.concurrent('with formatDebugValue integration', () => {
    test('formats cause as complex object', (): void => {
      const error = new Error('Test') as Error & { cause?: unknown };
      error.cause = { nested: 'value', count: 42 };

      const result = formatError(error);

      expect(result).toContain(
        'Error("Test",cause={"nested":"value","count":42},stack=at',
      );
    });

    test('formats cause with circular reference detection', (): void => {
      const error = new Error('Test') as Error & { cause?: unknown };
      const cause: Record<string, unknown> = { key: 'value' };
      cause.self = cause;
      error.cause = cause;

      const result = formatError(error);

      expect(result).toContain('Error("Test",cause={...},stack=at');
    });

    test('respects maxDepth for nested cause', (): void => {
      const error = new Error('Test') as Error & { cause?: unknown };
      error.cause = [1, 2, [3, 4, [5, 6]]];

      const result = formatError(error, { maxDepth: 0 });

      expect(result).toContain('Error("Test",cause=Array(3),stack=at');
    });
  });

  describe.concurrent('edge cases', () => {
    test('omits null cause', (): void => {
      const error = new Error('Test') as Error & { cause?: null };
      error.cause = null;

      const result = formatError(error);

      expect(result).toContain('Error("Test",stack=at');
    });

    test('omits undefined cause', (): void => {
      const error = new Error('Test') as Error & { cause?: undefined };
      error.cause = undefined;

      const result = formatError(error);

      expect(result).toContain('Error("Test",stack=at');
    });

    test('handles error with symbol in properties', (): void => {
      const error = new Error('Test') as Error & { code?: symbol };
      error.code = Symbol('test');

      const result = formatError(error);

      expect(result).toContain('Error("Test",code=Symbol(test),stack=at');
    });

    test('handles error with numeric message', (): void => {
      const error = new Error('123');

      const result = formatError(error);

      expect(result).toContain('Error("123",stack=at');
    });

    test('handles very long error message with small maxLength', (): void => {
      const error = new Error(
        'This is an extremely long error message that contains a lot of text',
      );

      const result = formatError(error, { maxLength: 5 });

      expect(result).toContain('Error("This...",stack=at');
    });

    test('handles error with special characters in message', (): void => {
      const error = new Error('Error: "quoted" and \'single\'');

      const result = formatError(error);

      expect(result).toContain(
        'Error("Error: \\"quoted\\" and \'single\'",stack=at',
      );
    });

    test('handles error with function as code property', (): void => {
      const error = new Error('Test') as Error & { code?: () => string };
      error.code = () => 'test';

      const result = formatError(error);

      expect(result).toContain('Error("Test",code=anonymous function,stack=at');
    });

    test('handles default options when not provided', (): void => {
      const error = new Error('Default test');

      const result = formatError(error);

      expect(result).toContain('Error("Default test",stack=at');
    });

    test('handles partial options provided', (): void => {
      const error = new Error('Test');

      const result = formatError(error, { maxLength: 10 });

      expect(result).toContain('Error("Test",stack=at');
    });
  });
});
