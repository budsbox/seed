import * as Parser from '#parser';
import { SyntaxError } from '#parser';

export { type Parser, SyntaxError };

export type StartRuleNames = Parser.StartRuleNames;

export type DefaultStartRule = NonNullable<Parser.ParseOptions['startRule']>;

export type MultiParameterOption = 'first' | 'last' | 'multi';
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

export const parse = Parser.parse as <
  TRule extends StartRuleNames = DefaultStartRule,
  TMultiParameter extends MultiParameterOption = 'first',
>(
  input: string,
  options?: ParseOptions<TRule>,
) => RuleResult<TMultiParameter>[TRule];

export type ParseFunction = typeof parse;

const isHttpToken = (value: string): boolean => {
  try {
    return value === parse(value, { startRule: 'httpToken' });
  } catch (err) {
    if (err instanceof SyntaxError) {
      return false;
    }

    throw err;
  }
};

export const serializeParameters = (
  parameters: Iterable<[ParameterName, ParameterValue]>,
): string => {
  const queue: Array<readonly [ParameterName, ParameterValue]> = [
    ...parameters,
  ];
  const result: string[] = [];
  while (queue.length) {
    const item = queue.shift();
    if (Array.isArray(item)) {
      const [name, value] = item;
      if (Array.isArray(value)) {
        queue.unshift(...value.map((v) => [name, v] as const));
      } else {
        result.push(
          `;${name}=${isHttpToken(value) ? value : `"${value.replace(/"/g, '\\"')}"`}`,
        );
      }
    }
  }

  return result.join('');
};

/**
 * Converts a parsed MIME type object into a string representation.
 *
 * @param mimeTypeParsed - The parsed MIME type object to convert.
 * @returns The string representation of the given MIME type, including its parameters.
 */
export const serializeMimeType = ({
  essence,
  parameters,
}: MimeTypeParsed): string => `${essence}${serializeParameters(parameters)}`;
