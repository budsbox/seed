import type { CamelCase, PascalCase, Spread } from 'type-fest';

import type { NonNil } from '@budsbox/lib-types';

import {
  type KeyboardEvent,
  type MouseEvent,
  type Provider,
  createContext,
  useContext,
} from 'react';

import { camelCase, pascalCase } from '@budsbox/lib-es/string';

// Value exports
export { type DataAttrsResolved, dataAttrs } from './data-attrs';
export {
  type DynamicStyle,
  type WithDynamicStyle,
  styleFactory,
} from './style';

/**
 * Determines if no modifier keys (Ctrl, Meta, Shift, Alt) are pressed.
 *
 * The function checks the state of the `ctrlKey`, `metaKey`, `shiftKey`, and `altKey` properties
 * in the provided `KeyboardEvent` or `MouseEvent` object. It returns `true` if none of these
 * modifier keys are active; otherwise, it returns `false`.
 *
 * @param event - The React's `KeyboardEvent` or `MouseEvent` object to check.
 * @returns `true` if no modifier keys are pressed; `false` if any modifier key is active.
 */
export const noModifierKeys = ({
  ctrlKey,
  metaKey,
  shiftKey,
  altKey,
}: KeyboardEvent<unknown> | MouseEvent<unknown>): boolean =>
  !(ctrlKey || metaKey || shiftKey || altKey);

type StrictContextWrappers<TName extends string, T> = Readonly<
  Spread<
    { [K in PascalCase<`${TName}-provider`>]: Provider<NonNullable<T>> },
    { [K in CamelCase<`use-${TName}-context`>]: () => NonNullable<T> }
  >
>;

/**
 * Creates a strict context with the specified name. It returns a record with provider and hook.
 * The provider is a React context provider that accepts a non-nullable value of type `T`.
 * The hook is a function that retrieves the current value of the context and throws an error if it's null.
 *
 * @param name - The name of the strict context to be created. It will be used to generate the provider and hook names.
 * @returns A record with provider and hook.
 * @typeParam TName - The literal type of the strict context’s name.
 * @typeParam TValue - The type of the value that the context accepts.
 */
export function createStrictContext<
  TName extends string,
  TValue extends NonNil,
>(name: TName): StrictContextWrappers<TName, TValue>;
export function createStrictContext(
  name: string,
): Record<string, Provider<unknown> | (() => unknown)> {
  const ctx = createContext<unknown>(null);
  ctx.displayName = name;
  const providerName = pascalCase(`${name}-provider`);

  return {
    [providerName]: ctx.Provider,
    [camelCase(`use-${name}-context`)]: () => {
      const value = useContext(ctx);

      if (value == null) {
        throw new Error(
          `Failed to retrieve context "${name}". Did you forget to use "${providerName}"?`,
        );
      }

      return value;
    },
  };
}
