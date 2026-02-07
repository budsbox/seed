import type { Predicate } from '@budsbox/lib-types';

import { entries } from '#object';

import {
  isArray,
  isDate,
  isError,
  isFunction,
  isMap,
  isNil,
  isNotNil,
  isObject,
  isPrimitive,
  isSet,
  isString,
  isSymbol,
  isWeakMapLike,
  isWeakSetLike,
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
  const { condition, isType, isValue } = getPredicateConditions(predicate);

  return `Expected ${valueName} ${condition}, got${isType ? ` ${formatDebugType(value)}` : ''}${
    isValue ?
      isType ? [' (', formatDebugValue(value), ')'].join('')
      : ` ${formatDebugValue(value)}`
    : ''
  } instead`;
};

/**
 * Generates a description of the conditions associated with a given predicate.
 * The description includes whether the predicate is a type guard, a value check, or both.
 *
 * @internal
 * @param predicate - The predicate whose conditions are to be analyzed and described.
 * @param nested - A flag indicating if the predicate is part of a nested structure. Defaults to `false`.
 * @returns An object comprising:
 * - `condition`: A string describing the predicate's conditions.
 * - `isType`: A boolean indicating whether the predicate is a type guard.
 * - `isValue`: A boolean indicating whether the predicate checks a value.
 * @typeParam Predicate - The expected type of the predicate parameter.
 */
export const getPredicateConditions = (
  predicate: Predicate,
  nested = false,
): { condition: string; isType: boolean; isValue: boolean } => {
  const descriptor = getPredicateDescriptor(predicate);
  if (isNil(descriptor))
    return {
      condition: defaultDescription(predicate),
      isType: false,
      isValue: true,
    };

  const descriptorEntry = entries(descriptor)[0]!;

  if (descriptorEntry[0] === 'condition') {
    return { condition: descriptorEntry[1], isType: false, isValue: true };
  } else if (descriptorEntry[0] === 'type') {
    return {
      condition: nested ? descriptorEntry[1] : `to be ${descriptorEntry[1]}`,
      isType: true,
      isValue: false,
    };
  } else {
    const [conjunction, predicates] = descriptorEntry;
    const separator = `, ${conjunction} `;
    let isType = false,
      isValue = false;

    const typeGuards: string[] = [];
    const plains: string[] = [];

    for (const p of predicates) {
      const pc = getPredicateConditions(p, true);
      isType ||= pc.isType;
      isValue ||= pc.isValue;

      if (pc.isValue) {
        plains.push(pc.isType ? `(${pc.condition})` : pc.condition);
      } else if (pc.isType) {
        typeGuards.push(pc.condition);
      }
    }

    const typeGuardString =
      typeGuards.length === 1 ?
        typeGuards[0]!
      : [typeGuards.slice(0, -1).join(', ')]
          .concat(typeGuards.slice(-1))
          .join(separator);

    const plainString = plains.join(separator);

    const isPrintableTypes = typeGuards.length > 0;

    const condition = `${isPrintableTypes ? `to be ${typeGuardString}` : ''}${
      isValue ? `${isPrintableTypes ? separator : ''}${plainString}` : ''
    }`;

    return { condition, isType, isValue };
  }
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
export const formatDebugType = (value: unknown): string => {
  if (isNil(value) || isSymbol(value)) return String(value);

  if (Number.isNaN(value)) return 'NaN';
  if (isPrimitive(value)) return typeof value;

  if (isFunction(value)) return 'function';
  if (isArray(value)) return 'array';

  const proto = Object.getPrototypeOf(value) as unknown;
  if (proto === Object.prototype || proto === null) return 'object';

  return `${objectTag(value)} object`;
};

/**
 * Formats a value into a human-readable debug string representation.
 *
 * Handles primitives, arrays, objects, functions, dates, errors, maps, sets,
 * and objects with custom `toString` methods. Circular references are detected
 * and marked as `[Circular]` for arrays or `{Circular}` for objects.
 *
 * @param value - The value to format for debugging purposes.
 * @param options - Optional formatting configuration via {@link FormatOptions}.
 * @returns A string representation suitable for debug output.
 */
export const formatDebugValue = (
  value: unknown,
  options: FormatOptions = {},
): string => {
  const {
    maxLength,
    maxDepth,
    maxItems,
    seen = new WeakSet(),
  } = { ...defaultOptions, ...options };

  if (isString(value)) {
    return JSON.stringify(clamp(value, maxLength));
  }
  if (isPrimitive(value)) return String(value);

  if (seen.has(value)) return isArray(value) ? '[Circular]' : '{Circular}';

  seen.add(value);

  if (isFunction(value))
    return value.name.length > 0 ?
        `function ${value.name}`
      : 'anonymous function';

  const tag = objectTag(value);
  const withTag = (str: string, omitTagIf: string = ''): string =>
    tag === omitTagIf ? str : `${tag}(${str})`;

  if (isArray(value)) {
    if (maxDepth < 0) return withTag(String(value.length));

    const debugSlice = value.slice(0, maxItems).map((item) =>
      formatDebugValue(item, {
        maxLength,
        maxDepth: maxDepth - 1,
        maxItems,
        seen,
      }),
    );
    return withTag(
      `[${debugSlice.join(',')}${value.length > maxItems ? ', ...' : ''}]`,
      'Array',
    );
  }

  if (isDate(value))
    return withTag(
      Number.isNaN(value.getTime()) ? 'Invalid' : value.toISOString(),
    );

  if (isError(value)) return formatError(value, { maxDepth: maxDepth - 1 });

  if (isMap(value) || isSet(value)) return withTag(String(value.size));
  if (isWeakMapLike(value) || isWeakSetLike(value)) return withTag('?');

  if (
    'toString' in (value as object) &&
    // eslint-disable-next-line @typescript-eslint/unbound-method
    isFunction(value.toString) &&
    value.toString !== Object.prototype.toString
  ) {
    try {
      // eslint-disable-next-line @typescript-eslint/no-base-to-string
      const str = value.toString();
      if (isString(str) && !/\[object [a-z0-9$_]+]/i.test(str))
        return withTag(clamp(str, maxLength));
    } catch {
      /* ignored */
    }
  }

  try {
    const json = JSON.stringify(value);
    if (isString(json))
      return withTag(
        `${clamp(json, maxLength)}${json.length > maxLength ? '}' : ''}`,
        'Object',
      );
  } catch {
    /* ignored */
  }
  return tag === 'Object' ? '{...}' : `${withTag('')} object`;
};

/**
 * Formats an {@link Error} object into a concise debug string.
 *
 * Includes the error's name, message, optional `code` and `cause` properties,
 * and a truncated stack trace. Nested values are formatted using {@link formatDebugValue}.
 *
 * @internal
 * @param error - The error to format.
 * @param options - Optional formatting configuration via {@link FormatOptions}.
 * @returns A formatted string representation of the error.
 */
export const formatError = (
  error: Error,
  options: FormatOptions = {},
): string => {
  const {
    maxDepth,
    maxLength,
    seen = new WeakSet(),
  } = { ...defaultOptions, ...options };
  const { name, message, stack } = error;

  if (maxDepth < 0) return `${name}(${formatDebugValue(message)}...)`;
  if (seen.has(error)) return `{Circular ${name}}`;
  const args: Array<string | [string, string]> = [];
  if (isNotNil(message) && message !== '') {
    // message formatting is at the same depth by design
    args.push(formatDebugValue(message, { ...options, seen }));
  }

  if ('code' in error && isNotNil(error.code))
    args.push([
      'code',
      formatDebugValue(error.code, {
        ...options,
        seen,
        maxDepth: maxDepth - 1,
      }),
    ]);

  if ('cause' in error && isNotNil(error.cause))
    args.push([
      'cause',
      formatDebugValue(error.cause, {
        ...options,
        seen,
        maxDepth: maxDepth - 1,
      }),
    ]);

  if (isString(stack) && stack.length > 0)
    args.push([
      'stack',
      clamp(stack.replace(/^.*?\n\s*at\s/, 'at '), maxLength * 2),
    ]);

  return `${name}(${args
    .map((arg) => (isString(arg) ? arg : arg.join('=')))
    .join(',')})`;
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
      `${acc}${isString(key) && /^[a-zA-Z_$][a-zA-Z0-9_$]*$/.test(key) ? `.${key}` : `[${formatDebugValue(key)}]`}`,
    sourceName,
  );

/**
 * Extracts and returns the `Symbol.toStringTag` or internal `[[Class]]` property of a given object as a string.
 *
 * The method utilizes `Object.prototype.toString` to determine the object type
 * and removes the surrounding `[object ...]` syntax to provide the type name.
 *
 * @param value - The input value from which the object tag will be extracted.
 * @returns The name of the internal `[[Class]]` corresponding to the input value.
 */
export const shortObjectTag = (value: unknown): string =>
  Object.prototype.toString.call(value).slice(8, -1);

/**
 * Returns a descriptive tag string for a given value based on its constructor
 * and `Symbol.toStringTag`.
 *
 * For objects, combine the constructor name with the `Symbol.toStringTag` if they differ
 * (e.g., `"Map"` or `"CustomClass[Tag]"`). For non-objects, falls back to {@link shortObjectTag}.
 *
 * @param value - The value to extract the tag from.
 * @returns A string describing the object's type and tag.
 */
export const objectTag = (value: unknown): string => {
  if (isObject(value)) {
    const ctor = [
      value.constructor,
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      Object.getPrototypeOf(value)?.constructor,
    ].find(isFunction);
    const ctorName = isNotNil(ctor) && ctor.name ? ctor.name : 'Object';

    const tag = shortObjectTag(value);

    return `${ctorName}${tag !== ctorName ? `[${tag}]` : ''}`;
  }

  return shortObjectTag(value);
};

const defaultDescription = (predicate: Predicate): string =>
  `to satisfy ${predicate.name || '(anonymous)'} predicate`;

const clamp = (str: string, maxLength: number): string =>
  str.length > maxLength ? `${str.slice(0, maxLength).trimEnd()}...` : str;

/**
 * Configuration options for debug formatting functions.
 */
export interface FormatOptions {
  /**
   * Maximum recursion depth for nested structures.
   *
   * @defaultValue `2`
   */
  readonly maxDepth?: number;

  /**
   * Maximum number of items to display in arrays.
   *
   * @defaultValue `5`
   */
  readonly maxItems?: number;

  /**
   * Maximum string length before truncation.
   *
   * @defaultValue `15`
   */
  readonly maxLength?: number;

  /**
   * Set of already-seen objects for circular reference detection.
   */
  readonly seen?: WeakSet<object>;
}

const defaultOptions = {
  maxDepth: 2,
  maxItems: 5,
  maxLength: 30,
} as const satisfies FormatOptions;
