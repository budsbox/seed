/* eslint-disable @typescript-eslint/no-empty-object-type,@typescript-eslint/consistent-type-assertions */
import type { Primitive } from 'type-fest';

import type { Nil, NonNil, UnknownFunction } from '@budsbox/lib-types';

import { describe, expectTypeOf, test } from 'vitest';

import {
  isArray,
  isBigint,
  isBoolean,
  isDef,
  isFalse,
  isFalsy,
  isFunction,
  isNil,
  isNotNil,
  isNumber,
  isObject,
  isPrimitive,
  isPropKey,
  isString,
  isSymbol,
  isTrue,
  isTruly,
  isUndef,
} from '#guards';

describe('isUndef', () => {
  test('narrows to undefined', () => {
    const value: unknown = undefined;

    if (isUndef(value)) {
      expectTypeOf(value).toEqualTypeOf<undefined>();
    } else {
      expectTypeOf(value).toEqualTypeOf<{} | null>();
    }
  });
});

describe('isDef', () => {
  test('narrows out undefined from Undef<T>', () => {
    const value = 'test' as string | undefined;

    if (isDef(value)) {
      expectTypeOf(value).toEqualTypeOf<string>();
    } else {
      expectTypeOf(value).toEqualTypeOf<undefined>();
    }
  });

  test('narrows unknown to {} | null', () => {
    const value: unknown = undefined;
    if (isDef(value)) {
      expectTypeOf(value).toEqualTypeOf<{} | null>();
    }
  });
});

describe('isNil', () => {
  test('narrows unknown to null | undefined', () => {
    const value: unknown = null;

    if (isNil(value)) {
      expectTypeOf(value).toEqualTypeOf<Nil>();
    } else {
      expectTypeOf(value).toEqualTypeOf<{}>();
    }
  });

  test('narrows nullable union to null | undefined with correct elimination in else branch', () => {
    const value = 'test' as number | string | null | undefined;
    if (isNil(value)) {
      expectTypeOf(value).toEqualTypeOf<null | undefined>();
    } else {
      expectTypeOf(value).toEqualTypeOf<number | string>();
    }
  });
});

describe('isNotNil', () => {
  test('narrows unknown to NonNil', () => {
    const value: unknown = 'test';

    if (isNotNil(value)) {
      expectTypeOf(value).toEqualTypeOf<NonNil>();
    } else {
      expectTypeOf(value).toEqualTypeOf<Nil>();
    }
  });

  test('narrows nullable union to non-nullable union', () => {
    const value = 'test' as number | string | null | undefined;

    if (isNotNil(value)) {
      expectTypeOf(value).toEqualTypeOf<number | string>();
    } else {
      expectTypeOf(value).toEqualTypeOf<null | undefined>();
    }
  });
});

describe('isTrue', () => {
  test('narrows to literal true', () => {
    const value: unknown = true;

    if (isTrue(value)) {
      expectTypeOf(value).toEqualTypeOf<true>();
    } else {
      expectTypeOf(value).toEqualTypeOf<unknown>();
    }
  });
});

describe('isFalse', () => {
  test('narrows to literal false', () => {
    const value: unknown = false;

    if (isFalse(value)) {
      expectTypeOf(value).toEqualTypeOf<false>();
    } else {
      expectTypeOf(value).toEqualTypeOf<unknown>();
    }
  });
});

describe('isString', () => {
  test('narrows unknown to string', () => {
    const value: unknown = 'test';

    if (isString(value)) {
      expectTypeOf(value).toEqualTypeOf<string>();
    } else {
      expectTypeOf(value).toEqualTypeOf<unknown>();
    }
  });

  test('narrows union to string literal', () => {
    const value = 'test' as 'test' | number;
    if (isString(value)) {
      expectTypeOf(value).toEqualTypeOf<'test'>();
    } else {
      expectTypeOf(value).toEqualTypeOf<number>();
    }
  });
});

describe('isNumber', () => {
  test('narrows unknown to number', () => {
    const value: unknown = 42;

    if (isNumber(value)) {
      expectTypeOf(value).toEqualTypeOf<number>();
    } else {
      expectTypeOf(value).toEqualTypeOf<unknown>();
    }
  });

  test('narrows union to number literal', () => {
    const value = 42 as 42 | string;
    if (isNumber(value)) {
      expectTypeOf(value).toEqualTypeOf<42>();
    } else {
      expectTypeOf(value).toEqualTypeOf<string>();
    }
  });
});

describe('isBigint', () => {
  test('narrows unknown to bigint', () => {
    const value: unknown = 42n;

    if (isBigint(value)) {
      expectTypeOf(value).toEqualTypeOf<bigint>();
    } else {
      expectTypeOf(value).toEqualTypeOf<unknown>();
    }
  });

  test('narrows union to bigint literal', () => {
    const value = 42n as 42n | string;
    if (isBigint(value)) {
      expectTypeOf(value).toEqualTypeOf<42n>();
    } else {
      expectTypeOf(value).toEqualTypeOf<string>();
    }
  });
});

describe('isBoolean', () => {
  test('narrows unknown to boolean', () => {
    const value: unknown = true;

    if (isBoolean(value)) {
      expectTypeOf(value).toEqualTypeOf<boolean>();
    } else {
      expectTypeOf(value).toEqualTypeOf<unknown>();
    }
  });

  describe('narrows union to boolean literal', () => {
    const value = true as true | number;

    if (isBoolean(value)) {
      expectTypeOf(value).toEqualTypeOf<true>();
    } else {
      expectTypeOf(value).toEqualTypeOf<number>();
    }
  });
});

describe('isSymbol', () => {
  test('narrows to symbol', () => {
    const value: unknown = Symbol('test');

    if (isSymbol(value)) {
      expectTypeOf(value).toEqualTypeOf<symbol>();
    } else {
      expectTypeOf(value).toEqualTypeOf<unknown>();
    }
  });

  describe('narrows union to symbol literal', () => {
    const value = Symbol.iterator as number | typeof Symbol.iterator;

    if (isSymbol(value)) {
      expectTypeOf(value).toEqualTypeOf<typeof Symbol.iterator>();
    } else {
      expectTypeOf(value).toEqualTypeOf<number>();
    }
  });
});

describe('isPropKey', () => {
  test('narrows unknown to PropertyKey', () => {
    const value: unknown = 'key';

    if (isPropKey(value)) {
      expectTypeOf(value).toEqualTypeOf<PropertyKey>();
    } else {
      expectTypeOf(value).toEqualTypeOf<unknown>();
    }
  });

  test('narrows union to valid property key literal', () => {
    const value = 'key' as 'key' | { foo: string };

    if (isPropKey(value)) {
      expectTypeOf(value).toEqualTypeOf<'key'>('key');
    } else {
      expectTypeOf(value).toMatchObjectType<{ foo: string }>();
    }
  });
});

describe('isPrimitive', () => {
  test('narrows unknown to Primitive', () => {
    const value: unknown = 'test';

    if (isPrimitive(value)) {
      expectTypeOf(value).toEqualTypeOf<Primitive>();
    } else {
      expectTypeOf(value).toEqualTypeOf<{}>();
    }
  });

  test('narrows union to primitive types', () => {
    const value = 'test' as 'test' | number | { foo: string };

    if (isPrimitive(value)) {
      expectTypeOf(value).toEqualTypeOf<'test' | number>();
    } else {
      expectTypeOf(value).toMatchObjectType<{ foo: string }>();
    }
  });
});

describe('isTruly', () => {
  test('returns boolean without type narrowing', () => {
    const value: unknown = 'test';
    const result = isTruly(value);

    expectTypeOf(result).toEqualTypeOf<boolean>();
    expectTypeOf(value).toEqualTypeOf<unknown>();
  });
});

describe('isFalsy', () => {
  test('returns boolean without type narrowing', () => {
    const value: unknown = '';
    const result = isFalsy(value);

    expectTypeOf(result).toEqualTypeOf<boolean>();
    expectTypeOf(value).toEqualTypeOf<unknown>();
  });
});

describe('isObject', () => {
  test('narrows to object', () => {
    const value: unknown = {};

    if (isObject(value)) {
      expectTypeOf(value).toEqualTypeOf<object>();
    } else {
      expectTypeOf(value).toEqualTypeOf<unknown>();
    }
  });

  test('narrows union to object values', () => {
    const value = { foo: 'bar' } as number | { foo: string };

    if (isObject(value)) {
      expectTypeOf(value).toMatchObjectType<{ foo: string }>();
    } else {
      expectTypeOf(value).toEqualTypeOf<number>();
    }
  });

  test('narrows nullable value to non-nullable value', () => {
    const value = { foo: 'bar' } as { foo: string } | null;

    if (isObject(value)) {
      expectTypeOf(value).toMatchObjectType<{ foo: string }>();
    } else {
      expectTypeOf(value).toEqualTypeOf<null>();
    }
  });
});

describe('isArray', () => {
  test('narrows readonly T[] | T to readonly T[]', () => {
    const value = ['test'] as string | readonly string[];

    if (isArray(value)) {
      expectTypeOf(value).toEqualTypeOf<readonly string[]>();
    } else {
      expectTypeOf(value).toEqualTypeOf<string>();
    }
  });

  test('narrows T | T[] to T[]', () => {
    const value = ['test'] as string | string[];

    if (isArray(value)) {
      expectTypeOf(value).toEqualTypeOf<string[]>();
    } else {
      expectTypeOf(value).toEqualTypeOf<string>();
    }
  });

  test('narrows unknown to unknown[]', () => {
    const value: unknown = ['test'];

    if (isArray(value)) {
      expectTypeOf(value).toEqualTypeOf<unknown[]>();
    } else {
      expectTypeOf(value).toEqualTypeOf<unknown>();
    }
  });

  test('preserves readonly modifier', () => {
    const value = ['test'] as 'literal' | readonly string[] | number[];

    if (isArray(value)) {
      expectTypeOf(value).toEqualTypeOf<readonly string[] | number[]>();
    } else {
      expectTypeOf(value).toEqualTypeOf<'literal'>();
    }
  });
});

describe('isFunction', () => {
  test('narrows to function type when T is function', () => {
    type MyFunc = (x: number) => string;
    const value = ((x: number) => String(x)) as string | MyFunc;

    if (isFunction(value)) {
      expectTypeOf(value).toEqualTypeOf<MyFunc>();
    } else {
      expectTypeOf(value).toEqualTypeOf<string>();
    }
  });

  test('falls back to UnknownFunction when T is not function', () => {
    const value: string = 'test';

    if (isFunction(value)) {
      expectTypeOf(value).toEqualTypeOf<UnknownFunction & string>();
    } else {
      expectTypeOf(value).toEqualTypeOf<string>();
    }
  });

  test('narrows unknown to specified function type', () => {
    const value: unknown = () => {};
    type MyFunc = (x: number) => string;

    if (isFunction<MyFunc>(value)) {
      expectTypeOf(value).toEqualTypeOf<MyFunc>();
    } else {
      expectTypeOf(value).toEqualTypeOf<unknown>();
    }
  });

  test('narrows unknown to UnknownFunction by default', () => {
    const value: unknown = () => {};

    if (isFunction(value)) {
      expectTypeOf(value).toEqualTypeOf<UnknownFunction>();
    } else {
      expectTypeOf(value).toEqualTypeOf<unknown>();
    }
  });
});
