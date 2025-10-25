import type * as Parser from '#parser';

import { SyntaxError, parse as parseRaw } from '#parser';

export { Parser, SyntaxError };

export type StartRuleNames = Parser.StartRuleNames;

export type DefaultStartRule = NonNullable<Parser.ParseOptions['startRule']>;

export interface ParseOptions<TRule extends StartRuleNames = DefaultStartRule>
  extends Pick<
    Parser.ParseOptions<TRule>,
    'grammarSource' | 'startRule' | 'tracer'
  > {
  readonly loose?: boolean;
  readonly tracer?: Readonly<Parser.ParserTracer>;
}

export type ParameterName = string;
export type ParameterValue<TMultiValue extends boolean = false> =
  | (TMultiValue extends true ? ReadonlySet<string> : never)
  | string
  | null;

export type ParametersParsed<TMultiValue extends boolean = false> = ReadonlyMap<
  ParameterName,
  NonNullable<ParameterValue<TMultiValue>>
>;

export interface SubtypeTokens {
  readonly name: string;
  readonly suffix: string | null;
  readonly tree: string | null;
}

export interface SubtypeParsed {
  readonly subtype: string;
  readonly subtypeTokens: SubtypeTokens;
}

export interface EssenceParsed extends SubtypeParsed {
  readonly essence: string;
  readonly type: string;
}

export interface MimeTypeParsed extends EssenceParsed {
  readonly parameters: ParametersParsed;
}

export interface RuleResult<TMultiValue extends boolean = false> {
  essence: EssenceParsed;
  looseMimeType: MimeTypeParsed;
  parameter: readonly [ParameterName, ParameterValue<TMultiValue>];
  parameters: ParametersParsed<TMultiValue>;
  subtype: SubtypeParsed;
  subtypeName: string;
  subtypeSuffix: string;
  tree: string;
  type: string;
  validMimeType: MimeTypeParsed;
}

export type ParseFunction<
  TRule extends StartRuleNames = DefaultStartRule,
  TMultiValue extends boolean = false,
> = (
  input: string,
  options?: ParseOptions<TRule>,
) => RuleResult<TMultiValue>[TRule];

export const parse: ParseFunction = parseRaw;
