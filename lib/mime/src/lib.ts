/**
 * This module provides the core functionality for parsing, normalizing, and manipulating MIME types.
 *
 * @module
 * @importTarget .
 */

import type { Nil } from '@budsbox/lib-types';

import type {
  MimeTypeEssence,
  MimeTypeInput,
  MimeTypeOptions,
  MimeTypeRecord,
  MimeTypeSerializableInput,
  MultiParameter,
  OutputType,
  ParametersUpdateInput,
  UpdateKey,
  UpdateValue,
  UpdateValueMap,
} from './types.js';

import {
  assertAnyOf,
  assertOptionalProp,
  assertProp,
  assertSome,
  assertString,
  hasProp,
  isBoolean,
  isIterable,
  isNil,
  isObject,
  isString,
  isTrue,
  somePredicate,
} from '@budsbox/lib-es/guards';
import { fif } from '@budsbox/lib-es/logical';
import { ROMap } from '@budsbox/lib-es/map';
import { delimCase } from '@budsbox/lib-es/string';

import {
  type DefaultStartRule,
  type EssenceParsed,
  type MultiParameterOption,
  type ParameterName,
  type ParameterValue,
  type ParseOptions,
  SyntaxError as ParseSyntaxError,
  type RuleResult,
  type StartRuleNames,
  defaultStartRule,
  parse as lowLevelParse,
  serializeMimeType,
  serializeParameters,
} from '@budsbox/parse-mime';

/**
 * Parses an arbitrary {@link MimeTypeInput MIME type input} and returns a {@link MimeTypeRecord MIME type record}.
 *
 * @param input - {@link MimeTypeInput MIME type input} to parse.
 * @returns Parsed MIME type as a record.
 * @typeParam TInput - The input shape to parse. It can be a raw MIME type string
 * or an object that configures parsing and serialization behavior.
 * @see {@link MimeTypeInput} for more details on the input types.
 * @example
 * {@includeCode ./examples.ts#parse}
 */
export function parse<TInput extends MimeTypeInput>(
  input: TInput,
): MimeTypeRecord<MultiParameter<TInput>> {
  const [mimeType] = normalizeInput(input);
  return produceOutput(mimeType, mimeType) as MimeTypeRecord<
    MultiParameter<TInput>
  >;
}

/**
 * Updates a single top-level component of a MIME type (type, subtype, or essence)
 * and returns an output of the same structural kind as the input.
 *
 * @param input - {@link MimeTypeInput MIME type input} to update.
 * @param key - The top-level component key to update.
 * @param value - The new value for the specified component.
 * @returns A normalized MIME type value with the requested update applied.
 * @typeParam TInput - The input shape to update.
 * @typeParam TKey - The name of the top-level component to update.
 * @example
 * {@includeCode ./examples.ts#update.full}
 */
export function update<
  TInput extends MimeTypeInput,
  TKey extends keyof UpdateValueMap,
>(input: TInput, key: TKey, value: UpdateValue<TKey>): OutputType<TInput>;

/**
 * Updates the parameters of a MIME type and returns an output of the same
 * structural kind as the input.
 *
 * @param input - {@link MimeTypeInput MIME type input} to update.
 * @param value - Parameters to apply. Can be provided as a string or as a structured collection.
 * @returns A normalized MIME type value with updated parameters.
 * @typeParam TInput - The input shape to update.
 * @example
 * {@includeCode ./examples.ts#update.short}
 */
export function update<TInput extends MimeTypeInput>(
  input: TInput,
  value: ParametersUpdateInput,
): OutputType<TInput>;

export function update(
  input: MimeTypeInput,
  ...rest:
    | readonly [key: 'parameters', value: ParametersUpdateInput]
    | readonly [key: UpdateKey, value: string]
    | readonly [parameters: ParametersUpdateInput]
): string | MimeTypeRecord {
  if (rest.length === 1) return update(input, 'parameters', rest[0]);
  assertAnyOf(['parameters', 'type', 'subtype', 'essence'], rest[0], 'key');

  const [mimeRecord, options] = normalizeInput(input);

  if (rest[0] === 'parameters') {
    // deconstruct the value from arguments inside `if` to get the correct type
    const [, value] = rest;
    const valueString = fif(
      value,
      isString,
      // ensure parameters are prefixed with a semicolon for convenience
      (s) => s.replace(/^\s*;?\s*/, ';'),
      serializeParameters,
    );

    const parameters = customParse(
      valueString,
      {
        ...options,
        startRule: 'parameters',
      },
      `Failed to ${isString(value) ? 'parse' : 'normalize'} parameters`,
    );
    return produceOutput(input, { ...mimeRecord, parameters });
  } else {
    // deconstruct the value from arguments inside `if` to get the correct type
    const [startRule, value] = rest;
    const parsed = customParse(value, { ...options, startRule });
    // always update the type with essence for consistency
    const newEssence =
      startRule === 'essence' ?
        (parsed as EssenceParsed)
      : customParse(
          serializeMimeType({
            type: mimeRecord.type,
            subtype: mimeRecord.subtype,
            [startRule]: value,
          }),
          { ...options, startRule: 'essence' },
          "Failed to parse the new essence. This probably shouldn't happen, please file an issue at github",
        );
    return produceOutput(input, {
      ...mimeRecord,
      ...newEssence,
    });
  }
}

/**
 * Gets a parameter value by name.
 * When the parameter is absent, returns null unless `throwOnMissing` is true.
 *
 * @param input - {@link MimeTypeInput MIME type input} to retrieve a parameter from.
 * @param name - Parameter name to look up.
 * @param throwIfMissing - If true, throws when the parameter is missing.
 * @returns Parameter value or null.
 * @throws {@link TypeError} when the parameter is missing and `throwOnMissing` is true.
 * @typeParam TInput - the type of the {@link MimeTypeInput MIME type input} to get parameter from.
 * @typeParam TThrow - whether to throw if the parameter is missing.
 * @example
 * {@includeCode ./examples.ts#getParameter}
 */
export function getParameter<
  TInput extends MimeTypeInput,
  TThrow extends boolean = false,
>(
  input: TInput,
  name: ParameterName,
  throwIfMissing?: TThrow,
):
  | (TThrow extends true ? never : null)
  | ParameterValue<MultiParameter<TInput>>;
export function getParameter(
  input: MimeTypeInput,
  name: string,
  throwIfMissing = false,
): ParameterValue | null {
  const [mimeType, options] = normalizeInput(input);
  const parameterName = parseParameterName(name, options);
  if (mimeType.parameters.has(parameterName)) {
    return mimeType.parameters.get(parameterName) as string | string[];
  } else if (isTrue(throwIfMissing)) {
    throw new TypeError(
      `Parameter "${name}" is not found in MIME type "${serialize(mimeType)}"`,
    );
  }

  return null;
}

/**
 * Sets a parameter on a MIME type. If the value is empty or nullish, the parameter is removed.
 *
 * @param input - {@link MimeTypeInput MIME type input} to set a parameter on.
 * @param name - Parameter name to set.
 * @param value - Parameter value to set.
 * @returns A string if the input is a string or string container, or if the `serialize` option set to `true`;
 * otherwise returns a {@link MimeTypeRecord MIME type record}.
 * @typeParam TInput - The input shape to update.
 * @example
 * {@includeCode ./examples.ts#setParameter}
 */
export function setParameter<TInput extends MimeTypeInput>(
  input: TInput,
  name: ParameterName,
  value?: boolean | number | string | Nil,
): OutputType<TInput>;
export function setParameter(
  input: MimeTypeInput,
  name: ParameterName,
  value?: boolean | number | string | Nil,
): string | MimeTypeRecord {
  if (isNil(value) || value === '') {
    return removeParameter(input, name);
  }

  const [mimeType, options] = normalizeInput(input);
  const parameterName = parseParameterName(name, options);
  const parameterValue =
    (
      parameterName === 'charset' &&
      !hasProp(options, 'keepCharsetCase', isTrue)
    ) ?
      String(value).toLowerCase()
    : String(value);
  const parameters = new Map(mimeType.parameters);
  parameters.set(parameterName, parameterValue);
  return produceOutput(input, { ...mimeType, parameters });
}

/**
 * Removes a parameter from a MIME type.
 *
 * Returns a string if the input is a string (or requested serialization); otherwise returns a record.
 *
 * @param input - {@link MimeTypeInput MIME type input} to remove a parameter from.
 * @param name - Parameter name to remove.
 * @returns A string if the input is a string or string container, or if the `serialize` option set to `true`;
 * otherwise returns a {@link MimeTypeRecord MIME type record}.
 * @typeParam TInput - The input shape to remove parameter from.
 * @example
 * {@includeCode ./examples.ts#removeParameter}
 */
export function removeParameter<TInput extends MimeTypeInput>(
  input: TInput,
  name: ParameterName,
): OutputType<TInput>;
export function removeParameter(
  input: MimeTypeInput,
  name: ParameterName,
): OutputType {
  const [mimeType, options] = normalizeInput(input);

  const parameterName = parseParameterName(name, options);

  if (!mimeType.parameters.has(parameterName)) {
    return produceOutput(input, mimeType);
  }

  const parameters = new Map(mimeType.parameters);
  parameters.delete(name);

  return produceOutput(input, { ...mimeType, parameters });
}

/**
 * Serializes a {@link MimeTypeInput MIME type input} to a string.
 *
 * If the input is already a string, it is returned unchanged.
 *
 * @param input - {@link MimeTypeInput MIME type input} to serialize.
 * @returns MIME type string.
 * @remarks Keep in mind that **this function doesn't {@link normalize} it's input** by design (doesn't lowercase and so on).
 * Use {@link normalize} if you need normalization (indeed).
 * @example
 * {@includeCode ./examples.ts#serialize}
 */
export const serialize = (input: MimeTypeInput): string =>
  isString(input) ? input
  : hasProp(input, 'mimeType', isString) ? input.mimeType
  : serializeMimeType(input as MimeTypeSerializableInput);

/** @ignore */
export function normalize(input: MimeTypeEssence): MimeTypeEssence;

/**
 * Produces a canonical MIME type string from the input.
 *
 * Equivalent to parsing and then serializing.
 *
 * @param input - {@link MimeTypeInput MIME type input} to normalize.
 * @returns Canonical MIME type string.
 * @example
 * {@includeCode ./examples.ts#normalize}
 */
export function normalize(input: MimeTypeInput): string;
export function normalize(input: MimeTypeInput): string {
  return serializeMimeType(parse(input));
}

/* ────────────────────────── Optimization Helpers ────────────────────────── */

const recordSet = new WeakSet<MimeTypeRecord>();

const registerRecord = (mimeType: MimeTypeRecord): MimeTypeRecord => {
  const readonlyMimeType = Object.freeze({
    ...mimeType,
    parameters: new ROMap(mimeType.parameters),
  });

  recordSet.add(readonlyMimeType);
  return readonlyMimeType;
};

const isMimeRecord = (value: unknown): value is MimeTypeRecord =>
  (recordSet as Set<unknown>).has(value);

/* ──────────────────────────────── Helpers ───────────────────────────────── */

/**
 * Normalizes a {@link MimeTypeInput} into a parsed {@link MimeTypeRecord} plus (optional) {@link MimeTypeOptions}.
 *
 * This is an internal helper used by high-level operations to accept the full input union and
 * get a canonical parsed record for further work.
 *
 * Behavior by input shape:
 * - `string` → sniff-parse the string and return `[record]`.
 * - previously produced {@link MimeTypeRecord} → returned as-is (no reparse).
 * - `{ mimeType: string, ...options }` → sniff-parse `mimeType` using `options`, return `[record, options]`.
 * - serializable record-like input → serialize to a string, sniff-parse using `options`,
 *   return `[record, options]`.
 *
 * @param input - Any supported {@link MimeTypeInput MIME type input} shape (string, record, or object with options).
 * @returns A tuple of `[mimeTypeRecord, options?]`, where `options` are present only when provided on input objects.
 * @throws {SyntaxError} If the MIME type cannot be parsed/sniffed.
 */
export const normalizeInput = (
  input: MimeTypeInput,
): [mimeType: MimeTypeRecord, options: MimeTypeOptions] => {
  assertSome(input, 'input', isString, isObject);

  const defaultOptions: MimeTypeOptions = {
    keepCharsetCase: false,
  };
  if (isMimeRecord(input)) {
    return [input, defaultOptions];
  } else if (isString(input)) {
    return [customSniff(input, defaultOptions), defaultOptions];
  } else if (hasProp(input, 'mimeType', isString)) {
    const { mimeType, ...userOptions } = input;
    const options = { ...defaultOptions, ...userOptions };
    assertOptionalProp(input, 'serialize', isBoolean, 'input');
    return [customSniff(mimeType, options), options];
  } else {
    assertProp(input, 'type', isString, 'input');
    assertProp(input, 'subtype', isString, 'input');
    assertOptionalProp(
      input,
      'parameters',
      somePredicate(isObject, isIterable),
    );
    assertOptionalProp(input, 'serialize', isBoolean, 'input');
    const { type, subtype, parameters, ...userOptions } = input;
    const options = { ...defaultOptions, ...userOptions };
    return [
      customSniff(serializeMimeType({ type, subtype, parameters }), options),
      options,
    ];
  }
};

/**
 * Produces the final output form given the original input and a parsed record.
 *
 * - Returns a string if the input is a string, has a `mimeType` string, or explicitly requests serialization.
 * - Otherwise returns a record suitable for reuse without re-parsing.
 *
 * @param input - Original input used to determine the desired output form.
 * @param record - Parsed MIME type record to output.
 * @returns MIME type as string or record, depending on the input.
 * @typeParam TInput - Mirrors the input shape to decide the output type.
 */
export function produceOutput<TInput extends MimeTypeInput>(
  input: TInput,
  record: MimeTypeRecord,
): OutputType<TInput>;
export function produceOutput(
  input: MimeTypeInput,
  record: MimeTypeRecord,
): OutputType {
  const shouldOutputString =
    isString(input) ||
    (hasProp(input, 'serialize', isBoolean) ?
      input.serialize
    : hasProp(input, 'mimeType', isString));

  return shouldOutputString ?
      serializeMimeType(record)
    : registerRecord(record);
}

const parseParameterName = (name: string, options?: MimeTypeOptions): string =>
  customParse(
    name,
    { ...options, startRule: 'parameterName' },
    'Failed to parse parameter name',
  );

const customParse = <
  TRule extends StartRuleNames = DefaultStartRule,
  TMultiParameter extends MultiParameterOption = 'keep-first',
>(
  input: string,
  options: ParseOptions<TRule, TMultiParameter> | undefined,
  errorPrefix: string = `Failed to parse ${delimCase(options?.startRule ?? defaultStartRule, ' ')}`,
): RuleResult<TMultiParameter>[TRule] => {
  assertString(input);
  const source = '<input>';

  try {
    return lowLevelParse(input, {
      ...options,
      grammarSource: source,
    });
  } catch (parseError) {
    if (parseError instanceof ParseSyntaxError) {
      throw new SyntaxError(
        `${errorPrefix}: ${parseError
          .format([{ source, text: input }])
          .replace('Error: Expected', 'expected')}`,
      );
    }

    throw parseError;
  }
};

const customSniff = <
  TRule extends StartRuleNames = DefaultStartRule,
  TMultiParameter extends MultiParameterOption = 'keep-first',
>(
  input: string,
  customOptions: ParseOptions<TRule, TMultiParameter> | undefined,
  errorPrefix: string = 'Failed to sniff MIME type',
): RuleResult<TMultiParameter>[TRule] =>
  customParse(input, { sniff: true, ...customOptions }, errorPrefix);
