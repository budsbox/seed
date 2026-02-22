/**
 * Type tests for core utility types module.
 *
 * @module
 */

import { describe, expectTypeOf, test } from 'vitest';

import type {
  AnyMap,
  AnyReadableMap,
  AnyReadableSet,
  AnySet,
  Awaitable,
  Def,
  Falsy,
  IsNil,
  Maybe,
  Nil,
  NonNil,
  Truthy,
  Undef,
  WithFallback,
} from '#core';

describe('Def', () => {
  test('should exclude undefined from type', () => {
    expectTypeOf<Def<string | undefined>>().toEqualTypeOf<string>();
    expectTypeOf<Def<number | undefined>>().toEqualTypeOf<number>();
  });

  test('should exclude void from type', () => {
    expectTypeOf<Def<string | void>>().toEqualTypeOf<string>();
    expectTypeOf<Def<number | void>>().toEqualTypeOf<number>();
  });

  test('should exclude both undefined and void from type', () => {
    expectTypeOf<Def<string | undefined | void>>().toEqualTypeOf<string>();
    expectTypeOf<Def<number | null | undefined | void>>().toEqualTypeOf<
      number | null
    >();
  });

  test('should preserve null', () => {
    expectTypeOf<Def<string | null>>().toEqualTypeOf<string | null>();
  });

  test('should preserve non-nullable types', () => {
    expectTypeOf<Def<string>>().toEqualTypeOf<string>();
    expectTypeOf<Def<number>>().toEqualTypeOf<number>();
    expectTypeOf<Def<boolean>>().toEqualTypeOf<boolean>();
  });

  test('should handle union types', () => {
    expectTypeOf<Def<string | number | undefined>>().toEqualTypeOf<
      string | number
    >();
  });

  test('should handle never type', () => {
    expectTypeOf<Def<never>>().toEqualTypeOf<never>();
  });
});

describe('Undef', () => {
  test('should create union with undefined', () => {
    expectTypeOf<Undef<string>>().toEqualTypeOf<string | undefined>();
    expectTypeOf<Undef<number>>().toEqualTypeOf<number | undefined>();
  });

  test('should default to never when no type parameter provided', () => {
    expectTypeOf<Undef>().toEqualTypeOf<undefined>();
  });

  test('should preserve existing undefined', () => {
    expectTypeOf<Undef<string | undefined>>().toEqualTypeOf<
      string | undefined
    >();
  });

  test('should handle null types', () => {
    expectTypeOf<Undef<null>>().toEqualTypeOf<null | undefined>();
  });
});

describe('Nil', () => {
  test('should be union of null and undefined', () => {
    expectTypeOf<Nil>().toEqualTypeOf<null | undefined>();
  });

  test('should match null', () => {
    expectTypeOf<null>().toMatchTypeOf<Nil>();
  });

  test('should match undefined', () => {
    expectTypeOf<undefined>().toMatchTypeOf<Nil>();
  });
});

describe('Maybe', () => {
  test('should create union with Nil', () => {
    expectTypeOf<Maybe<string>>().toEqualTypeOf<string | null | undefined>();
    expectTypeOf<Maybe<number>>().toEqualTypeOf<number | null | undefined>();
  });

  test('should default to Nil when no type parameter provided', () => {
    expectTypeOf<Maybe>().toEqualTypeOf<null | undefined>();
  });

  test('should preserve existing Nil values', () => {
    expectTypeOf<Maybe<string | null>>().toEqualTypeOf<
      string | null | undefined
    >();
    expectTypeOf<Maybe<string | undefined>>().toEqualTypeOf<
      string | null | undefined
    >();
  });

  test('should handle complex union types', () => {
    expectTypeOf<Maybe<string | number>>().toEqualTypeOf<
      string | number | null | undefined
    >();
  });
});

describe('NonNil', () => {
  test('should exclude null and undefined from type', () => {
    expectTypeOf<NonNil<string | null | undefined>>().toEqualTypeOf<string>();
    expectTypeOf<NonNil<number | null | undefined>>().toEqualTypeOf<number>();
  });

  test('should preserve non-nullable types', () => {
    expectTypeOf<NonNil<string>>().toEqualTypeOf<string>();
    expectTypeOf<NonNil<number>>().toEqualTypeOf<number>();
  });

  test('should default to empty object when no type parameter provided', () => {
    expectTypeOf<NonNil>().toEqualTypeOf<{}>();
  });

  test('should handle union types', () => {
    expectTypeOf<NonNil<string | number | null>>().toEqualTypeOf<
      string | number
    >();
  });

  test('should handle never type', () => {
    expectTypeOf<NonNil<never>>().toEqualTypeOf<never>();
  });
});

describe('Awaitable', () => {
  test('should create union with Promise', () => {
    expectTypeOf<Awaitable<string>>().toEqualTypeOf<string | Promise<string>>();
    expectTypeOf<Awaitable<number>>().toEqualTypeOf<number | Promise<number>>();
  });

  test('should handle void type', () => {
    expectTypeOf<Awaitable<void>>().toEqualTypeOf<void | Promise<void>>();
  });

  test('should preserve existing Promise', () => {
    expectTypeOf<Awaitable<Promise<string>>>().toEqualTypeOf<
      Promise<string> | Promise<Promise<string>>
    >();
  });

  test('should handle union types', () => {
    expectTypeOf<Awaitable<string | number>>().toEqualTypeOf<
      string | number | Promise<string | number>
    >();
  });

  test('should handle complex types', () => {
    type ComplexType = { foo: string; bar: number } | string;
    expectTypeOf<Awaitable<ComplexType>>().toEqualTypeOf<
      ComplexType | Promise<ComplexType>
    >();
  });
});

describe('Falsy', () => {
  test('should include all falsy values', () => {
    expectTypeOf<Falsy>().toEqualTypeOf<0 | '' | false | null | undefined>();
  });

  test('should match literal false', () => {
    expectTypeOf<false>().toExtend<Falsy>();
  });

  test('should match literal 0', () => {
    expectTypeOf<0>().toExtend<Falsy>();
  });

  test('should match empty string', () => {
    expectTypeOf<''>().toExtend<Falsy>();
  });

  test('should match null', () => {
    expectTypeOf<null>().toExtend<Falsy>();
  });

  test('should match undefined', () => {
    expectTypeOf<undefined>().toExtend<Falsy>();
  });
});

describe('Truthy', () => {
  test('should exclude falsy values from literal types', () => {
    expectTypeOf<Truthy<0 | 1 | 2>>().toEqualTypeOf<1 | 2>();
    expectTypeOf<Truthy<'' | 'hello'>>().toEqualTypeOf<'hello'>();
    expectTypeOf<Truthy<false | true>>().toEqualTypeOf<true>();
  });

  test('should exclude null from type', () => {
    expectTypeOf<Truthy<string | null>>().toEqualTypeOf<string>();
  });

  test('should exclude undefined from type', () => {
    expectTypeOf<Truthy<number | undefined>>().toEqualTypeOf<number>();
  });

  test('should default to unknown when no type parameter provided', () => {
    expectTypeOf<Truthy>().toEqualTypeOf<unknown>();
  });

  test('should preserve non-falsy types', () => {
    expectTypeOf<Truthy<string>>().toEqualTypeOf<string>();
    expectTypeOf<Truthy<number>>().toEqualTypeOf<number>();
    expectTypeOf<Truthy<boolean>>().toEqualTypeOf<true>();
  });

  test('should handle complex union types with falsy values', () => {
    expectTypeOf<Truthy<'a' | 'b' | '' | null>>().toEqualTypeOf<'a' | 'b'>();
    expectTypeOf<Truthy<1 | 2 | 0 | false>>().toEqualTypeOf<1 | 2>();
  });

  test('should result in never when all values are falsy', () => {
    expectTypeOf<
      Truthy<0 | '' | false | null | undefined>
    >().toEqualTypeOf<never>();
  });
});

describe('AnySet', () => {
  test('should be assignable to Set', () => {
    expectTypeOf<AnySet>().toExtend<Set<any>>();
  });

  test('should accept type parameter', () => {
    expectTypeOf<AnySet<string>>().toEqualTypeOf<Set<string>>();
    expectTypeOf<AnySet<number>>().toEqualTypeOf<Set<number>>();
  });

  test('should default to any when no type parameter provided', () => {
    expectTypeOf<AnySet>().toEqualTypeOf<Set<any>>();
  });

  test('should handle union types', () => {
    expectTypeOf<AnySet<string | number>>().toEqualTypeOf<
      Set<string | number>
    >();
  });
});

describe('AnyReadableSet', () => {
  test('should accept both Set and ReadonlySet', () => {
    expectTypeOf<Set<string>>().toExtend<AnyReadableSet<string>>();
    expectTypeOf<ReadonlySet<string>>().toExtend<AnyReadableSet<string>>();
  });

  test('should be union of Set and ReadonlySet', () => {
    expectTypeOf<AnyReadableSet<string>>().toEqualTypeOf<
      Set<string> | ReadonlySet<string>
    >();
  });

  test('should default to any when no type parameter provided', () => {
    expectTypeOf<AnyReadableSet>().toEqualTypeOf<Set<any> | ReadonlySet<any>>();
  });

  test('should handle union types', () => {
    expectTypeOf<AnyReadableSet<string | number>>().toEqualTypeOf<
      Set<string | number> | ReadonlySet<string | number>
    >();
  });
});

describe('AnyMap', () => {
  test('should be assignable to Map', () => {
    expectTypeOf<AnyMap>().toExtend<Map<any, any>>();
  });

  test('should accept type parameters', () => {
    expectTypeOf<AnyMap<string, number>>().toEqualTypeOf<Map<string, number>>();
  });

  test('should handle union types', () => {
    expectTypeOf<AnyMap<string | number, boolean | null>>().toEqualTypeOf<
      Map<string | number, boolean | null>
    >();
  });
});

describe('AnyReadableMap', () => {
  test('should accept both Map and ReadonlyMap', () => {
    expectTypeOf<Map<string, number>>().toExtend<
      AnyReadableMap<string, number>
    >();
    expectTypeOf<ReadonlyMap<string, number>>().toExtend<
      AnyReadableMap<string, number>
    >();
  });

  test('should be union of Map and ReadonlyMap', () => {
    expectTypeOf<AnyReadableMap<string, number>>().toEqualTypeOf<
      Map<string, number> | ReadonlyMap<string, number>
    >();
  });

  test('should default to any for both key and value when no type parameters provided', () => {
    expectTypeOf<AnyReadableMap>().toEqualTypeOf<
      Map<any, any> | ReadonlyMap<any, any>
    >();
  });

  test('should handle union types', () => {
    expectTypeOf<AnyReadableMap<string | number, boolean>>().toEqualTypeOf<
      Map<string | number, boolean> | ReadonlyMap<string | number, boolean>
    >();
  });
});

describe('IsNil', () => {
  test('should return true for Nil types', () => {
    expectTypeOf<IsNil<null | undefined>>().toEqualTypeOf<true>();
    expectTypeOf<IsNil<null>>().toEqualTypeOf<true>();
    expectTypeOf<IsNil<undefined>>().toEqualTypeOf<true>();
  });

  test('should return false for non-Nil types', () => {
    expectTypeOf<IsNil<string>>().toEqualTypeOf<false>();
    expectTypeOf<IsNil<number>>().toEqualTypeOf<false>();
    expectTypeOf<IsNil<boolean>>().toEqualTypeOf<false>();
  });

  test('should return false for union types containing non-Nil values', () => {
    expectTypeOf<IsNil<string | null>>().toEqualTypeOf<false>();
    expectTypeOf<IsNil<number | undefined>>().toEqualTypeOf<false>();
  });

  test('should return false for never type', () => {
    expectTypeOf<IsNil<never>>().toEqualTypeOf<false>();
  });
});

describe('WithFallback', () => {
  test('should return fallback type when T is never', () => {
    expectTypeOf<WithFallback<never, string>>().toEqualTypeOf<string>();
    expectTypeOf<WithFallback<never, number>>().toEqualTypeOf<number>();
  });

  test('should return T when T is not never', () => {
    expectTypeOf<WithFallback<string, number>>().toEqualTypeOf<string>();
    expectTypeOf<WithFallback<boolean, string>>().toEqualTypeOf<boolean>();
  });

  test('should default fallback to unknown', () => {
    expectTypeOf<WithFallback<never>>().toEqualTypeOf<unknown>();
  });

  test('should preserve union types', () => {
    expectTypeOf<WithFallback<string | number, boolean>>().toEqualTypeOf<
      string | number
    >();
  });

  test('should handle complex fallback types', () => {
    type ComplexFallback = { foo: string; bar: number };
    expectTypeOf<
      WithFallback<never, ComplexFallback>
    >().toEqualTypeOf<ComplexFallback>();
  });
});
