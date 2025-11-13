import type { Nil } from '@budsbox/lib-types';

import type {
  MimeTypeInput,
  MimeTypeRecord,
  ParametersUpdateInput,
  UpdatableKey,
} from './types.js';

import { isNil, isString } from '@budsbox/lib-es/guards';

import {
  type EssenceParsed,
  SyntaxError as ParseSyntaxError,
  parse,
  serializeMimeType,
  serializeParameters,
  sniff,
} from '@budsbox/parse-mime';

const recordSet = new WeakSet<MimeTypeRecord>();

const isMimeRecord = (value: unknown): value is MimeTypeRecord =>
  (recordSet as Set<unknown>).has(value);

export const create = (input: MimeTypeInput): MimeTypeRecord => {
  const mimeType =
    isMimeRecord(input) ? input : (
      sniff(isString(input) ? input : serializeMimeType(input))
    );

  recordSet.add(mimeType);
  return mimeType;
};

export function update(
  mimeType: MimeTypeInput,
  essence: string,
): MimeTypeRecord;
export function update(
  mimeType: MimeTypeInput,
  key: 'parameters',
  value: ParametersUpdateInput,
): MimeTypeRecord;
export function update(
  mimeType: MimeTypeInput,
  key: UpdatableKey,
  value: string,
): MimeTypeRecord;
export function update(
  mimeTypeInput: MimeTypeInput,
  ...rest:
    | readonly [essence: string]
    | readonly [key: 'parameters', value: ParametersUpdateInput]
    | readonly [key: UpdatableKey, value: string]
): MimeTypeRecord {
  const mimeType = create(mimeTypeInput);
  if (rest.length === 1) {
    return update(mimeType, 'essence', rest[0]);
  } else if (rest[0] === 'parameters') {
    const input = rest[1];
    const isInputString = isString(input);
    const inputString =
      isInputString ?
        // ensure parameters are prefixed with a semicolon for convenience
        input.replace(/^\s*;?\s*/, ';')
      : serializeParameters(input);
    try {
      const parameters = parse(inputString, { startRule: 'parameters' });
      return { ...mimeType, parameters };
    } catch (err) {
      if (err instanceof ParseSyntaxError) {
        throw new SyntaxError(
          `Failed to ${isInputString ? 'parse' : 'normalize'} parameters:\n${err.format(
            [{ source: '<input>', text: inputString }],
          )}`,
        );
      }

      throw err;
    }
  } else {
    const [key, value] = rest;
    try {
      const parsed = parse(value, { startRule: key });
      const newEssence =
        key === 'essence' ?
          (parsed as EssenceParsed)
          // update type or subtype via essence update to ensure consistency
        : parse(
            serializeMimeType({
              type: mimeType.type,
              subtype: mimeType.subtype,
              [key]: value,
            }),
            { startRule: 'essence' },
          );
      return {
        ...mimeType,
        ...newEssence,
      };
    } catch (err) {
      if (err instanceof ParseSyntaxError) {
        throw new SyntaxError(
          `Failed to parse ${key}:\n${err.format([{ source: '<input>', text: value }])}`,
        );
      }
      throw err;
    }
  }
}

export const removeParameter = (
  mimeInput: MimeTypeInput,
  name: string,
): MimeTypeRecord => {
  const mimeType = create(mimeInput);
  if (!mimeType.parameters.has(name)) {
    return mimeType;
  }

  const parameters = new Map(mimeType.parameters);
  parameters.delete(name);

  return { ...mimeType, parameters };
};

export const setParameter = (
  input: MimeTypeInput,
  name: string,
  value?: number | string | Nil,
): MimeTypeRecord => {
  if (isNil(value) || value === '') {
    return removeParameter(input, name);
  }

  const mimeType = create(input);
  const parameters = new Map(mimeType.parameters);
  parameters.set(name, String(value));
  return { ...mimeType, parameters };
};

export const serialize = (input: MimeTypeInput): string =>
  serializeMimeType(create(input));
