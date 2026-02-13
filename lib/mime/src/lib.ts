import type {
  GetParameterFn,
  MimeTypeInput,
  MimeTypeOptions,
  MimeTypeRecord,
  MimeTypeSerializableInput,
  OutputType,
  ParametersUpdateInput,
  ParseFn,
  RemoveParameterFn,
  SerializeFn,
  SetParameterFn,
  UpdateFn,
  UpdateKey,
} from './types.js';

import {
  assertOptionalProp,
  assertProp,
  assertSome,
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
 * @see {@link ParseFn}
 */
export const parse: ParseFn = ((input) => {
  const [mimeType] = normalizeInput(input);

  return produceOutput(mimeType, mimeType);
}) as ParseFn;

/**
 * Updates a MIME type value or its parameters.
 *
 * Usage:
 * - `update(input, 'parameters', value)` — replace parameters with {@link ParametersUpdateInput a string or an object}.
 * - `update(input, key, value)` — update a single part (for example, `type`, `subtype`, `essence`, etc.).
 * - `update(input, value)` — shorthand to update only parameters.
 *
 * @param input - {@link MimeTypeInput MIME type input} to update.
 * @param rest - Update instructions.
 * @returns A string if the input is a string or string container, or if the `serialize` option set to `true`;
 * otherwise returns a {@link MimeTypeRecord MIME type record}.
 * @remarks Keep in mind that `update(input, value)` and `update(input, 'parameters', value)`
 * both fully replace the parameters part. If you need to update a sinle parameter, please use {@link setParameter}.
 * @see {@link UpdateFn}
 * @example
 * ```ts
 * update('text/html; charset=UTF-8', 'parameters', 'charset=iso-8859-1');
 * // => 'text/html;charset=iso-8859-1'
 * ```
 * @example
 * ```ts
 * const res = parse({ mimeType: 'image/svg+xml' });
 * const res2 = update(rec, 'subtype', 'png');
 * // res2.type === 'image'; res2.subtype === 'png'
 * ```
 * @example
 * ```ts
 * update('application/json', { q: '0.9' }); // => 'application/json;q=0.9'
 * update('application/json', [['foo', 'bar']]); // => 'application/json;foo=bar'
 * update('application/json;q=0.9', []); // => 'application/json'
 * ```
 */
export const update: UpdateFn = (
  input: MimeTypeInput,
  ...rest:
    | readonly [key: 'parameters', value: ParametersUpdateInput]
    | readonly [key: UpdateKey, value: string]
    | readonly [parameters: ParametersUpdateInput]
): string | MimeTypeRecord => {
  if (rest.length === 1) return update(input, 'parameters', rest[0]);

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
};

/**
 * Gets a parameter value by name.
 * When the parameter is absent, returns null unless `throwOnMissing` is true.
 *
 * @param input - {@link MimeTypeInput MIME type input} to retrieve a parameter from.
 * @param name - Parameter name to look up.
 * @param throwIfMissing - If true, throws when the parameter is missing.
 * @returns Parameter value or null.
 * @throws {RangeError} when the parameter is missing and `throwOnMissing` is true.
 * @see {@link SetParameterFn}
 * @example
 * ```ts
 * getParameter('text/html; charset=UTF-8', 'charset'); // 'utf-8'
 * getParameter({ mimeType: 'text/html; charset=UTF-8', keepCharsetCase: true }, 'charset'); // 'UTF-8'
 * getParameter('application/xml', 'charset'); // null
 * ```
 * @example
 * ```ts
 * const rec = parse({ mimeType: 'application/json; q=0.8' });
 * getParameter(rec, 'q'); // '0.8'
 * ```
 */
export const getParameter: GetParameterFn = ((input, name, throwIfMissing) => {
  const [mimeType, options] = normalizeInput(input);
  const parameterName = parseParameterName(name, options);
  if (mimeType.parameters.has(parameterName)) {
    return mimeType.parameters.get(parameterName)!;
  } else if (isTrue(throwIfMissing)) {
    throw new RangeError(
      `Parameter "${name}" is not found in MIME type "${serialize(mimeType)}"`,
    );
  }

  return null;
}) as GetParameterFn;

/**
 * Sets a parameter on a MIME type. If the value is empty or nullish, the parameter is removed.
 *
 * @param input - {@link MimeTypeInput MIME type input} to set a parameter on.
 * @param name - Parameter name to set.
 * @param value - Parameter value to set.
 * @returns A string if the input is a string or string container, or if the `serialize` option set to `true`;
 * otherwise returns a {@link MimeTypeRecord MIME type record}.
 * @see {@link SetParameterFn}
 * @example
 * ```ts
 * setParameter('text/html', 'charset', 'UTF-8'); // => 'text/html;charset=utf-8'
 * setParameter({ mimeType: 'text/html', keepCharsetCase: true }, 'charset', 'UTF-8'); // 'text/html;charset=UTF-8'
 * ```
 * @example
 * ```ts
 * const rec = parse({ mimeType: 'application/json; q=0.5', serialize: false });
 * const next = setParameter(rec, 'q', '0.9'); // serialize(next) === 'application/json;q=0.9'
 * ```
 * @example
 * ```ts
 * setParameter('image/png; q=0.7', 'q');
 * // => 'image/png'
 * ```
 */
export const setParameter: SetParameterFn = (input, name, value) => {
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
};

/**
 * Removes a parameter from a MIME type.
 *
 * Returns a string if the input is a string (or requested serialization); otherwise returns a record.
 *
 * @param input - {@link MimeTypeInput MIME type input} to remove a parameter from.
 * @param name - Parameter name to remove.
 * @returns A string if the input is a string or string container, or if the `serialize` option set to `true`;
 * otherwise returns a {@link MimeTypeRecord MIME type record}.
 * @see {@link RemoveParameterFn}
 * @example
 * ```ts
 * removeParameter('text/html; charset=utf-8', 'charset');
 * // => 'text/html'
 * ```
 * @example
 * ```ts
 * const rec = parse({ mimeType: 'image/webp; q=0.8', serialize: false });
 * const next = removeParameter(rec, 'q');
 * // serialize(next) === 'image/webp'
 * ```
 * @example
 * ```ts
 * removeParameter('application/json', 'charset');
 * // => 'application/json'
 * ```
 */
export const removeParameter: RemoveParameterFn = (input, name) => {
  const [mimeType, options] = normalizeInput(input);

  const parameterName = parseParameterName(name, options);

  if (!mimeType.parameters.has(parameterName)) {
    return produceOutput(input, mimeType);
  }

  const parameters = new Map(mimeType.parameters);
  parameters.delete(name);

  return produceOutput(input, { ...mimeType, parameters });
};

/**
 * Serializes a MIME type input to a string.
 *
 * If the input is already a string, it is returned unchanged.
 *
 * @param input - {@link MimeTypeInput MIME type input} to serialize.
 * @returns MIME type string.
 * @remarks Keep in mind that this function doesn't _normalize_ it's input by design (doesn't lowercase and so on).
 * Use {@link normalize} if you need normalization.
 * @example
 * ```ts
 * serialize('application/json; charset=utf-8'); // 'application/json; charset=utf-8'
 * ```
 * @example
 * ```ts
 * const rec = parse({ mimeType: 'text/html; Charset=UTF-8', serialize: false });
 * serialize(rec); // 'text/html;charset=utf-8'
 * ```
 */
export const serialize: SerializeFn = (input: MimeTypeInput): string =>
  isString(input) ? input
  : hasProp(input, 'mimeType', isString) ? input.mimeType
  : serializeMimeType(input as MimeTypeSerializableInput);

/**
 * Produces a canonical MIME type string from the input.
 *
 * Equivalent to parsing and then serializing.
 *
 * @param input - {@link MimeTypeInput MIME type input} to normalize.
 * @returns Canonical MIME type string.
 * @example
 * ```ts
 * normalize('Text/HTML; Charset=UTF-8'); // 'text/html;charset=utf-8'
 * ```
 * @example
 * ```ts
 * normalize({ type: 'IMAGE', subtype: 'PNG' }); // 'image/png'
 * ```
 */
export const normalize = (input: MimeTypeInput): string =>
  serializeMimeType(parse(input));

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
 * @param input - Any supported MIME type input shape (string, record, or object with options).
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
