/**
 * @module @budsbox/parse-mime/types
 * @file Type definitions for MIME type parsing functionality.
 *
 * This module provides TypeScript type definitions for a MIME type parser generated with Peggy.
 * The parser implementation is imported from '#parser' and this file provides a type-safe
 * interface for working with MIME type parsing operations, including parsing options,
 * parse results, and structured representations of MIME types.
 */

import type { Merge } from 'type-fest';

import type {
  ConditionalReadonly,
  ConditionalReadonlyCollection,
  Undef,
} from '@budsbox/lib-types';

import type * as Parser from '#parser';

export type { Parser };

/**
 * Configuration options for parsing MIME types.
 *
 * @typeParam TRule - The start rule to use for parsing.
 * @typeParam TMultiParameter - Strategy for handling duplicate parameters.
 */
export interface ParseOptions<
  TRule extends StartRuleNames = StartRuleNames,
  TMultiParameter extends MultiParameterOption = MultiParameterOption,
> extends Pick<Parser.ParseOptions<TRule>, 'grammarSource' | 'tracer'> {
  /**
   * Whether to keep the case of `charset` parameter value.
   * When `true`, the parameter value will be returned as-is, preserving the case.
   * When `false`, the parameter value will be converted to lowercase.
   * Defaults to `false` in semantic mode and `true` in sniff mode.
   *
   * @remarks Though the RFC 2046 does not strictly establish
   * the case insensitivity of the `charset` parameters value _in all the cases_,
   * RFC 9110 indicates the lower-cased variant as "preferred",
   * so it's probably safe to assume that the parameter value should be treated as case-insensitive
   * in semantic mode (hence lower-cased by default).
   * @see {@link https://datatracker.ietf.org/doc/html/rfc2046#section-4.1.2 RFC 2046: Charset Parameter}
   * @see {@link https://datatracker.ietf.org/doc/html/rfc9110#name-media-type RFC 9110: Media Type}
   */
  readonly keepCharsetCase?: boolean;

  /**
   * Strategy for handling parameters that appear multiple times with the same name.
   * Determines whether to keep first, last or collect all values.
   *
   * @see {@link MultiParameterOption} — for more details on the different strategies.
   */
  readonly multiParameter?: TMultiParameter;

  /**
   * Whether to enforce strict naming conventions for MIME type components, as defined in RFC 6838.
   * When enabled, validates parameter names and other identifiers against standards.
   * It requires the first character of a type, subtype, or parameter name to be an alphanumeric character.
   * Enabled by default.
   * Disabled in sniff mode.
   *
   * @see {@link https://datatracker.ietf.org/doc/html/rfc6838#section-4.2 RFC 6838: Naming Requirements}
   * — for the syntax of restricted names as defined by IETF standards for IANA-registered types.
   */
  readonly restrictNames?: boolean;

  /**
   * Whether to perform "sniffing" - a lenient parsing mode that attempts to
   * extract valid MIME type information even from malformed input.
   *
   * @see {@link https://mimesniff.spec.whatwg.org/#parsing-a-mime-type MIME Sniffing Standard: Parsing a MIME type}
   * — for the description of the full MIME type parsing algorithm used in WHATWG MIME Sniffing Standard.
   */
  readonly sniff?: boolean;

  /**
   * The grammar rule to start parsing from. Different rules allow parsing
   * different components of a MIME type independently.
   *
   * @see {StartRuleNames}
   */
  readonly startRule?: TRule;

  /**
   * Optional tracer for debugging parser execution.
   * It redeclared as readonly to avoid triggering of the `@typescript-eslint/prefer-readonly-parameter-types` rule.
   */
  readonly tracer?: Readonly<Parser.ParserTracer>;

  /**
   * Whether to trim whitespace from the input before parsing.
   *
   * Disabled by default.
   * Enabled in sniff mode.
   *
   * @remarks it applies only when the start rule is 'mimeType'.
   */
  readonly trim?: boolean;
}

/**
 * Union type of all available start rule names in the parser.
 * Start rules define different entry points for parsing, allowing you to parse
 * different MIME type components independently.
 */
export type StartRuleNames = Parser.StartRuleNames;

/**
 * The default start rule used when no explicit start rule is specified.
 * This represents the primary entry point for parsing complete MIME types, `'mimeType'`.
 */
export type DefaultStartRule = NonNullable<Parser.ParseOptions['startRule']>;

/**
 * Strategy for handling multiple occurrences of the same parameter name in a MIME type.
 *
 * - `'keep-first'`: When a parameter appears multiple times, only the first value is kept. This is the default strategy.
 * - `'keep-last'`: When a parameter appears multiple times, only the last value is kept
 * - `'list'`: When a parameter appears multiple times, all values are collected in an array
 */
export type MultiParameterOption = 'keep-first' | 'keep-last' | 'list';

/**
 * Name of a MIME type parameter (e.g., "charset" in "text/html; charset=utf-8").
 * Parameter names are case-insensitive, according to MIME type specifications.
 * RFC 6838 also requires parameter names to start with a letter or a digit.
 *
 * @see {@link https://datatracker.ietf.org/doc/html/rfc6838#section-4.3 RFC 6838: Parameter Requirements}
 * @see {@link https://mimesniff.spec.whatwg.org/#parsing-a-mime-type MIME Sniffing Standard: Parsing a MIME type}
 */
export type ParameterName = string;

/**
 * Value(s) associated with a MIME type parameter.
 *
 * @typeParam TMultiParameter - Strategy for handling duplicate parameters
 * - When `TMultiParameter` is `'list'`: can be a single string or array of strings
 * - When `TMultiParameter` is not `'list'`: always a string
 * @typeParam TReadOnly - Whether the value should be marked as readonly (useful in function signatures). Defaults to `false`.
 * @see {@link MultiParameterOption}
 * — for more details on the different strategies
 * @see {@link https://datatracker.ietf.org/doc/html/rfc9110#name-parameters RFC 9110: Parameters}
 * — for the syntax of parameter values as it's defined by IETF standards.
 * @see {@link https://datatracker.ietf.org/doc/html/rfc9110#name-tokens RFC 9110: Tokens}
 * — for the syntax of unquoted parameter values as it's defined by IETF standards.
 * @see {@link https://datatracker.ietf.org/doc/html/rfc9110#name-quoted-strings RFC 9110: Quoted Strings}
 * — for the syntax of quoted parameter values as it's defined by IETF standards.
 * @see {@link https://fetch.spec.whatwg.org/#collect-an-http-quoted-string Fetch Standard: Collect an HTTP quoted string}
 * — for the description of collecting quoted strings algorithm used in WHATWG MIME Sniffing Standard.
 */
export type ParameterValue<
  TMultiParameter extends MultiParameterOption = MultiParameterOption,
> = ('list' extends TMultiParameter ? string[] : never) | string;

/**
 * Represents a key-value pair for a parameter in a tuple format.
 * - The first element represents the name of the parameter.
 * - The second element represents the value associated with the parameter.
 *
 * @typeParam TMultiParameter - Strategy for handling duplicate parameters.
 * @typeParam TReadOnly - Whether the value should be marked as readonly (useful in function signatures). Defaults to `false`.
 * @see {@link MultiParameterOption } — for more details on the different strategies.
 * @see {@link ParameterName}
 * @see {@link ParameterValue}
 */
export type ParameterEntry<
  TMultiParameter extends MultiParameterOption = MultiParameterOption,
  TReadOnly extends boolean = false,
> = ConditionalReadonly<
  [
    ParameterName,
    ConditionalReadonly<ParameterValue<TMultiParameter>, TReadOnly>,
  ],
  TReadOnly
>;

/**
 * A collection of parsed MIME type parameters as a map from parameter names to values.
 * The structure depends on the `multiParameter` option used during parsing.
 *
 * @typeParam TMultiParameter - Strategy for handling duplicate parameters
 * @see {@link MultiParameterOption } — for more details on the different strategies.
 * @see {@link https://datatracker.ietf.org/doc/html/rfc6838#section-4.3 RFC 6838: Parameter Requirements}
 * — for the syntax of parameter names as it's defined by IETF standards.
 * @see {@link https://datatracker.ietf.org/doc/html/rfc9110#name-parameters RFC 9110: Parameters}
 * — for the syntax of parameter values as it's defined by IETF standards.
 * @see {@link https://datatracker.ietf.org/doc/html/rfc9110#name-tokens RFC 9110: Tokens}
 * — for the syntax of unquoted parameter values as it's defined by IETF standards.
 * @see {@link https://datatracker.ietf.org/doc/html/rfc9110#name-quoted-strings RFC 9110: Quoted Strings}
 * — for the syntax of quoted parameter values as it's defined by IETF standards.
 * @see {@link https://mimesniff.spec.whatwg.org/#parsing-a-mime-type MIME Sniffing Standard: Parsing a MIME type}
 * — for the description of parameter parsing algorithm used in WHATWG MIME Sniffing Standard.
 */
export type ParametersParsed<
  TMultiParameter extends MultiParameterOption = MultiParameterOption,
> = Map<ParameterName, ParameterValue<TMultiParameter>>;

/**
 * The facet prefix indicating the subtype's registration tree, e.g., `vnd.` in `application/vnd.example`.
 * Common facets include `vnd.` (vendor), `prs.` (personal), `x.` (unregistered), etc.
 */
export type SubtypeFacet = `${string}.`;

/**
 * The suffix of the subtype indicating the underlying structure, e.g., `+xml` in `image/svg+xml`.
 * Suffixes like `+xml`, `+json` indicate the format's syntax.
 *
 * @see {@link https://datatracker.ietf.org/doc/html/rfc6838#section-4.2.8 RFC 6838: Structured Syntax Name Suffixes}
 */
export type SubtypeSuffix = `+${string}`;

/**
 * The complete essence string (e.g., "text/html", "image/svg+xml").
 * This is the type and subtype joined with a slash, without parameters.
 *
 * @see {@link https://mimesniff.spec.whatwg.org/#mime-type-essence MIME Sniffing Standard: The essence of a MIME type}
 * — for the description of the essence in WHATWG MIME Sniffing Standard.
 */
export type MimeTypeEssence = `${string}/${string}`;

/**
 * A parsed MIME subtype with its tokenized components.
 *
 * @see {@link https://datatracker.ietf.org/doc/html/rfc6838#section-4.2 RFC 6838: Naming Requirements}
 * — for the syntax of subtype as defined by IETF standards.
 * @see {@link https://datatracker.ietf.org/doc/html/rfc6838#section-4.2.8 RFC 6838: Structured Syntax Name Suffixes}
 * — for the syntax of subtype suffixes as defined by IETF standards.
 */
export interface SubtypeParsed {
  /**
   * The complete subtype string as it appears in the MIME type (e.g., "svg+xml" in "image/svg+xml").
   */
  subtype: string;

  /**
   * The registration facet prefix (e.g., "vnd." in "application/vnd.example").
   */
  facet?: SubtypeFacet;

  /**
   * The structrured syntax name suffix (e.g., "+xml" in "image/svg+xml").
   */
  suffix?: SubtypeSuffix;
}

/**
 * Parsed MIME type essence (type/subtype combination) with structured components.
 * The essence is the MIME type without any parameters.
 */
export interface EssenceParsed extends SubtypeParsed {
  /**
   * The complete essence string (e.g., "text/html", "image/svg+xml").
   * This is the type and subtype joined with a slash, without parameters.
   *
   * @see {MimeTypeEssence}
   */
  essence: MimeTypeEssence;

  /**
   * The top-level type category (e.g., "text" in "text/html", "image" in "image/svg+xml", etc.).
   *
   * @see {@link https://datatracker.ietf.org/doc/html/rfc6838#section-4.2 RFC 6838: Naming Requirements}
   * — for the syntax of type as defined by IETF standards.
   */
  type: string;
}

/**
 * A complete parsed MIME type including the essence and all parameters.
 * This is the primary result type returned when parsing a full MIME type string.
 *
 * @typeParam TMultiParameter - Strategy for handling duplicate parameters
 * @see {@link MultiParameterOption } — for more details on the different strategies.
 * @see {@link https://datatracker.ietf.org/doc/html/rfc9110#name-media-type RFC 9110: Media Type}
 * — for the syntax of media types as defined by IETF standards.
 * @see {@link https://datatracker.ietf.org/doc/html/rfc6838#section-4.2 RFC 6838: Naming Requirements}
 * — for the syntax of type and subtype as defined by IETF standards for IANA-registered types.
 * @see {@link https://mimesniff.spec.whatwg.org/#parsing-a-mime-type MIME Sniffing Standard: Parsing a MIME type}
 * — for the description of the full MIME type parsing algorithm used in WHATWG MIME Sniffing Standard.
 */
export interface MimeTypeParsed<
  TMultiParameter extends MultiParameterOption = MultiParameterOption,
> extends EssenceParsed {
  /**
   * Map of all parameters associated with this MIME type.
   * For example, in `text/html; charset=utf-8; boundary=----boundary`,
   * this would contain entries for "charset" and "boundary".
   */
  parameters: ParametersParsed<TMultiParameter>;
}

/**
 * Map of parse results for each available start rule in the parser.
 * Defines the return type when parsing with different entry points.
 *
 * @typeParam TMultiParameter - Strategy for handling duplicate parameters
 * @see {@link MultiParameterOption}
 * @see {@link StartRuleNames}
 */
export interface RuleResult<
  TMultiParameter extends MultiParameterOption = MultiParameterOption,
> {
  /**
   * Result when parsing with the `essence` start rule.
   * Returns the MIME type and subtype without parameters.
   *
   * @see {@link EssenceParsed}
   */
  essence: EssenceParsed;

  /**
   * Result when parsing with the `httpToken` start rule.
   * Returns a valid HTTP token string according both to RFC 9110 and WHATWG MIME Sniffing Standard.
   *
   * @see {@link https://datatracker.ietf.org/doc/html/rfc9110#name-tokens RFC 9110: Tokens}
   * — for the syntax of HTTP tokens as defined by IETF standards.
   * @see {@link https://mimesniff.spec.whatwg.org/#http-token-code-point MIME Sniffing Standard: HTTP Token Code Point}
   * — for the description of the HTTP Token used in WHATWG MIME Sniffing Standard.
   */
  httpToken: string;

  /**
   * Result when parsing with the `mimeType` start rule (default).
   * Returns a complete MIME type with all components and parameters.
   *
   * @see {@link MimeTypeParsed}
   */
  mimeType: MimeTypeParsed<TMultiParameter>;

  /**
   * Result when parsing with the `parameter` start rule.
   * Returns a single parameter as a name-value tuple.
   *
   * @see {@link ParameterEntry}
   */
  parameter: ParameterEntry<TMultiParameter>;

  /**
   * Result when parsing with the `parameterName` start rule.
   * Returns only the parameter name.
   */
  parameterName: ParameterName;

  /**
   * Result when parsing with the `parameters` start rule.
   * Returns all parameters as a map.
   *
   * @see {@link ParametersParsed}
   */
  parameters: ParametersParsed<TMultiParameter>;

  /**
   * Result when parsing with the `subtype` start rule.
   * Returns just the subtype component with its tokens.
   *
   * @see {@link SubtypeParsed}
   */
  subtype: SubtypeParsed;

  /**
   * Result when parsing with the `subtypeName` start rule.
   * Returns only the base name of the subtype.
   */
  subtypeName: string;

  /**
   * Result when parsing with the `subtypeSuffix` start rule.
   * Returns only the suffix portion of the subtype (e.g., `'+xml'`).
   *
   * @see {@link SubtypeSuffix}
   */
  subtypeSuffix: SubtypeSuffix;

  /**
   * Result when parsing with the 'tree' start rule.
   * Returns only the tree prefix of the subtype (e.g., `'vnd.'`).
   *
   * @see {@link SubtypeFacet}
   */
  tree: SubtypeFacet;

  /**
   * Result when parsing with the 'type' start rule.
   * Returns only the top-level type category.
   */
  type: string;
}

/* eslint-disable @typescript-eslint/prefer-function-type */

/**
 * Defines a function interface to parse a given input string based on specific rules and options.
 *
 * This parsing function processes the input using a defined start rule and configuration options,
 * producing a result associated with the selected rule and multi-parameter behavior.
 *
 * @param input - The input string to parse.
 * @param options - Optional configuration object for parsing, which specifies the start rule and behavior for multi-parameters.
 * @returns The parsing result associated with the provided start rule and multi-parameter specification.
 * @typeParam TRule - Specifies the rule name type used as the starting rule for parsing. Defaults to `DefaultStartRule`.
 * @typeParam TMultiParameter - Determines the handling behavior of multiple parameters. Defaults to `'keep-first'`.
 */
export interface ParseFn<
  TRule extends StartRuleNames = DefaultStartRule,
  TMultiParameter extends MultiParameterOption = 'keep-first',
> {
  (
    input: string,
    options?: ParseOptions<TRule, TMultiParameter>,
  ): RuleResult<TMultiParameter>[TRule];
}

/* eslint-enable @typescript-eslint/prefer-function-type */

/**
 * Represents a record structure where parameter names are mapped to their respective parameter values.
 *
 * @typeParam TReadOnly - Whether the value should be marked as readonly (useful in function signatures). Defaults to `false`.
 * @see {@link ParameterName}
 * @see {@link ParameterValue}
 */
export type SerializableParameterRecord<TReadOnly extends boolean = false> =
  ConditionalReadonly<
    Record<
      ParameterName,
      ConditionalReadonlyCollection<ParameterValue, TReadOnly>
    >,
    TReadOnly
  >;

/**
 * Represents a type for serializable parameters. This type can either be:
 * - A {@link ParametersRecord `ParametersRecord`} that is readonly if `TReadOnly` is true, or mutable otherwise.
 * - An iterable collection of {@link ParameterEntry `ParameterEntry`} elements containing {@link MultiParameterOption `MultiParameterOption`} values
 *   with mutability controlled by the `TReadOnly` flag.
 *
 * @typeParam TReadOnly - Whether the value should be marked as readonly (useful in function signatures). Defaults to `false`.
 * @see {@link ParameterEntry}
 * @see {@link SerializableParameterRecord}
 */
export type SerializableParameters<TReadOnly extends boolean = false> =
  | Iterable<ParameterEntry<MultiParameterOption, TReadOnly>>
  | SerializableParameterRecord<TReadOnly>;

/**
 * A serializable representation of a MIME type record.
 *
 * This type represents a MIME type in a form suitable for programmatic construction.
 * It differs from a {@link MimeTypeParsed fully parsed MIME type } in that it only includes essential parts like type, subtype, and parameters.
 * Also, parameters can be provided as any iterable structure or record rather than the strict `Map` format.
 *
 * @interface
 * @typeParam TReadOnly - Whether the value should be marked as readonly (useful in function signatures). Defaults to `false`.
 * @see {@link https://mimesniff.spec.whatwg.org/#mime-type-representation MIME Sniffing Standard: MIME Type Representation}
 * — for the description of `MIME type record`, on which this type is (loosely) based.
 * @example
 * ```typescript
 * // Create a simple text MIME type
 * const simple: SerializableMimeTypeRecord = {
 *   type: 'text',
 *   subtype: 'plain',
 * };
 *
 * // Create with parameters
 * const withParams: SerializableMimeTypeRecord = {
 *   type: 'text',
 *   subtype: 'html',
 *   parameters: [[
 *     ['charset', 'utf-8'],
 *     ['boundary', '----delimiter']
 *   ]],
 * };
 * ```
 */
export type SerializableMimeTypeRecord<TReadOnly extends boolean = false> =
  ConditionalReadonly<
    Merge<
      Pick<MimeTypeParsed, 'subtype' | 'type'>,
      { parameters?: Undef<SerializableParameters<TReadOnly>> }
    >,
    TReadOnly
  >;
