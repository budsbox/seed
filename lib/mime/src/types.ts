import type {
  Arrayable,
  Except,
  LiteralUnion,
  OverrideProperties,
} from 'type-fest';

import type { Infer, Nil } from '@budsbox/lib-types';

import type { MimeDb, MimeDbKey } from '#meta';
import type {
  ParseOptions as LowLevelParseOptions,
  MimeTypeEssence,
  MimeTypeParsed,
  MultiParameterOption,
  ParameterName,
  ParameterValue,
  SerializableMimeTypeRecord,
  SerializableParameters,
} from '@budsbox/parse-mime';

// Type exports
export type {
  MimeTypeEssence,
  SubtypeFacet as MimeTypeFacet,
  SubtypeSuffix as MimeTypeSuffix,
} from '@budsbox/parse-mime';

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

/**
 * Function interface for retrieving a parameter value from a MIME type input.
 *
 * @param input - MIME type input from which to get the parameter.
 * @param name - Name of the parameter to retrieve.
 * @param throwIfMissing - Whether to throw an error if the parameter is missing. Defaults to `false`.
 * @returns The parameter value, or {@link null} if not found and `throwIfMissing` is `false`.
 * @throws When `throwIfMissing` is `true` and the parameter is not found.
 * @typeParam TInput - The input shape to query.
 * @typeParam TThrow - Whether the function should throw when the parameter is missing.
 * @example
 * ```typescript
 * const value = getParameter('text/html; charset=utf-8', 'charset');
 * // value: 'utf-8'
 * ```
 * @example
 * ```typescript
 * const value = getParameter('text/html', 'charset');
 * // value: null
 * const valueThrow = getParameter('text/html', 'charset', true);
 * // throws error
 * ```
 */
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
  (input: MimeTypeEssence): MimeTypeEssence;
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

/**
 * Union of all subtypes (the part after `/`) that are present
 * in {@link WellKnownMimeType}.
 */
export type WellKnownSubtype =
  WellKnownMimeType extends infer TMimeType ?
    TMimeType extends `${string}/${infer TSubtype}` ?
      TSubtype
    : never
  : never;

/**
 * Union of all MIME type suffixes (like `+json`, `+xml`) found in {@link WellKnownMimeType}.
 *
 * These suffixes indicate the underlying format or structure of a MIME type.
 *
 * @example
 * ```typescript
 * const suffix: WellKnownSuffixes = '+json';
 * const xmlSuffix: WellKnownSuffixes = '+xml';
 * ```
 */
export type WellKnownSuffixes =
  | '+csv'
  | '+jws'
  | '+zstd'
  | Exclude<
      WellKnownMimeType extends infer TMimeType ?
        TMimeType extends `${string}+${infer TSuffix}` ?
          `+${TSuffix}`
        : never
      : never,
      '' | '+'
    >;

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
    }
  >
>;

/* ───────────────────────── Functions Type Helpers ───────────────────────── */

/**
 * A string representing any MIME type, with autocompletion for well-known types.
 *
 * @example
 * ```typescript
 * const mime1: MimeTypeStringInput = 'application/json'; // well-known
 * const mime2: MimeTypeStringInput = 'application/custom'; // custom
 * ```
 */
export type MimeTypeStringInput = LiteralUnion<string, WellKnownMimeType>;

/**
 * A string representing a top-level MIME type category.
 *
 * This is either one of the well-known top-level types (like `"text"` or `"image"`)
 * or any arbitrary string.
 */
export type TopLevelTypeInput = LiteralUnion<string, WellKnownTopLevelType>;

/**
 * A string representing a MIME subtype, with autocompletion for well-known subtypes.
 *
 * @example
 * ```typescript
 * const subtype1: SubtypeInput = 'json'; // well-known
 * const subtype2: SubtypeInput = 'custom-format'; // custom
 * ```
 */
export type SubtypeInput = LiteralUnion<string, WellKnownSubtype>;

/**
 * All supported input shapes for high-level MIME type helper functions.
 *
 * Inputs can be:
 * - A raw MIME type string.
 * - An object with a `mimeType` field and {@link MimeTypeOptions options}.
 * - A serializable MIME type record along with {@link MimeTypeOptions options}.
 */
export type MimeTypeInput =
  | MimeTypeStringInput
  | (MimeTypeSerializableInput & MimeTypeOptions)
  | (MimeTypeStringContainer & MimeTypeOptions);

/**
 * Represents the options for handling MIME types during parsing and manipulation.
 * This is mostly a subset of {@link LowLevelParseOptions} without the `grammarSource` and `startRule` fields.
 * Additionally, it allows specifying whether to return a string instead of a {@link MimeTypeRecord}.
 *
 * @interface
 */
export type MimeTypeOptions = Infer<
  Except<LowLevelParseOptions<never>, 'grammarSource' | 'startRule'> & {
    /**
     * Whether to return a string instead of a {@link MimeTypeRecord}.
     *
     * When `true`, helper functions like {@link UpdateFn `update`} or {@link SetParameterFn `setParameter`}
     * will return a serialized MIME type string.
     *
     * @defaultValue `false`
     */
    readonly serialize?: boolean;
  }
>;

/**
 * Object shape that carries a MIME type string under the `mimeType` property.
 *
 * Used to pass additional parsing options alongside the raw MIME type.
 */
export interface MimeTypeStringContainer {
  /**
   * MIME type string to parse or serialize.
   */
  readonly mimeType: MimeTypeStringInput;
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
  TInput extends MimeTypeStringInput | { serialize: true } ? string
  : TInput extends { serialize: false } ? MimeTypeRecord<MultiParameter<TInput>>
  : TInput extends MimeTypeStringContainer ? string
  : MimeTypeRecord<MultiParameter<TInput>>;

/**
 * Extracts the multi-parameter handling strategy from a {@link MimeTypeInput}.
 *
 * Defaults to `'keep-first'` if not explicitly specified in the input options.
 *
 * @internal
 * @typeParam TInput - The input shape from which to extract the multi-parameter option.
 */
type MultiParameter<TInput extends MimeTypeInput = MimeTypeInput> =
  TInput extends { readonly multiParameter?: infer TMultiParameter } ?
    TMultiParameter & MultiParameterOption
  : 'keep-first';

/**
 * Keys of a {@link MimeTypeRecord} that can be updated via the {@link UpdateFn `update` function}.
 */
export type UpdateKey = Extract<keyof MimeTypeRecord, keyof UpdateValueMap>;

/**
 * Value type accepted by the {@link UpdateFn `update` function} when updating a specific key.
 *
 * @typeParam TKey - Target key to update.
 */
export type UpdateValue<TKey extends UpdateKey> = UpdateValueMap[TKey];

/**
 * Maps update keys to their corresponding value types for the {@link UpdateFn `update` function}.
 *
 * @internal
 */
interface UpdateValueMap {
  essence: MimeTypeEssence;
  parameters: ParametersUpdateInput;
  subtype: string;
  type: TopLevelTypeInput;
}

/**
 * Input shape for updating parameters on a MIME type.
 *
 * Parameters can be provided as:
 * - A raw parameter string (e.g. `"charset=utf-8"`), or
 * - A structured set of {@link SerializableParameters serializable parameters}.
 */
export type ParametersUpdateInput = string | SerializableParameters<true>;

/**
 * A dictionary mapping MIME type essences to their alternative forms or aliases.
 *
 * Used during MIME type resolution to handle equivalent representations.
 *
 * @example
 * ```typescript
 * const aliases: EssenceAliasesMap = {
 *   'application/javascript': ['text/javascript', 'application/x-javascript']
 * };
 * ```
 */
export interface EssenceAliasesMap {
  readonly [essence: MimeTypeEssence]: Readonly<Arrayable<MimeTypeEssence>>;
}

/**
 * Configuration options for resolving MIME types with additional metadata.
 *
 * @example
 * ```typescript
 * const options: ResolveOptions = {
 *   db: customMimeDb,
 *   noDefaultCharset: true,
 *   aliases: {
 *     'text/javascript': 'application/javascript'
 *   }
 * };
 * ```
 */
export interface ResolveOptions {
  /**
   * Custom essence aliases to use during resolution.
   */
  readonly aliases?: EssenceAliasesMap;

  /**
   * Custom MIME database to use instead of the default.
   */
  readonly db?: MimeDb;

  /**
   * When `true`, prevents adding default charset parameters during resolution.
   *
   * @defaultValue `false`
   */
  readonly noDefaultCharset?: boolean;
}
