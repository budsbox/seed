import type { Predicate } from '@budsbox/lib-types';

import {
  isArray,
  isFunction,
  isNil,
  isNotNil,
  isPrimitive,
  isString,
  isSymbol,
} from './check.js';
import { getPredicateDescriptor } from './describe.js';

/**
 * Creates an expected message string for a given predicate, value, and value name.
 *
 * This function validates that the predicate is a valid function and constructs
 * an informative error message describing what was expected of the `value` in
 * terms of the `predicate`'s description or descriptor. This message integrates
 * details about the provided `value` to aid debugging.
 *
 * @internal
 * @param predicate - The predicate function used to test the value. Must be a valid function.
 * @param value - The value being evaluated against the predicate.
 * @param valueName - The name of the value being tested. Defaults to `'value'`.
 * @returns A formatted string message describing the expected value and its type.
 * @throws {TypeError} if the `predicate` is not a function.
 */
export const formatPredicateExpectedMessage = (
  predicate: Predicate,
  value: unknown,
  valueName = 'value',
): string => {
  const descriptor = getPredicateDescriptor(predicate);
  let description: string,
    isTypePredicate = false;
  if (isNotNil(descriptor)) {
    if ('condition' in descriptor) description = descriptor.condition;
    else {
      description = `to be ${descriptor.type}`;
      isTypePredicate = true;
    }
  } else description = defaultDescription(predicate);

  return `Expected ${valueName} ${description}, got ${isTypePredicate ? debugValueType(value) : debugValueString(value)} instead`;
};

/**
 * Determines the type description of a given value in a human-readable format.
 *
 * - If the value is `null`, `undefined`, or a `Symbol`, it will return the string representation.
 * - If the value is a primitive type (e.g., `number`, `string`, `boolean`), it will return the result of `typeof value`.
 * - If the value is a function, it will return `'function'`.
 * - If the value is an array, it will return `'array'`.
 * - For objects, it will return the `Symbol.toStringTag` or the internal `[[Class]]` property of the object.
 *
 * @param value - The value whose type needs to be determined.
 * @returns A string representation of the value's type.
 */
export const debugValueType = (value: unknown): string => {
  if (isNil(value) || isSymbol(value)) return String(value);

  if (Number.isNaN(value)) return 'NaN';
  if (isPrimitive(value)) return typeof value;

  if (isFunction(value)) return 'function';
  if (isArray(value)) return 'array';

  const proto = Object.getPrototypeOf(value) as unknown;
  if (proto === Object.prototype || proto === null) return 'object';

  return `${oToString(value).slice(8, -1)} object`;
};

/**
 * Generates a string representation of a given value for debugging purposes.
 *
 * The function handles various data types and outputs an appropriate string representation:
 * - Strings are truncated to 15 characters and represented in JSON format.
 * - Primitives are converted to their string form.
 * - Functions are represented by their name or identified as anonymous.
 * - Arrays are truncated to a preview of up to 5 elements, followed by `...` if there are more.
 * - Objects attempt to serialize to JSON, truncating lengthy results, or falling back to custom fallback logic.
 *
 * @param value - A value of any type to be represented as a debug string.
 * @returns A debug-friendly string representation of the provided value.
 */
export const debugValueString = (value: unknown): string => {
  if (isString(value)) {
    return JSON.stringify(
      value.length > 15 ? `${value.slice(0, 15)}...` : value,
    );
  }
  if (isPrimitive(value)) return String(value);

  if (isFunction(value))
    return value.name.length > 0 ?
        `function ${value.name}`
      : 'anonymous function';

  if (isArray(value)) {
    const debugSlice = value.slice(0, 5).map(debugValueString);
    return `[${debugSlice.join(',')}${value.length > 5 ? ', ...' : ''}]`;
  }

  try {
    const json = JSON.stringify(value);
    return json.length > 15 ? `${json.slice(0, 15)}...` : json;
  } catch {
    return oToString(value);
  }
};

/**
 * Constructs a dot-notation or bracket-notation string representation
 * for accessing nested properties of an object based on the provided keys.
 *
 * @internal
 * @param sourceName - The base name of the object or source from which properties are being accessed.
 * @param keys - A variadic list of property keys representing the nested path.
 *               Each key will be used to generate the accessor string.
 * @returns A string representing the accessor path in dot-notation for valid identifiers
 *          or bracket-notation for non-identifier keys.
 * @remarks The function is intended to be used for generating error messages.
 */
export const formatAccessString = (
  sourceName: string,
  ...keys: readonly PropertyKey[]
): string =>
  keys.reduce(
    (acc, key) =>
      `${acc}${isString(key) && /^[a-zA-Z_$][a-zA-Z0-9_$]*$/.test(key) ? `.${key}` : `[${debugValueString(key)}]`}`,
    sourceName,
  );

const oToString = (value: unknown): string =>
  Object.prototype.toString.call(value);

const defaultDescription = (predicate: Predicate): string =>
  `to satisfy ${predicate.name || '(anonymous)'} predicate`;
