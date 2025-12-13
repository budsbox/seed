import type { Except, LiteralUnion, OverrideProperties } from 'type-fest';

import type { Nil } from '@budsbox/lib-types';

import type {
  ParseOptions as LowLevelParseOptions,
  MimeTypeParsed,
  MultiParameterOption,
  ParameterName,
  ParameterValue,
  SerializableMimeTypeRecord,
  SerializableParameters,
  SubtypeTokens,
} from '@budsbox/parse-mime';

import type { MimeDbKey } from './mime-db.js';

/* ─────────────────────────────── Functions ──────────────────────────────── */

/* eslint-disable @typescript-eslint/prefer-function-type */

/**
 * Function interface for parsing MIME type inputs into a structured MIME type record.
 *
 * @param input - MIME type input to parse.
 * @returns A string when `input.serialize` is `true`, otherwise a {@link MimeTypeRecord}.
 * @typeParam TInput - The input shape to parse. It can be a raw MIME type string
 * or an object that configures parsing and serialization behavior.
 * @inline
 * @see {@link MimeTypeInput} for more details on the input types.
 */
export interface ParseFn {
  <TInput extends MimeTypeInput>(
    input: TInput,
  ): MimeTypeRecord<MultiParameter<TInput>>;
}

/**
 * Function interface for updating MIME type inputs.
 *
 * The function supports two overloads:
 * - Updating a single top-level component (type, subtype, or essence).
 * - Updating the parameter collection as a whole.
 *
 * @remarks The JSDoc for each overload is defined on the corresponding
 * call signature below.
 */
export interface UpdateFn {
  /**
   * Updates a single top-level component of a MIME type (type, subtype, or essence)
   * and returns an output of the same structural kind as the input.
   *
   * @param input - MIME type input to update.
   * @param key - The top-level component key to update.
   * @param value - The new value for the specified component.
   * @returns A normalized MIME type value with the requested update applied.
   * @typeParam TInput - The input shape to update.
   * @typeParam TKey - The name of the top-level component to update.
   */
  <TInput extends MimeTypeInput, TKey extends keyof UpdateValueMap>(
    input: TInput,
    key: TKey,
    value: UpdateValue<TKey>,
  ): OutputType<TInput>;

  /**
   * Updates the parameters of a MIME type and returns an output of the same
   * structural kind as the input.
   *
   * @param input - MIME type input to update.
   * @param value - Parameters to apply. Can be provided as a string or as a structured collection.
   * @returns A normalized MIME type value with updated parameters.
   * @typeParam TInput - The input shape to update.
   */
  <TInput extends MimeTypeInput>(
    input: TInput,
    value: ParametersUpdateInput,
  ): OutputType<TInput>;
}

export interface GetParameterFn {
  <TInput extends MimeTypeInput, TThrow extends boolean = false>(
    input: TInput,
    name: ParameterName,
    throwIfMissing?: TThrow,
  ):
    | (TThrow extends true ? never : null)
    | ParameterValue<MultiParameter<TInput>>;
}

/**
 * Function interface for removing a single parameter from a MIME type input.
 *
 * @param input - MIME type input from which to remove a parameter.
 * @param parameter - Name of the parameter to remove.
 * @returns A normalized MIME type value with the parameter removed, or the
 * unchanged value if the parameter was not present.
 * @typeParam TInput - The input shape to update.
 */
export interface RemoveParameterFn {
  <TInput extends MimeTypeInput>(
    input: TInput,
    name: ParameterName,
  ): OutputType<TInput>;
}

/**
 * Function interface for setting or updating a single parameter on a MIME type input.
 *
 * If the value is `null`, `undefined`, an empty string, or omitted, the parameter is removed instead.
 *
 * @param input - MIME type input to update.
 * @param parameter - Name of the parameter to set.
 * @param value - New parameter value. Falsy values (except `0` and `false`) remove the parameter.
 * @returns A normalized MIME type value with the parameter set or removed.
 * @typeParam TInput - The input shape to update.
 */
export interface SetParameterFn {
  <TInput extends MimeTypeInput>(
    input: TInput,
    name: ParameterName,
    value?: boolean | number | string | Nil,
  ): OutputType<TInput>;
}

/**
 * Function interface for serializing arbitrary MIME type input into its string form.
 *
 * This does not normalize the MIME type; it simply returns the existing string,
 * the `mimeType` field of an object, or serializes a {@link MimeTypeRecord}-like object.
 *
 * @param input - MIME type input to serialize.
 * @returns A MIME type string representation of the input.
 */
export interface SerializeFn {
  (input: MimeTypeInput): string;
}

/**
 * Normalizes a MIME type into its canonical string representation.
 *
 * This function first parses the input (ensuring consistent casing and structure)
 * and then serializes it back to a string. In particular, type and subtype are
 * always lowercased and parameters are normalized according to the parser rules.
 *
 * @param input - MIME type string or record-like value to normalize.
 * @returns A normalized MIME type string.
 * @remarks The key difference from the `serialize` function is that this function
 * always returns a normalized (parsed and then serialized back) MIME type string,
 * whereas the `serialize` function simply serializes a MIME type record to a string.
 */
export interface NormalizeFn {
  (input: MimeTypeInput): string;
}

/* ───────────────────────── MIME Type Definitions ────────────────────────── */

/**
 * Union of all MIME type strings known to `mime-db`.
 *
 * This is a finite set derived from {@link MimeDbKey}.
 */
export type WellKnownMimeType = MimeDbKey;

/**
 * Union of all top-level types (the part before `/`) that are present
 * in {@link WellKnownMimeType}.
 */
export type WellKnownTopLevelType =
  WellKnownMimeType extends `${infer TTopLevelType}/${string}` ? TTopLevelType
  : never;

export type MimeTypeString = LiteralUnion<string, WellKnownMimeType>;

/**
 * A string representing a top-level MIME type category.
 *
 * This is either one of the well-known top-level types (like `"text"` or `"image"`)
 * or any arbitrary string.
 */
export type TopLevelTypeString = LiteralUnion<string, WellKnownTopLevelType>;

/**
 * A string representing the essence of a MIME type, i.e. `type/subtype` without parameters.
 *
 * For well-known MIME types, this coincides with {@link WellKnownMimeType}.
 */
export type EssenceString = LiteralUnion<string, WellKnownMimeType>;

/**
 * An immutable, high-level representation of a parsed MIME type.
 *
 * The structure is based on {@link MimeTypeParsed} but:
 * - Uses a `ReadonlyMap` for `parameters` with read-only values.
 * - Exposes `subtypeTokens` as a read-only record.
 *
 * @interface
 * @typeParam TMultiParameter - Strategy for handling duplicate parameters.
 * See {@link MultiParameterOption} for more details on the available options.
 * @remarks foo
 */
export type MimeTypeRecord<
  TMultiParameter extends MultiParameterOption = MultiParameterOption,
> = Readonly<
  OverrideProperties<
    MimeTypeParsed,
    {
      parameters: ReadonlyMap<
        ParameterName,
        Readonly<ParameterValue<TMultiParameter>>
      >;
      subtypeTokens: Readonly<SubtypeTokens>;
    }
  >
>;

/* ───────────────────────── Functions Type Helpers ───────────────────────── */

/**
 * All supported input shapes for high-level MIME type helper functions.
 *
 * Inputs can be:
 * - A raw MIME type string.
 * - An object with a `mimeType` field and optional parsing options.
 * - A serializable MIME type record along with options.
 */
export type MimeTypeInput =
  | MimeTypeString
  | (MimeTypeSerializableInput & MimeTypeOptions)
  | (MimeTypeStringContainer & MimeTypeOptions);

/**
 * Object shape that carries a MIME type string under the `mimeType` property.
 *
 * Used to pass additional parsing options alongside the raw MIME type.
 */
export interface MimeTypeStringContainer {
  /**
   * MIME type string to parse or serialize.
   */
  readonly mimeType: MimeTypeString;
}

/**
 * Options that control MIME type parsing behavior at this module level.
 *
 * These options are derived from the low-level parser options with
 * parser-internal fields omitted.
 *
 * @interface
 * @typeParam TMultiParameter - Strategy for handling duplicate parameters.
 */
export interface MimeTypeOptions
  extends Except<LowLevelParseOptions<never>, 'grammarSource' | 'startRule'> {
  /**
   * Whether to return a string instead of a {@link MimeTypeRecord}.
   *
   * When `true`, helper functions like {@link UpdateFn `update`} or {@link SetParameterFn `setParameter`}
   * will return a serialized MIME type string.
   */
  readonly serialize?: boolean;
}

/**
 * Serializable object input for MIME type operations.
 *
 * @interface
 */
export type MimeTypeSerializableInput = SerializableMimeTypeRecord<true>;

/**
 * Output type helper that mirrors the structure of a given input.
 *
 * - For raw strings or inputs with `serialize: true`, the result is a string.
 * - For `serialize: false`, the result is a {@link MimeTypeRecord}.
 * - For object containers, the result follows the same pattern.
 *
 * @typeParam TInput - The input shape whose corresponding output type is inferred.
 */
export type OutputType<TInput extends MimeTypeInput = MimeTypeInput> =
  TInput extends MimeTypeString | { serialize: true } ? string
  : TInput extends { serialize: false } ? MimeTypeRecord<MultiParameter<TInput>>
  : TInput extends MimeTypeStringContainer ? string
  : MimeTypeRecord<MultiParameter<TInput>>;

type MultiParameter<TInput extends MimeTypeInput = MimeTypeInput> =
  TInput extends { readonly multiParameter?: infer TMultiParameter } ?
    TMultiParameter & MultiParameterOption
  : 'keep-first';

/**
 * Keys of a {@link MimeTypeRecord} that can be updated via {@link UpdateFn}
 * using the "component" overload.
 */
export type UpdatableKey = Extract<
  keyof MimeTypeRecord,
  'essence' | 'subtype' | 'type'
>;

interface UpdateValueMap {
  essence: EssenceString;
  parameters: ParametersUpdateInput;
  subtype: string;
  type: TopLevelTypeString;
}

/**
 * Value type accepted by {@link UpdateFn} when updating a specific key.
 *
 * @typeParam TKey - Target key to update.
 */
export type UpdateValue<TKey extends keyof UpdateValueMap> =
  UpdateValueMap[TKey];

/**
 * Input shape for updating parameters on a MIME type.
 *
 * Parameters can be provided as:
 * - A raw parameter string (e.g. `"charset=utf-8"`), or
 * - A structured set of {@link SerializableParameters serializable parameters}.
 */
export type ParametersUpdateInput = string | SerializableParameters<true>;
