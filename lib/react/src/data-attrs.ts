import type {
  ConditionalKeys,
  EmptyObject,
  IsNever,
  KebabCase,
  ValueOf,
} from 'type-fest';

import type { Infer, Nil } from '@budsbox/lib-types';

import { isFalse } from '@budsbox/lib-es/guards';
import { sure } from '@budsbox/lib-es/logical';
import { kebabCase } from '@budsbox/lib-es/string';

type DataAttrsInput = Record<string, string | number | boolean | Nil>;

type DataAttrsKeepValue = Exclude<ValueOf<DataAttrsInput>, Nil | false>;

type DataAttrsRename<TInput extends Record<string, unknown>> = {
  [K in keyof TInput as `data-${KebabCase<K & string>}`]: TInput[K];
};

type LooseSetRequired<
  TInput extends Record<string, unknown>,
  Key extends PropertyKey,
> = TInput & Required<Pick<TInput, Key & keyof TInput>>;

/**
 * Represents the resolved data properties derived from the input type `TInput`.
 * It actually reproduces the logic of the `dataAttrs` function in types.
 *
 * @typeParam TInput - The input type extending `DataAttrsInput` that provides the base structure from which
 * the resolved properties are derived.
 * @remarks I'm not sure if I had to do this... But it was fun :)
 */
export type DataAttrsResolved<TInput extends DataAttrsInput> =
  Record<string, never> extends TInput ?
    TInput extends Record<string, infer TValue> ?
      IsNever<TValue & DataAttrsKeepValue> extends true ?
        EmptyObject
      : Record<string, TValue & DataAttrsKeepValue>
    : never
  : Infer<
      DataAttrsRename<
        LooseSetRequired<
          Partial<{
            [K in keyof TInput as IsNever<
              TInput[K] & DataAttrsKeepValue
            > extends true ?
              never
            : K]: TInput[K] & DataAttrsKeepValue;
          }>,
          ConditionalKeys<TInput, DataAttrsKeepValue>
        >
      >
    >;

/**
 * Processes the provided input object and resolves it into a structured form suitable for handling data attributes.
 *
 * @param input - The input object containing key-value pairs that represent data attributes to be processed.
 * @returns The resolved object containing the processed data attributes.
 */
export function dataAttrs<TInput extends DataAttrsInput>(
  input: TInput,
): DataAttrsResolved<TInput>;
// eslint-disable-next-line jsdoc/require-jsdoc
export function dataAttrs(
  input: Readonly<Record<string, boolean | string | number | undefined | null>>,
): DataAttrsResolved<DataAttrsInput>;
export function dataAttrs(
  input: Readonly<Record<string, boolean | string | number | undefined | null>>,
): DataAttrsResolved<DataAttrsInput> {
  return Object.fromEntries(
    Object.entries(input)
      .filter(([, value]) => !sure(value, isFalse, true))
      .map(([key, value]) => [
        `data-${kebabCase(key)}`,
        value as DataAttrsKeepValue,
      ]),
  );
}
