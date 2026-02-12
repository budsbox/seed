/**
 * Possible strategies for handling multiple occurrences of the same parameter name in a MIME type.
 *
 * - `'keep-first'`: When a parameter appears multiple times, only the first value is kept. This is the default strategy.
 * - `'keep-last'`: When a parameter appears multiple times, only the last value is kept
 * - `'list'`: When a parameter appears multiple times, all values are collected in an array
 */
export const multiParameterOptions = [
  'keep-first',
  'keep-last',
  'list',
] as const;
