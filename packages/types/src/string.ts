export type Split<S extends string, D extends string> =
  S extends `${infer Left}${D}${infer Right}` ?
    [...Split<Left, D>, ...Split<Right, D>]
  : [S];

export type Join<S extends unknown[], D extends string> =
  string[] extends S ? string
  : S extends [`${infer First}`, ...infer Rest] ?
    Rest[0] extends undefined ?
      First
    : `${First}${D}${Join<Rest, D>}`
  : string;

type CapitalizeArray<Arr extends unknown[]> =
  string[] extends Arr ? string[]
  : Arr extends [`${infer First}`, ...infer Rest] ?
    Rest[0] extends undefined ?
      [Capitalize<First>]
    : [Capitalize<First>, ...CapitalizeArray<Rest>]
  : [];

/**
 * @example
 * ```
 * type Test = PascalCase<'foo-bar'>; // Test === 'FooBar'
 * ```
 */
export type PascalCase<S extends string> = Join<
  CapitalizeArray<Split<S, '_' | '-'>>,
  ''
>;

/**
 * @example
 * ```
 * type Test = PascalCase<'foo-bar'>; // Test === 'fooBar'
 * ```
 */
export type CamelCase<S extends string> = Uncapitalize<PascalCase<S>>;
