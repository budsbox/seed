import { describe, expectTypeOf } from 'vitest';
import {
  hasProp,
  isFunction,
  isNumber,
  isIterable,
  isBoolean,
  isString,
} from '#guards';
import { IsEmptyObject } from '@budsbox/lib-types/object';

declare const unknownConst: unknown;

describe('guards', () => {
  describe('isFunction', () => {
    type FVoid = () => void;
    type FNumberString = (a: number) => string;

    test('should narrow function type from union', () => {
      const fConst = null as unknown as FVoid | FNumberString | string | null;

      if (isFunction(fConst)) {
        expectTypeOf(fConst).toEqualTypeOf<FVoid | FNumberString>();
      }
    });

    test('should narrow to provided function type', () => {
      if (isFunction<FVoid>(unknownConst))
        expectTypeOf(unknownConst).toEqualTypeOf<FVoid>();
    });
  });

  describe('isIterable', () => {
    test('should narrow array type', () => {
      const arr = ['a', 'b'] as string[] | undefined;
      if (isIterable(arr)) expectTypeOf(arr).toEqualTypeOf<string[]>();
    });

    test('should narrow string type', () => {
      const str = 'abc' as string | undefined;
      if (isIterable(str)) expectTypeOf(str).toEqualTypeOf<string>();
    });

    test('should narrow all iterable types from union', () => {
      const possibleIterable = ['a', 'b'] as
        | string[]
        | string
        | Map<string, number>
        | undefined;

      if (isIterable(possibleIterable))
        expectTypeOf(possibleIterable).toEqualTypeOf<
          string[] | string | Map<string, number>
        >();
    });

    test('should extend object type with Iterable<unknown>', () => {
      const obj = { a: 1 } as Record<string, number> | undefined;
      if (isIterable(obj))
        expectTypeOf(obj).toEqualTypeOf<
          Record<string, number> & Iterable<unknown>
        >();
    });
  });

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
        const source = { special: true, common: 1 } as WithProp | WithoutProp;

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
          | WithProp
          | WithOptionalProp
          | WithoutProp;

        if (hasProp(source, 'special')) {
          expectTypeOf(source).branded.toEqualTypeOf<
            WithProp | Record<'special', boolean>
          >();
          expectTypeOf(source.special).toBeBoolean();
        } else {
          expectTypeOf(source).toEqualTypeOf<WithOptionalProp | WithoutProp>();
        }
      });

      test('union of primitives and object with property narrows to the object', () => {
        type MixedUnion = string | number | { data: string };
        const source = { data: 'test' } as MixedUnion;

        if (hasProp(source, 'data')) {
          expectTypeOf(source).toEqualTypeOf<Record<'data', string>>();
        } else {
          expectTypeOf(source).toEqualTypeOf<string | number>();
        }
      });

      test('union of primitives and object with optional property narrows to the object with required property', () => {
        type MixedUnion = string | number | { data?: string };
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
        type WithCompatibleProp = { foo: string | number };
        type WithIncompatibleProp = { foo: string | boolean };
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
        const source = { foo: 42 } as
          | { foo: number }
          | { foo: string | boolean };
        hasProp(source, 'foo', (v) => {
          expectTypeOf(v).toEqualTypeOf<number | string | boolean>();
          return typeof v === 'number';
        });
      });

      test('narrows union using type guard on specific property', () => {
        type WithProp = { special: boolean; common: number };
        type WithoutProp = { common: number };
        const source = { special: true, common: 1 } as WithProp | WithoutProp;

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
        type MixedUnion = string | number | { name: string };
        const source = { name: 'Alice' } as MixedUnion;

        if (hasProp(source, 'name', isString)) {
          expectTypeOf(source).toMatchObjectType<Record<'name', string>>();
          expectTypeOf(source.name).toBeString();
        } else {
          expectTypeOf(source).toEqualTypeOf<string | number>();
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
        const source = { foo: 42 } as
          | { foo: number }
          | { foo: string | boolean };
        hasProp(source, 'foo', (v) => {
          expectTypeOf(v).toEqualTypeOf<number | string | boolean>();
          return true;
        });
      });
    });
  });
});
