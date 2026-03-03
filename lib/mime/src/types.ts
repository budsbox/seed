/**
 * @module types
 * This module provides type definitions and interfaces for working with MIME types.
 */

import type { Arrayable, Except, LiteralUnion } from 'type-fest';

import type { Infer } from '@budsbox/lib-types';

import type { MimeDbKey } from '#meta';
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

/**
 * @category General
 */
export type {
  MimeTypeEssence,
  SubtypeFacet as MimeTypeFacet,
  SubtypeSuffix as MimeTypeSuffix,
} from '@budsbox/parse-mime';

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
 * Immutable representation of a fully parsed MIME type with all its components.
 *
 * Extends {@link MimeTypeParsed} with readonly guarantees, making it suitable for
 * use as return type from parsing and manipulation functions. The {@link MimeTypeParsed.parameters parameters}
 * are stored in a {@link ReadonlyMap} to prevent mutations.
 *
 * @typeParam TMultiParameter - Strategy for handling duplicate parameter names.
 * Defaults to {@link MultiParameterOption}, allowing any strategy.
 * @see {@link MimeTypeParsed} — the base parsed MIME type structure.
 * @see {@link MultiParameterOption} — available strategies for duplicate parameters.
 * @example
 * ```typescript
 * // Basic MimeTypeRecord with default multi-parameter handling
 * const record: MimeTypeRecord = {
 *   essence: 'text/html',
 *   type: 'text',
 *   subtype: 'html',
 *   parameters: new Map([['charset', 'utf-8']]),
 * };
 * console.log(record.essence); // 'text/html'
 * console.log(record.parameters.get('charset')); // 'utf-8'
 * ```
 * @example
 * ```typescript
 * // MimeTypeRecord with 'list' strategy for collecting duplicate parameters
 * const listRecord: MimeTypeRecord<'list'> = {
 *   essence: 'multipart/form-data',
 *   type: 'multipart',
 *   subtype: 'form-data',
 *   parameters: new Map([['boundary', ['----first', '----second']]]),
 * };
 * ```
 * @category General
 */
export interface MimeTypeRecord<
  TMultiParameter extends MultiParameterOption = MultiParameterOption,
> extends Readonly<Omit<MimeTypeParsed, 'parameters'>> {
  parameters: ReadonlyMap<
    ParameterName,
    Readonly<ParameterValue<TMultiParameter>>
  >;
}

/* ───────────────────────── Functions Type Helpers ───────────────────────── */

/**
 * A string representing any MIME type, with autocompletion for well-known types.
 *
 * @preventInline
 * @example
 * ```typescript
 * const mime1: MimeTypeStringInput = 'application/json'; // well-known
 * const mime2: MimeTypeStringInput = 'application/custom'; // custom
 * ```
 *
 * Category Type Helpers
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
 */
export interface MimeTypeOptions
  extends Infer<
    Except<LowLevelParseOptions<never>, 'grammarSource' | 'startRule'> & {
      /**
       * Whether to return a string instead of a {@link MimeTypeRecord}.
       *
       * When `true`, helper functions like {@link .!update `update`} or {@link .!setParameter `setParameter`}
       * will return a serialized MIME type string.
       *
       * @defaultValue `false`
       */
      readonly serialize?: boolean;
    }
  > {}

/**
 * Object shape that carries a MIME type string under the `mimeType` property.
 *
 * Used to pass additional parsing options alongside the raw MIME type.
 *
 * @preventInline
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
 * @preventInline
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
export type MultiParameter<TInput extends MimeTypeInput = MimeTypeInput> =
  TInput extends { readonly multiParameter?: infer TMultiParameter } ?
    TMultiParameter & MultiParameterOption
  : 'keep-first';

/**
 * Keys of a {@link MimeTypeRecord} that can be updated via the {@link update} function.
 */
export type UpdateKey = Extract<keyof MimeTypeRecord, keyof UpdateValueMap>;

/**
 * Value type accepted by the {@link update} function when updating a specific key.
 *
 * @typeParam TKey - Target key to update.
 */
export type UpdateValue<TKey extends UpdateKey> = UpdateValueMap[TKey];

/**
 * Maps update keys to their corresponding value types for the {@link update} function.
 *
 * @internal
 */
export interface UpdateValueMap {
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
