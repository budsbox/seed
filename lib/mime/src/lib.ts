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
  UpdatableKey,
  UpdateFn,
} from './types.js';

import {
  hasProp,
  isBoolean,
  isNil,
  isString,
  isTrue,
} from '@budsbox/lib-es/guards';
import { fif } from '@budsbox/lib-es/logical';

import {
  type DefaultStartRule,
  type EssenceParsed,
  type MultiParameterOption,
  type ParseOptions,
  SyntaxError as ParseSyntaxError,
  type RuleResult,
  type StartRuleNames,
  parse as lowLevelParse,
  serializeMimeType,
  serializeParameters,
} from '@budsbox/parse-mime';

/**
 * The actual implementation of the {@link `ParseFn`} function.
 *
 * @param input - The {@link MimeTypeInput MIME type input} to parse.
 * @returns object.
 */
export const parse: ParseFn = ((input) => {
  const [mimeType] = unwrapInput(input);

  return produceOutput(mimeType, mimeType);
}) as ParseFn;

export const update: UpdateFn = (
  input: MimeTypeInput,
  ...rest:
    | readonly [key: 'parameters', value: ParametersUpdateInput]
    | readonly [key: UpdatableKey, value: string]
    | readonly [parameters: ParametersUpdateInput]
): string | MimeTypeRecord => {
  if (rest.length === 1) return update(input, 'parameters', rest[0]);

  const [mimeRecord, options] = unwrapInput(input);

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

    const parameters = wrappedParse(
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
    const parsed = wrappedParse(
      value,
      { ...options, startRule },
      `Failed to parse ${startRule}`,
    );
    // always update the type with essence for consistency
    const newEssence =
      startRule === 'essence' ?
        (parsed as EssenceParsed)
      : wrappedParse(
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

export const getParameter: GetParameterFn = ((input, name, throwOnMissing) => {
  const [mimeType, options] = unwrapInput(input);
  const parameterName = parseParameterName(name, options);
  if (mimeType.parameters.has(parameterName)) {
    return mimeType.parameters.get(parameterName)!;
  } else if (isTrue(throwOnMissing)) {
    throw new Error(
      `Parameter "${name}" is not found in MIME type "${serialize(mimeType)}"`,
    );
  }

  return null;
}) as GetParameterFn;

export const setParameter: SetParameterFn = (input, name, value) => {
  if (isNil(value) || value === '') {
    return removeParameter(input, name);
  }

  const [mimeType, options] = unwrapInput(input);
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

export const removeParameter: RemoveParameterFn = (input, name) => {
  const [mimeType, options] = unwrapInput(input);

  const parameterName = parseParameterName(name, options);

  if (!mimeType.parameters.has(parameterName)) {
    return produceOutput(input, mimeType);
  }

  const parameters = new Map(mimeType.parameters);
  parameters.delete(name);

  return produceOutput(input, { ...mimeType, parameters });
};

export const serialize: SerializeFn = (input: MimeTypeInput): string =>
  isString(input) ? input
  : hasProp(input, 'mimeType', isString) ? input.mimeType
  : serializeMimeType(input as MimeTypeSerializableInput);

export const normalize = (input: MimeTypeInput): string =>
  serializeMimeType(parse(input));

/* ────────────────────────── Optimization Helpers ────────────────────────── */

const recordSet = new WeakSet<MimeTypeRecord>();

const registerRecord = (mimeType: MimeTypeRecord): MimeTypeRecord => (
  recordSet.add(mimeType), mimeType
);

const isMimeRecord = (value: unknown): value is MimeTypeRecord =>
  (recordSet as Set<unknown>).has(value);

/* ──────────────────────────────── Helpers ───────────────────────────────── */

export const unwrapInput = (
  input: MimeTypeInput,
): [mimeType: MimeTypeRecord, options?: MimeTypeOptions | undefined] => {
  if (isString(input)) {
    return [wrappedSniff(input, undefined, 'Failed to sniff MIME type')];
  } else if (isMimeRecord(input)) {
    return [input];
  } else if (hasProp(input, 'mimeType', isString)) {
    const { mimeType, ...options } = input;
    return [
      wrappedSniff(mimeType, options, 'Failed to sniff MIME type'),
      options,
    ];
  } else {
    const { type, subtype, parameters, ...options } =
      input as MimeTypeSerializableInput;
    return [
      wrappedSniff(
        serializeMimeType({ type, subtype, parameters }),
        options,
        'Failed to sniff MIME type',
      ),
      options,
    ];
  }
};

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
  wrappedParse(
    name,
    { ...options, startRule: 'parameterName' },
    'Failed to parse parameter name',
  );

const wrappedParse = <
  TRule extends StartRuleNames = DefaultStartRule,
  TMultiParameter extends MultiParameterOption = 'keep-first',
>(
  input: string,
  customOptions: ParseOptions<TRule, TMultiParameter> | undefined,
  errorPrefix: string,
): RuleResult<TMultiParameter>[TRule] => {
  const source = '<input>';
  const options = {
    keepCharsetCase: false,
    ...customOptions,
    grammarSource: source,
  };

  try {
    return lowLevelParse(input, options);
  } catch (parseError) {
    if (parseError instanceof ParseSyntaxError) {
      throw new SyntaxError(
        `${errorPrefix}: ${parseError
          .format([{ source, text: input }])
          .replace('Error: Expected ', 'expected')}`,
      );
    }

    throw parseError;
  }
};

const wrappedSniff = <
  TRule extends StartRuleNames = DefaultStartRule,
  TMultiParameter extends MultiParameterOption = 'keep-first',
>(
  input: string,
  customOptions: ParseOptions<TRule, TMultiParameter> | undefined,
  errorPrefix: string,
): RuleResult<TMultiParameter>[TRule] =>
  wrappedParse(input, { sniff: true, ...customOptions }, errorPrefix);
