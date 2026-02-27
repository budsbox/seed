/* eslint-disable @typescript-eslint/consistent-type-assertions */
import { describe, expectTypeOf, test } from 'vitest';

import { isString } from '#guards';
import { fif, fifs, sure } from '#logical';

describe('fif', () => {
  test('test function parameter receives correct value type', () => {
    fif(
      10,
      (value) => {
        expectTypeOf(value).toEqualTypeOf<number>();
        return value > 5;
      },
      'result',
    );
  });

  test('onTrue function parameter with type guard receives narrowed type', () => {
    const value = 'test' as number | string;

    fif(value, isString, (s) => {
      expectTypeOf(s).toEqualTypeOf<string>();
      return s.toUpperCase();
    });
  });

  test('onFalse function parameter with type guard receives excluded type', () => {
    const value = 'test' as number | string;

    fif(
      value,
      isString,
      (s) => s.toUpperCase(),
      (n) => {
        expectTypeOf(n).toEqualTypeOf<number>();
        return n * 2;
      },
    );
  });

  test('onTrue function parameter without type guard receives original type', () => {
    const value = 42;
    const testFn = (n: number): boolean => n > 5;

    fif(value, testFn, (n) => {
      expectTypeOf(n).toEqualTypeOf<number>();
      return n * 2;
    });
  });

  test('onFalse function parameter without type guard receives original type', () => {
    const value = 42;
    const testFn = (n: number): boolean => n > 5;

    fif(
      value,
      testFn,
      (n) => n * 2,
      (n) => {
        expectTypeOf(n).toEqualTypeOf<number>();
        return n + 1;
      },
    );
  });

  test('return type with value onTrue and no onFalse', () => {
    const result = fif(10, (n: number) => n > 5, 'success');
    expectTypeOf(result).toEqualTypeOf<string | undefined>();
  });

  test('return type with value onTrue and value onFalse', () => {
    const result = fif(10, (n: number) => n > 5, 'success', 'failure');
    expectTypeOf(result).toEqualTypeOf<string>();
  });

  test('return type with function onTrue and no onFalse', () => {
    const result = fif(
      10,
      (n: number) => n > 5,
      () => 42,
    );
    expectTypeOf(result).toEqualTypeOf<number | undefined>();
  });

  test('return type with function onTrue and function onFalse', () => {
    const result = fif(
      10,
      (n: number) => n > 5,
      () => 42,
      () => 'fail',
    );
    expectTypeOf(result).toEqualTypeOf<number | string>();
  });

  test('return type with function onTrue and value onFalse', () => {
    const result = fif(
      10,
      (n: number) => n > 5,
      () => 42,
      'fail',
    );
    expectTypeOf(result).toEqualTypeOf<number | string>();
  });

  test('return type with value onTrue and function onFalse', () => {
    const result = fif(
      10,
      (n: number) => n > 5,
      42,
      () => 'fail',
    );
    expectTypeOf(result).toEqualTypeOf<number | string>();
  });

  test('return type with type guard narrows union types', () => {
    const value = 'test' as number | string;
    const result = fif(
      value,
      isString,
      (s) => s.length,
      (n) => n * 2,
    );
    expectTypeOf(result).toEqualTypeOf<number>();
  });

  test('return type with nullable value and type guard', () => {
    const value = 'test' as string | null;
    const result = fif(
      value,
      isString,
      (s) => s.length,
      () => 0,
    );
    expectTypeOf(result).toEqualTypeOf<number>();
  });

  test('return type with complex union narrowing', () => {
    const value = 'test' as boolean | number | string;
    const result = fif(value, isString, 'is string', 'not string');
    expectTypeOf(result).toEqualTypeOf<string>();
  });

  test('onTrue and onFalse preserve different return types', () => {
    const value = 10;
    const result = fif(
      value,
      (n: number) => n > 5,
      (n) => ({ value: n }),
      (n) => [n],
    );
    expectTypeOf(result).toEqualTypeOf<number[] | { value: number }>();
  });
});

describe('fifs', () => {
  test('onTrue function parameter receives true type', () => {
    fifs(true, (condition) => {
      expectTypeOf(condition).toEqualTypeOf<true>();
      return 'result';
    });
  });

  test('onFalse function parameter receives false type', () => {
    fifs(
      false,
      () => 'true result',
      (condition) => {
        expectTypeOf(condition).toEqualTypeOf<false>();
        return 'false result';
      },
    );
  });

  test('return type with value onTrue and no onFalse', () => {
    const result = fifs(true, 'success');
    expectTypeOf(result).toEqualTypeOf<string | undefined>();
  });

  test('return type with value onTrue and value onFalse', () => {
    const result = fifs(true, 'success', 'failure');
    expectTypeOf(result).toEqualTypeOf<string>();
  });

  test('return type with function onTrue and no onFalse', () => {
    const result = fifs(true, () => 42);
    expectTypeOf(result).toEqualTypeOf<number | undefined>();
  });

  test('return type with function onTrue and function onFalse', () => {
    const result = fifs(
      true,
      () => 42,
      () => 'fail',
    );
    expectTypeOf(result).toEqualTypeOf<number | string>();
  });

  test('return type with different typed branches', () => {
    const result = fifs(true, { key: 'value' }, [1, 2, 3]);
    expectTypeOf(result).toEqualTypeOf<number[] | { key: string }>();
  });

  test('return type with mixed value and function branches', () => {
    const result = fifs(true, () => 42, 'fallback');
    expectTypeOf(result).toEqualTypeOf<number | string>();
  });
});

describe('sure', () => {
  test('onTrue function parameter receives non-nil narrowed type', () => {
    const value = 'test' as string | null;

    sure(value, (s) => {
      expectTypeOf(s).toEqualTypeOf<string>();
      return s.toUpperCase();
    });
  });

  test('onTrue function parameter with undefined union receives non-nil type', () => {
    const value = 42 as number | undefined;

    sure(value, (n) => {
      expectTypeOf(n).toEqualTypeOf<number>();
      return n * 2;
    });
  });

  test('onTrue function parameter with null and undefined union receives non-nil type', () => {
    const value = 'test' as string | null | undefined;

    sure(value, (s) => {
      expectTypeOf(s).toEqualTypeOf<string>();
      return s.length;
    });
  });

  test('onFalse function parameter receives nil type from nullable', () => {
    const value = 'test' as string | null;

    sure(
      value,
      (s) => s.length,
      (nil) => {
        expectTypeOf(nil).toEqualTypeOf<null>();
        return 0;
      },
    );
  });

  test('onFalse function parameter receives nil type from undefinable', () => {
    const value = 42 as number | undefined;

    sure(
      value,
      (n) => n * 2,
      (nil) => {
        expectTypeOf(nil).toEqualTypeOf<undefined>();
        return 0;
      },
    );
  });

  test('onFalse function parameter receives nil union type', () => {
    const value = 'test' as string | null | undefined;

    sure(
      value,
      (s) => s.length,
      (nil) => {
        expectTypeOf(nil).toEqualTypeOf<null | undefined>();
        return 0;
      },
    );
  });

  test('return type with value onTrue and no onFalse', () => {
    const value = 'test' as string | null;
    const result = sure(value, 'success');
    expectTypeOf(result).toEqualTypeOf<string | undefined>();
  });

  test('return type with value onTrue and value onFalse', () => {
    const value = 'test' as string | null;
    const result = sure(value, 'success', 'failure');
    expectTypeOf(result).toEqualTypeOf<string>();
  });

  test('return type with function onTrue and no onFalse', () => {
    const value = 42 as number | null;
    const result = sure(value, (n) => n * 2);
    expectTypeOf(result).toEqualTypeOf<number | undefined>();
  });

  test('return type with function onTrue and function onFalse', () => {
    const value = 42 as number | null;
    const result = sure(
      value,
      (n) => n * 2,
      () => 'nil',
    );
    expectTypeOf(result).toEqualTypeOf<number | string>();
  });

  test('return type preserves different branch types', () => {
    const value = { key: 'value' } as { key: string } | null;
    const result = sure(
      value,
      (obj) => obj.key,
      () => ['fallback'],
    );
    expectTypeOf(result).toEqualTypeOf<string | string[]>();
  });

  test('return type with non-nullable value', () => {
    const value = 'always present';
    const result = sure(value, (s) => s.length);
    expectTypeOf(result).toEqualTypeOf<number | undefined>();
  });

  test('handles complex object types', () => {
    const value = { a: 1, b: 'test' } as { a: number; b: string } | undefined;

    sure(value, (obj) => {
      expectTypeOf(obj).toEqualTypeOf<{ a: number; b: string }>();
      return obj.a;
    });
  });

  test('handles array types', () => {
    const value = [1, 2, 3] as number[] | null;

    sure(value, (arr) => {
      expectTypeOf(arr).toEqualTypeOf<number[]>();
      return arr.length;
    });
  });
});
