import type {
  DefaultStartRule,
  MimeTypeParsed,
  MultiParameterOption,
  ParameterName,
  ParameterValue,
  ParseOptions,
  RuleResult,
  StartRuleNames,
} from '#types';

import * as Parser from '#parser';

// Type exports
export type * from '#types';

// Value exports
export { SyntaxError } from '#parser';

export const parse = Parser.parse as <
  TRule extends StartRuleNames = DefaultStartRule,
  TMultiParameter extends MultiParameterOption = 'keep-first',
>(
  input: string,
  options?: ParseOptions<TRule>,
) => RuleResult<TMultiParameter>[TRule];

export const sniff = <
  TRule extends StartRuleNames = DefaultStartRule,
  TMultiParameter extends MultiParameterOption = 'keep-first',
>(
  input: string,
  options?: Readonly<Omit<ParseOptions<TRule>, 'sniff'> & {}>,
): RuleResult<TMultiParameter>[TRule] =>
  parse(input, { ...options, sniff: true });

export type ParseFunction = typeof parse;

const isHttpToken = (value: string): boolean => {
  try {
    return value === parse<'httpToken'>(value, { startRule: 'httpToken' });
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
