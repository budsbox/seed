import type { CSSProperties } from 'react';
import type { CamelCasedProperties } from 'type-fest';

import { isArray, isFunction, isObject } from '@budsbox/lib-es/guards';

declare module 'react' {
  interface CSSProperties {
    [key: `--${string}`]: number | string;
  }
}

/**
 * Represents a dynamic style definition that can either be a static set of CSS properties
 * or a function that generates CSS properties dynamically based on provided arguments.
 *
 * @typeParam TArgs - The tuple of argument types the style-generating function can accept.
 */
export type DynamicStyle<
  TArgs extends readonly unknown[] = readonly unknown[],
> =
  | false
  | CSSProperties
  | DynamicStyleArray<TArgs>
  | ((...args: TArgs) => DynamicStyle<TArgs>)
  | null
  | undefined;

type DynamicStyleArray<TArgs extends readonly unknown[] = readonly unknown[]> =
  Array<DynamicStyle<TArgs>>;

/**
 * This type is used to define an object with dynamically generated property keys prefixed by `style-`
 * followed by the provided base string and camel-cased.
 * Each property key maps to a `DynamicStyle` type which takes the specified arguments.
 *
 * @typeParam TBase - The base string used as the suffix for the generated properties. Defaults to an empty string.
 * @typeParam TArgs - The arguments required by the dynamic style generator. Defaults to an empty tuple.
 */
export type WithDynamicStyle<
  TBase extends string = '',
  TArgs extends readonly unknown[] = [],
> = CamelCasedProperties<{
  [K in `style-${TBase}`]?: DynamicStyle<TArgs>;
}> & {};

/**
 * Combines multiple styles into a single function that generates CSS properties based on provided arguments.
 *
 * @param styles - A variadic list of styles, where each style can either be a function that accepts arguments and returns CSS properties,
 * or a static set of CSS properties.
 * @returns A function that takes arguments and produces a merged set of CSS properties by evaluating and combining the provided styles.
 */
export function styleFactory<TArgs extends readonly unknown[]>(
  ...styles: ReadonlyArray<DynamicStyle<TArgs>>
): (...args: TArgs) => CSSProperties;
export function styleFactory(
  ...styles: readonly DynamicStyle[]
): (...args: readonly unknown[]) => DynamicStyle {
  return (...args) => {
    const queue: DynamicStyle[] = [...styles];
    const result: CSSProperties = {};
    while (queue.length) {
      const item = queue.shift();
      if (isArray(item)) {
        queue.unshift(...item);
      } else if (isFunction(item)) {
        queue.unshift(item(...args));
      } else if (isObject(item)) {
        Object.assign(result, item);
      }
    }

    return result;
  };
}
