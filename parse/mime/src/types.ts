import type * as Parser from '#parser';

export type { Parser };

export type StartRuleNames = Parser.StartRuleNames;

export type DefaultStartRule = NonNullable<Parser.ParseOptions['startRule']>;

export type MultiParameterOption = 'keep-first' | 'keep-last' | 'list';
export interface ParseOptions<
  TRule extends StartRuleNames = DefaultStartRule,
  TMultiParameter extends MultiParameterOption = MultiParameterOption,
> extends Pick<Parser.ParseOptions<TRule>, 'grammarSource' | 'tracer'> {
  readonly multiParameter?: TMultiParameter;
  readonly restrictNames?: boolean;
  readonly sniff?: boolean;
  readonly startRule?: TRule;
  readonly trim?: boolean;

  // it's overloaded to be readonly
  readonly tracer?: Readonly<Parser.ParserTracer>;
}

export type ParameterName = string;
export type ParameterValue<
  TMultiParameter extends MultiParameterOption = MultiParameterOption,
> = (TMultiParameter extends 'multi' ? never : readonly string[]) | string;

export type ParametersParsed<
  TMultiParameter extends MultiParameterOption = MultiParameterOption,
> = ReadonlyMap<ParameterName, ParameterValue<TMultiParameter>>;

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

export interface RuleResult<
  TMultiParameter extends MultiParameterOption = MultiParameterOption,
> {
  essence: EssenceParsed;
  httpToken: string;
  mimeType: MimeTypeParsed;
  parameter: readonly [ParameterName, ParameterValue<TMultiParameter>];
  parameters: ParametersParsed<TMultiParameter>;
  subtype: SubtypeParsed;
  subtypeName: string;
  subtypeSuffix: string;
  tree: string;
  type: string;
}
