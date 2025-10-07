import type {
  ConfigEnv,
  UserConfig,
  UserConfigExport,
  UserConfigFnPromise,
} from 'vite';

import type { Awaitable, Undef } from '@budsbox/lib-types';

/**
 * Represents a custom user configuration function used to generate Vite configuration.
 *
 * @typeParam TOptions - The type of the custom options object, with a default to `object`.
 * @param viteEnv - A readonly object representing the Vite configuration environment.
 * @param options - An optional readonly object representing additional custom configuration options.
 * @returns A promise or value containing the generated Vite user configuration.
 */
export type CustomUserConfigFn<TOptions extends object = object> = (
  viteEnv: Readonly<ConfigEnv>,
  options?: Undef<Readonly<TOptions>>,
) => Awaitable<UserConfig>;

/**
 * A `ConfigFactory` is a function type that generates an asynchronous Vite's configuration object generator function.
 *
 * @param custom - An optional custom configuration of type `UserConfigExport`. It can be used
 * to override or extend default configurations.
 * @returns A function to be invoked by Vite to generate the final configuration object.
 */
export type ConfigFactory = (custom?: UserConfigExport) => UserConfigFnPromise;

/**
 * A `ConfigFactory` is a function type that generates an asynchronous Vite's configuration object generator function.
 *
 * @param custom - An optional custom configuration of type `UserConfigExport`. It can be used
 * to override or extend default configurations.
 * @param options - An optional object containing additional configuration options, specific to the factory.
 * @returns A function to be invoked by Vite to generate the final configuration object.
 */
export type ConfigFactoryWithOptions<TOptions extends object> = (
  custom?: UserConfigExport,
  options?: Readonly<Partial<TOptions>>,
) => UserConfigFnPromise;

/**
 * A type definition for a function that generates a scoped class name for a given input.
 * This is used in CSS module transformations.
 *
 * @param localName - The local name of the class or element.
 * @param filename - The filename of the source file.
 * @returns A scoped class name.
 */
export type ScopedNameGenerator = (
  this: void,
  localName: string,
  filename: string,
) => string;
