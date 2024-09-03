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
 * The general version of the hack above
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

export type AsyncV<T> = T | Promise<T>;
