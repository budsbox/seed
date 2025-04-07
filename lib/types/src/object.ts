import type { Maybe, Nil } from './index.js';

/**
 * Hack to show the inferred type (instead of union, intersections, generics, etc.) in tips
 *
 * @example
 * ```typescript
 * // a tip for Foo would be like { bla: string } & { bla?: string; lol?: string; }
 * type Foo = { bla: string } & { bla?: string; lol?: string; };
 *
 * // {bla: string; lol?: string}
 * type Bla = InferObj<Foo>;
 * ```
 */
export type InferObject<T extends object> = {
  foo: {
    [K in keyof T]: T[K];
  };
}['foo'];

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type Key<T = any> =
  T extends Record<infer K, unknown> ? K
  : T extends object ? keyof T
  : never;

export type Value<T = object, K extends Key = Key<T>> =
  T extends object ?
    K extends keyof T ?
      T[K]
    : never
  : never;

export type Mixin<Parent extends object, Child extends object> = InferObject<
  Omit<Parent, keyof Child> & Child
>;

export type Diff<T1 extends object, T2 extends object> = InferObject<
  Omit<T1, keyof T2 & keyof T1>
>;

export type Override<
  Source extends object,
  Values extends { [K in keyof Source]: unknown },
> = Mixin<Source, Values>;

export type OmitNeverProps<T extends object> = InferObject<
  Pick<
    T,
    {
      [K in keyof T]: [T[K]] extends [never] ? never : K;
    }[keyof T]
  >
>;

export type OmitNilProps<T extends object> = OmitNeverProps<{
  [K in keyof T]: T[K] extends Nil ? never
  : T[K] extends Maybe<infer U> ? U
  : T[K];
}>;

export type OmitByType<T extends object, U> = InferObject<
  OmitNeverProps<{
    [K in keyof T]: T[K] extends U ? never : T[K];
  }>
>;

export type FilterByType<T extends object, U> = InferObject<
  OmitNeverProps<{
    [K in keyof T]: T[K] extends U ? T[K] : never;
  }>
>;
