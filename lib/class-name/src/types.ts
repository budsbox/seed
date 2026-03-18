import type { ClassValue } from 'clsx';
import type { CamelCasedProperties } from 'type-fest';

/**
 * A type definition for a function that generates a class value based on the provided arguments.
 *
 * This function receives a variable number of arguments of a specific type and outputs a `ClassValue`.
 *
 * @param args - A rest parameter that accepts arguments matching the `TArgs` tuple type.
 * @returns A `ClassValue` computed based on the provided arguments.
 * @typeParam TArgs - A tuple type representing the types of the arguments that the function can accept.
 */
export type ClassNameFn<TArgs extends readonly unknown[]> = (
  ...args: TArgs
) => ClassNameValue<TArgs>;

/**
 * A utility type that represents a class name or a function that generates
 * a class name.
 *
 * This type can be used in scenarios where class names are dynamically determined
 * or passed as plain static values. It supports both static values and a function
 * that returns a static `ClassValue` based on provided arguments.
 *
 * @typeParam TArgs - The tuple type representing the arguments accepted by the
 * `ClassNameFn` function.
 *
 * The type can be one of the following:
 * - `ClassNameFn<TArgs>`: A function that accepts arguments defined by `TArgs` and
 *   returns a `ClassValue`.
 * - `ReadonlyDeep<ClassValue>`: A deeply readonly variant of a `ClassValue` which
 *   typically represents a string or object that defines class names.
 */
export type ClassNameValue<
  TArgs extends readonly unknown[] = readonly unknown[],
> = ClassNameArray<TArgs> | ClassNameFn<TArgs> | ClassValue;

type ClassNameArray<TArgs extends readonly unknown[] = readonly unknown[]> =
  Array<ClassNameValue<TArgs>>;

/**
 * A helper type to generate camel-cased class name properties dynamically.
 *
 * @typeParam TBase - A string type representing the base name for the class keys. Defaults to an empty string.
 * @typeParam TArgs - A tuple type representing the arguments expected for the class name values. Defaults to an empty tuple.
 *
 * Takes the base `TBase` and prepends `class-name-` to it for the keys, while the values are derived from `ClassNameValue` based on `TArgs`.
 * Converts the resulting keys into camel case format using `CamelCasedProperties`.
 */
export type WithClassName<
  TBase extends string = '',
  TArgs extends readonly unknown[] = [],
> = CamelCasedProperties<{
  [K in `class-name-${TBase}`]?: ClassNameValue<TArgs>;
}> & {};
