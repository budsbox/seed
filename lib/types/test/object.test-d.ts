import { AnyRecord, DistributedPropValue, IsEmptyObject } from '#object';
import { describe, expectTypeOf, test } from 'vitest';
import { Primitive } from 'type-fest';

describe('AnyRecord', () => {
  test('defines a partial readonly record type', () => {
    expectTypeOf<AnyRecord<'foo', number>>().toEqualTypeOf<{
      readonly foo?: number;
    }>();
  });

  test('defines a default record with all index signatures', () => {
    expectTypeOf<AnyRecord>().toEqualTypeOf<{
      readonly [key: string]: any;
      readonly [key: number]: any;
      readonly [key: symbol]: any;
    }>();
  });

  test('defines a record with "any" value when only a key provided', () => {
    expectTypeOf<AnyRecord<'foo'>>().toEqualTypeOf<{ readonly foo?: any }>();
    expectTypeOf<AnyRecord<string>>().toEqualTypeOf<{
      readonly [key: string]: any;
    }>();
  });

  test('doesn\'t add "undefined" to value type when a non-literal provided as key', () => {
    expectTypeOf<AnyRecord<string, number>>().toEqualTypeOf<{
      readonly [key: string]: number;
    }>();
  });
});

describe('IsEmptyObject', () => {
  test('returns true for empty object', () => {
    expectTypeOf<IsEmptyObject<{}>>().toEqualTypeOf<true>();
  });

  test('returns false for non-empty object', () => {
    expectTypeOf<IsEmptyObject<{ foo: string }>>().toEqualTypeOf<false>();
    expectTypeOf<IsEmptyObject<{ foo?: string }>>().toEqualTypeOf<false>();
    expectTypeOf<
      IsEmptyObject<{ [key: string]: string }>
    >().toEqualTypeOf<false>();
    expectTypeOf<
      IsEmptyObject<{ [key: number]: never }>
    >().toEqualTypeOf<false>();
    expectTypeOf<
      IsEmptyObject<{ [key: string]: undefined }>
    >().toEqualTypeOf<false>();
    expectTypeOf<IsEmptyObject<Record<symbol, never>>>().toEqualTypeOf<false>();
  });

  test('returns false for non-object', () => {
    expectTypeOf<
      // distribute primitive types for shortness
      Primitive extends unknown ? IsEmptyObject<Primitive> : never
    >().toEqualTypeOf<false>();
    expectTypeOf<IsEmptyObject<[]>>().toEqualTypeOf<false>();
  });
});

describe('DistributedPropValue', () => {
  test('extracts and unions property values from discriminated union types', () => {
    type TestUnion = { foo: string } | { foo: number };
    expectTypeOf<DistributedPropValue<TestUnion, 'foo'>>().toEqualTypeOf<
      string | number
    >();
    expectTypeOf<DistributedPropValue<TestUnion, 'foo', false>>().toEqualTypeOf<
      string | number
    >();
    expectTypeOf<DistributedPropValue<TestUnion, 'foo', true>>().toEqualTypeOf<
      string | number
    >();
  });
  describe('TStripPartial is false (default)', () => {
    test('extracts and unions property values from discriminated union types with index signature', () => {
      type TestUnion = { foo: string } | { [key: string]: number };

      expectTypeOf<DistributedPropValue<TestUnion, 'foo'>>().toEqualTypeOf<
        string | number | undefined
      >();
      expectTypeOf<
        DistributedPropValue<TestUnion, 'foo', false>
      >().toEqualTypeOf<string | number | undefined>();
    });

    test('includes undefined when extracting values from optional properties', () => {
      type TestUnion = { foo: string } | { foo?: number };
      expectTypeOf<DistributedPropValue<TestUnion, 'foo'>>().toEqualTypeOf<
        string | number | undefined
      >();
      expectTypeOf<
        DistributedPropValue<TestUnion, 'foo', false>
      >().toEqualTypeOf<string | number | undefined>();
    });

    test('includes undefined when extracting values from union where one of the objects miss property', () => {
      type TestUnion = { foo: string } | { bar: number };
      expectTypeOf<DistributedPropValue<TestUnion, 'foo'>>().toEqualTypeOf<
        string | undefined
      >();
      expectTypeOf<
        DistributedPropValue<TestUnion, 'foo', false>
      >().toEqualTypeOf<string | undefined>();
    });

    test('handles empty object correctly', () => {
      type TestUnion = {} | { foo: number };
      expectTypeOf<DistributedPropValue<TestUnion, 'foo'>>().toEqualTypeOf<
        number | undefined
      >();
      expectTypeOf<
        DistributedPropValue<{}, 'foo'>
      >().toEqualTypeOf<undefined>();
    });

    test('kitchen sink', () => {
      type TestUnion =
        | { foo: string }
        | { readonly foo: number }
        | { readonly foo?: [] }
        | { bar?: string }
        | { [key: string]: boolean }
        | {};

      expectTypeOf<DistributedPropValue<TestUnion, 'foo'>>().toEqualTypeOf<
        string | number | undefined | boolean | []
      >();
    });
  });

  describe('TStripPartial is true', () => {
    test('extracts and unions property values from discriminated union types with index signature', () => {
      type TestUnion = { foo: string } | { [key: string]: number };

      expectTypeOf<
        DistributedPropValue<TestUnion, 'foo', true>
      >().toEqualTypeOf<string | number>();
    });

    test("doesn't include undefined when extracting values from optional properties", () => {
      type TestUnion = { foo: string } | { foo?: number };
      expectTypeOf<
        DistributedPropValue<TestUnion, 'foo', true>
      >().toEqualTypeOf<string | number>();
    });

    test('handles empty object correctly', () => {
      type TestUnion = {} | { foo: number };
      expectTypeOf<
        DistributedPropValue<TestUnion, 'foo', true>
      >().toEqualTypeOf<number>();
      expectTypeOf<DistributedPropValue<{}, 'foo', true>>().toBeNever();
    });

    test('kitchen sink', () => {
      type TestUnion =
        | { foo: string }
        | { readonly foo: number }
        | { readonly foo?: [] }
        | { bar?: string }
        | { [key: string]: boolean }
        | {};

      expectTypeOf<
        DistributedPropValue<TestUnion, 'foo', true>
      >().toEqualTypeOf<string | number | boolean | []>();
    });
  });
});
