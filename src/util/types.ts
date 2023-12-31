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
export type InferObj<T extends object> = {
  foo: {
    [K in keyof T]: T[K];
  };
}['foo'];

/**
 * Extends inferObj for non-object types
 */
export type Infer<T> =
  unknown extends T ? T
  : T extends object ? InferObj<T>
  : T;

// eslint-disable-next-line @typescript-eslint/no-invalid-void-type
export type Def<T> = Exclude<T, undefined | void>;

export type Undef<T = never> = T | undefined;

export type Nil = null | undefined;

export type Maybe<T = never> = T | Nil;

export type Sure<T> = NonNullable<T>;

export type Mixin<Parent extends object, Child extends object> = InferObj<
  Omit<Parent, keyof Child> & Child
>;

export type Diff<T1 extends object, T2 extends object> = Infer<
  Omit<T1, keyof T2 & keyof T1>
>;

export type Deferred<T> = T | Promise<T>;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type Key<T = any> =
  T extends Record<infer K, unknown> ? K
  : T extends object ? keyof T
  : never;

export type Value<T = object, K extends Key = Key<T>> = T extends object ?
  K extends keyof T ?
    T[K]
  : never
: never;

export type WithoutNeverProps<T extends object> = Infer<
  Pick<
    T,
    {
      [K in keyof T]: [T[K]] extends [never] ? never : K;
    }[keyof T]
  >
>;

export type WithoutNilProps<T extends object> = WithoutNeverProps<{
  [K in keyof T]: T[K] extends Nil ? never
  : T[K] extends Maybe<infer U> ? U
  : T[K];
}>;

export type FilteredByType<T extends object, U> = Infer<
  WithoutNeverProps<{
    [K in keyof T]: T[K] extends U ? T[K] : never;
  }>
>;
