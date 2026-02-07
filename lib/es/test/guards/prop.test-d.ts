/* eslint-disable @typescript-eslint/consistent-type-assertions,@typescript-eslint/consistent-type-definitions */
import type { IsEmptyObject } from '@budsbox/lib-types';

import { expectTypeOf } from 'vitest';

import { assertProp, hasProp, isBoolean, isNumber, isString } from '#guards';

describe('hasProp type tests', () => {
  describe('basics', () => {
    test('the source being null or undefined always narrows down to never', () => {
      const nullSource = null;

      if (hasProp(nullSource, 'foo')) {
        expectTypeOf(nullSource).toBeNever();
      } else {
        expectTypeOf(nullSource).toBeNull();
      }

      const undefinedSource = undefined;
      if (hasProp(undefinedSource, 'foo')) {
        expectTypeOf(undefinedSource).toBeNever();
      } else {
        expectTypeOf(undefinedSource).toBeUndefined();
      }
    });

    test('the key being __proto__ or constructor always narrows down to never', () => {
      const source = {};

      if (hasProp(source, '__proto__')) {
        expectTypeOf(source).toBeNever();
      }

      if (hasProp(source, 'constructor')) {
        expectTypeOf(source).toBeNever();
      }
    });

    test('nullable source value narrows to non-nullable', () => {
      const source = { foo: 'bar' } as { foo: string } | null;

      if (hasProp(source, 'foo')) {
        expectTypeOf(source).toEqualTypeOf<{ foo: string }>();
        expectTypeOf(source.foo).toBeString();
      } else {
        expectTypeOf(source).toEqualTypeOf<null>();
      }
    });

    test('unknown source value narrows to record with unknown value', () => {
      const source: unknown = { bar: 123 };

      if (hasProp(source, 'bar')) {
        expectTypeOf(source).toEqualTypeOf<Record<'bar', unknown>>();
        expectTypeOf(source.bar).toBeUnknown();
      } else {
        expectTypeOf(source).toBeUnknown();
      }
    });

    test('source with optional property narrows to record with required property', () => {
      const source = { foo: 123 } as { foo?: number };

      if (hasProp(source, 'foo')) {
        expectTypeOf(source).toMatchObjectType<{ foo: number }>();
        expectTypeOf(source.foo).toBeNumber();
      } else {
        expectTypeOf(source).toMatchObjectType<{ foo?: number }>();
      }
    });

    test('source without property narrows to record with property', () => {
      const source = { bar: 123 } as { foo?: number };
      if (hasProp(source, 'bar')) {
        expectTypeOf(source).toMatchObjectType<{
          foo?: number;
          bar: unknown;
        }>();
      } else {
        expectTypeOf(source).toMatchObjectType<{ foo?: number }>();
      }

      const source2 = {};

      if (hasProp(source2, 'bar')) {
        expectTypeOf(source2).toMatchObjectType<{ bar: unknown }>();
      } else {
        expectTypeOf<IsEmptyObject<typeof source2>>().toEqualTypeOf<true>();
      }
    });

    test('union of objects all having the tested prop stays as is', () => {
      type A = { id: number; a: string };
      type B = { id: number; b: boolean };
      const source = { id: 1, a: 'test' } as A | B;

      if (hasProp(source, 'id')) {
        expectTypeOf(source).toEqualTypeOf<A | B>();
        expectTypeOf(source.id).toBeNumber();
      } else {
        expectTypeOf(source).toBeNever();
      }
    });

    test('union of objects where only one has the prop narrows to this object', () => {
      type WithProp = { special: boolean; common: number };
      type WithoutProp = { common: number };
      const source = { special: true, common: 1 } as WithoutProp | WithProp;

      if (hasProp(source, 'special')) {
        expectTypeOf(source).toMatchObjectType<WithProp>();
        expectTypeOf(source.special).toBeBoolean();
      } else {
        expectTypeOf(source).toEqualTypeOf<WithoutProp>();
      }
    });

    test('union of objects with required and optional prop narrows to the objects with required prop', () => {
      type WithProp = { special: boolean; other: number };
      type WithOptionalProp = { special?: boolean };
      type WithoutProp = { other: string };
      const source = { special: true, common: 1 } as
        | WithOptionalProp
        | WithoutProp
        | WithProp;

      if (hasProp(source, 'special')) {
        expectTypeOf(source).branded.toEqualTypeOf<
          Record<'special', boolean> | WithProp
        >();
        expectTypeOf(source.special).toBeBoolean();
      } else {
        expectTypeOf(source).toEqualTypeOf<WithOptionalProp | WithoutProp>();
      }
    });

    test('union of primitives and object with property narrows to the object', () => {
      type MixedUnion = number | string | { data: string };
      const source = { data: 'test' } as MixedUnion;

      if (hasProp(source, 'data')) {
        expectTypeOf(source).toEqualTypeOf<Record<'data', string>>();
      } else {
        expectTypeOf(source).toEqualTypeOf<number | string>();
      }
    });

    test('union of primitives where primitive has the prop in its proto narrows to this primitive', () => {
      const source = 'foo' as number | string;

      if (hasProp(source, 'length')) {
        expectTypeOf(source).toEqualTypeOf<
          string & Record<'length', unknown>
        >();
        expectTypeOf(source.length).toBeNumber();
      } else {
        expectTypeOf(source).toEqualTypeOf<number | string>();
      }
    });

    test('union of primitives and object with optional property narrows to the object with required property', () => {
      type MixedUnion = number | string | { data?: string };
      const source = { data: 'test' } as MixedUnion;

      if (hasProp(source, 'data')) {
        expectTypeOf(source).toMatchObjectType<Record<'data', string>>();
        expectTypeOf(source.data).toBeString();
      } else {
        expectTypeOf(source).toEqualTypeOf<MixedUnion>();
      }
    });

    test('symbol property key', () => {
      const sym = Symbol('test');
      const source: unknown = { [sym]: 'value' };

      if (hasProp(source, sym)) {
        expectTypeOf(source).toEqualTypeOf<Record<typeof sym, unknown>>();
        expectTypeOf(source[sym]).toBeUnknown();
      } else {
        expectTypeOf(source).toBeUnknown();
      }
    });

    test('number property key', () => {
      const source: unknown = { 0: 'first', 1: 'second' };

      if (hasProp(source, 0)) {
        expectTypeOf(source).toEqualTypeOf<Record<0, unknown>>();
        expectTypeOf(source[0]).toBeUnknown();
      } else {
        expectTypeOf(source).toBeUnknown();
      }
    });
  });

  describe('type guard', () => {
    test('narrows unknown value to record type with narrowed property', () => {
      const source: unknown = { count: 42 };

      if (hasProp(source, 'count', isNumber)) {
        expectTypeOf(source).toEqualTypeOf<Record<'count', number>>();
        expectTypeOf(source.count).toBeNumber();
      } else {
        expectTypeOf(source).toBeUnknown();
      }
    });

    test('narrows union of objects with compatible and incompatible property types', () => {
      type WithCompatibleProp = { foo: number | string };
      type WithIncompatibleProp = { foo: boolean | string };
      const source = { foo: 42 } as WithCompatibleProp | WithIncompatibleProp;

      if (hasProp(source, 'foo', isNumber)) {
        expectTypeOf(source).toMatchObjectType<{ foo: number }>();
      } else {
        expectTypeOf(source).toEqualTypeOf<
          WithCompatibleProp | WithIncompatibleProp
        >();
      }
    });

    test('type guard receives union of all possible property types', () => {
      const source = { foo: 42 } as { foo: boolean | string } | { foo: number };
      hasProp(source, 'foo', (v) => {
        expectTypeOf(v).toEqualTypeOf<boolean | number | string>();
        return typeof v === 'number';
      });
    });

    test('narrows union using type guard on specific property', () => {
      type WithProp = { special: boolean; common: number };
      type WithoutProp = { common: number };
      const source = { special: true, common: 1 } as WithoutProp | WithProp;

      if (hasProp(source, 'special', isBoolean)) {
        expectTypeOf(source).toMatchObjectType<WithProp>();
        expectTypeOf(source.special).toBeBoolean();
      } else {
        expectTypeOf(source).toEqualTypeOf<WithoutProp>();
      }
    });

    test('narrows optional property to required with type guard', () => {
      type WithOptional = { required: string; optional?: number };
      const source: WithOptional = { required: 'yes', optional: 5 };

      if (hasProp(source, 'optional', isNumber)) {
        expectTypeOf(source).toEqualTypeOf<
          WithOptional & Record<'optional', number>
        >();
        expectTypeOf(source.optional).toBeNumber();
      }
    });

    test('narrows union of primitives and object using property type guard', () => {
      type MixedUnion = number | string | { name: string };
      const source = { name: 'Alice' } as MixedUnion;

      if (hasProp(source, 'name', isString)) {
        expectTypeOf(source).toMatchObjectType<Record<'name', string>>();
        expectTypeOf(source.name).toBeString();
      } else {
        expectTypeOf(source).toEqualTypeOf<number | string>();
      }
    });

    test('narrows nested property with nested type guard', () => {
      const source: unknown = { nested: { inner: 42 } };

      if (hasProp(source, 'nested', (v) => hasProp(v, 'inner', isNumber))) {
        expectTypeOf(source).toEqualTypeOf<{ nested: { inner: number } }>();
      }
    });
  });

  describe('predicate', () => {
    test('predicate receives union of all possible property types', () => {
      const source = { foo: 42 } as { foo: boolean | string } | { foo: number };
      hasProp(source, 'foo', (v) => {
        expectTypeOf(v).toEqualTypeOf<boolean | number | string>();
        return true;
      });
    });
  });
});

describe('assertProp type tests', () => {
  describe('basics', () => {
    test('the source being null or undefined always throws (return type is never)', () => {
      const nullSource = null;
      expectTypeOf(assertProp(nullSource, 'foo')).toBeNever();

      const undefinedSource = undefined;
      expectTypeOf(assertProp(undefinedSource, 'foo')).toBeNever();
    });

    test('the key being __proto__ or constructor always throws (return type is never)', () => {
      const source = {};
      expectTypeOf(assertProp(source, '__proto__')).toBeNever();
      expectTypeOf(assertProp(source, 'constructor')).toBeNever();
    });

    test('nullable source value narrows to non-nullable', () => {
      const source = { foo: 'bar' } as { foo: string } | null;

      assertProp(source, 'foo');
      expectTypeOf(source).toEqualTypeOf<{ foo: string }>();
      expectTypeOf(source.foo).toBeString();
    });

    test('unknown source value narrows to record with unknown value', () => {
      const source: unknown = { bar: 123 };

      assertProp(source, 'bar');
      expectTypeOf(source).toEqualTypeOf<Record<'bar', unknown>>();
      expectTypeOf(source.bar).toBeUnknown();
    });

    test('source with optional property narrows to record with required property', () => {
      const source = { foo: 123 } as { foo?: number };

      assertProp(source, 'foo');
      expectTypeOf(source).toMatchObjectType<{ foo: number }>();
      expectTypeOf(source.foo).toBeNumber();
    });

    test('union of objects all having the tested prop stays as is', () => {
      type A = { id: number; a: string };
      type B = { id: number; b: boolean };
      const source = { id: 1, a: 'test' } as A | B;

      assertProp(source, 'id');
      expectTypeOf(source).toEqualTypeOf<A | B>();
      expectTypeOf(source.id).toBeNumber();
    });

    test('union of objects where only one has the prop narrows to this object', () => {
      type WithProp = { special: boolean; common: number };
      type WithoutProp = { common: number };
      const source = { special: true, common: 1 } as WithoutProp | WithProp;

      assertProp(source, 'special');
      expectTypeOf(source).toMatchObjectType<WithProp>();
      expectTypeOf(source.special).toBeBoolean();
    });

    test('union of objects with required and optional prop narrows to the objects with required prop', () => {
      type WithProp = { special: boolean; other: number };
      type WithOptionalProp = { special?: boolean };
      type WithoutProp = { other: string };
      const source = { special: true, common: 1 } as
        | WithOptionalProp
        | WithoutProp
        | WithProp;

      assertProp(source, 'special');
      expectTypeOf(source).branded.toEqualTypeOf<
        Record<'special', boolean> | WithProp
      >();
      expectTypeOf(source.special).toBeBoolean();
    });

    test('union of primitives and object with property narrows to the object', () => {
      type MixedUnion = number | string | { data: string };
      const source = { data: 'test' } as MixedUnion;

      assertProp(source, 'data');
      expectTypeOf(source).toEqualTypeOf<Record<'data', string>>();
    });

    test('union of primitives and object with optional property narrows to the object with required property', () => {
      type MixedUnion = number | string | { data?: string };
      const source = { data: 'test' } as MixedUnion;

      assertProp(source, 'data');
      expectTypeOf(source).toMatchObjectType<Record<'data', string>>();
      expectTypeOf(source.data).toBeString();
    });

    test('symbol property key', () => {
      const sym = Symbol('test');
      const source: unknown = { [sym]: 'value' };

      assertProp(source, sym);
      expectTypeOf(source).toEqualTypeOf<Record<typeof sym, unknown>>();
      expectTypeOf(source[sym]).toBeUnknown();
    });

    test('number property key', () => {
      const source: unknown = { 0: 'first', 1: 'second' };

      assertProp(source, 0);
      expectTypeOf(source).toEqualTypeOf<Record<0, unknown>>();
      expectTypeOf(source[0]).toBeUnknown();
    });
  });

  describe('type guard', () => {
    test('narrows unknown value to record type with narrowed property', () => {
      const source: unknown = { count: 42 };

      assertProp(source, 'count', isNumber);
      expectTypeOf(source).toEqualTypeOf<Record<'count', number>>();
      expectTypeOf(source.count).toBeNumber();
    });

    test('narrows unknown property to guarded property type', () => {
      const source = { foo: 42 } as { foo: unknown };
      assertProp(source, 'foo', isNumber);
      expectTypeOf(source).toMatchObjectType<{ foo: number }>();
      expectTypeOf(source.foo).toBeNumber();
    });

    test('narrows union of objects with compatible and incompatible property types', () => {
      type WithCompatibleProp = { foo: number | string };
      type WithIncompatibleProp = { foo: boolean | string };
      const source = { foo: 42 } as WithCompatibleProp | WithIncompatibleProp;

      assertProp(source, 'foo', isNumber);
      expectTypeOf(source).toMatchObjectType<{ foo: number }>();
    });

    test('type guard receives union of all possible property types', () => {
      const source = { foo: 42 } as { foo: boolean | string } | { foo: number };
      assertProp(source, 'foo', (v) => {
        expectTypeOf(v).toEqualTypeOf<boolean | number | string>();
        return typeof v === 'number';
      });
    });

    test('narrows union using type guard on specific property', () => {
      type WithProp = { special: boolean; common: number };
      type WithoutProp = { common: number };
      const source = { special: true, common: 1 } as WithoutProp | WithProp;

      assertProp(source, 'special', isBoolean);
      expectTypeOf(source).toMatchObjectType<WithProp>();
      expectTypeOf(source.special).toBeBoolean();
    });

    test('narrows optional property to required with type guard', () => {
      type WithOptional = { required: string; optional?: number };
      const source: WithOptional = { required: 'yes', optional: 5 };

      assertProp(source, 'optional', isNumber);
      expectTypeOf(source).toEqualTypeOf<
        WithOptional & Record<'optional', number>
      >();
      expectTypeOf(source.optional).toBeNumber();
    });

    test('narrows union of primitives and object using property type guard', () => {
      type MixedUnion = number | string | { name: string };
      const source = { name: 'Alice' } as MixedUnion;

      assertProp(source, 'name', isString);
      expectTypeOf(source).toMatchObjectType<Record<'name', string>>();
      expectTypeOf(source.name).toBeString();
    });

    test('narrows nested property with nested type guard', () => {
      const source: unknown = { nested: { inner: 42 } };

      assertProp(source, 'nested', (v): v is { inner: number } =>
        hasProp(v, 'inner', isNumber),
      );
      expectTypeOf(source).toEqualTypeOf<{ nested: { inner: number } }>();
    });
  });

  describe('predicate', () => {
    test('predicate receives union of all possible property types', () => {
      const source = { foo: 42 } as { foo: boolean | string } | { foo: number };
      assertProp(source, 'foo', (v) => {
        expectTypeOf(v).toEqualTypeOf<boolean | number | string>();
        return true;
      });
    });

    test('predicate still narrows the source type (unlike hasProp)', () => {
      const source: unknown = { bar: 123 };

      assertProp(source, 'bar', () => true);
      expectTypeOf(source).toEqualTypeOf<Record<'bar', unknown>>();
      expectTypeOf(source.bar).toBeUnknown();
    });

    test('nullable source value narrows to non-nullable with predicate', () => {
      const source = { foo: 'bar' } as { foo: string } | null;

      assertProp(source, 'foo', () => true);
      expectTypeOf(source).toEqualTypeOf<{ foo: string }>();
      expectTypeOf(source.foo).toBeString();
    });

    test('source with optional property narrows to record with required property with predicate', () => {
      const source = { foo: 123 } as { foo?: number };

      assertProp(source, 'foo', () => true);
      expectTypeOf(source).toMatchObjectType<{ foo: number }>();
      expectTypeOf(source.foo).toBeNumber();
    });

    test('union of objects where only one has the prop narrows to this object with predicate', () => {
      type WithProp = { special: boolean; common: number };
      type WithoutProp = { common: number };
      const source = { special: true, common: 1 } as WithoutProp | WithProp;

      assertProp(source, 'special', () => true);
      expectTypeOf(source).toMatchObjectType<WithProp>();
      expectTypeOf(source.special).toBeBoolean();
    });

    test('union of primitives and object with property narrows to the object with predicate', () => {
      type MixedUnion = number | string | { data: string };
      const source = { data: 'test' } as MixedUnion;

      assertProp(source, 'data', () => true);
      expectTypeOf(source).toEqualTypeOf<Record<'data', string>>();
    });

    test('symbol property key with predicate', () => {
      const sym = Symbol('test');
      const source: unknown = { [sym]: 'value' };

      assertProp(source, sym, () => true);
      expectTypeOf(source).toEqualTypeOf<Record<typeof sym, unknown>>();
      expectTypeOf(source[sym]).toBeUnknown();
    });

    test('number property key with predicate', () => {
      const source: unknown = { 0: 'first', 1: 'second' };

      assertProp(source, 0, () => true);
      expectTypeOf(source).toEqualTypeOf<Record<0, unknown>>();
      expectTypeOf(source[0]).toBeUnknown();
    });
  });
});
