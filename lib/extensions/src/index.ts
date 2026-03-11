import type {
  FileExtension,
  FileTypeCode,
  JsLangCode,
  JsSourceType,
  QueryJsExtensionsParams,
} from './types.js';

import { diff, ensureArray, intersection, union } from '@budsbox/lib-es/array';
import { isNil } from '@budsbox/lib-es/guards';

import {
  fileTypeCodeToExtensions,
  jsSourceTypeToExtensions,
  jsxExtensions,
} from './const.js';

export type {
  FileExtension,
  FileTypeCode,
  JsLangCode,
  JsSourceType,
  QueryJsExtensionsParams,
};

/**
 * Generates a list of file extensions associated with the provided file type codes.
 *
 * @param fileTypes - A set of file type codes provided as a variadic, readonly array.
 * @returns An array of file extensions associated with the supplied file type codes.
 */
export const queryFileTypeExtensions = (
  ...fileTypes: readonly FileTypeCode[]
): FileExtension[] =>
  union(...fileTypes.map((type) => fileTypeCodeToExtensions[type]));

/**
 * Retrieves and filters a list of file extensions based on the provided JavaScript/TypeScript language options,
 * source type, and JSX preferences.
 *
 * @param params - The parameters used to query and filter file extensions.
 * @param params.lang - Specifies the primary file extensions to filter based on the language.
 * Defaults to ['js', 'ts'].
 * @param params.sourceType - The initial source type used to determine the applicable file extensions.
 * @param params.targetSourceType - Represents the target source type used for filtering extensions.
 * Defaults to the value of `sourceType` if undefined.
 * @param params.jsx - Determines if the query should include JSX-specific file extensions.
 * Set to `false` by default.
 * @returns A filtered list of file extensions matching the specified criteria.
 */
export const queryJsExtensions = ({
  lang = ['js', 'ts'],
  sourceType,
  targetSourceType = sourceType,
  jsx = false,
}: Readonly<QueryJsExtensionsParams>): FileExtension[] => {
  const langExts = queryFileTypeExtensions(...ensureArray(lang));

  return diff(
    intersection(
      langExts,
      isNil(targetSourceType) ? langExts : (
        union(
          jsSourceTypeToExtensions[targetSourceType],
          targetSourceType === sourceType ?
            jsSourceTypeToExtensions.ambiguous
          : [],
        )
      ),
    ),
    jsx ? [] : jsxExtensions,
  );
};

const leadingDotRegex = /^\.?/;

/**
 * Prepends a dot (.) to the given extension string if it does not already begin with one.
 *
 * @param extension - The extension string to process.
 * @returns The processed extension string that is guaranteed to start with a dot. If the input already starts with a dot, it will be returned unchanged.
 * @typeParam TExtension - The type of the extension string, which can be any string.
 */
export function prependDot<TExtension extends string>(
  extension: TExtension,
): TExtension extends `.${string}` ? TExtension : `.${TExtension}`;
export function prependDot(extension: string): string {
  return extension.replace(leadingDotRegex, '.');
}

/**
 * Removes the leading dot from a string if it begins with one.
 * If the string does not start with a dot, it returns the string unchanged.
 *
 * @param extension - The string input, which may or may not have a leading dot.
 * @returns The input string without a leading dot, or the original string if no leading dot was present.
 * @typeParam TExtension - The type of the extension string, which can be any string.
 */
export function removeDot<TExtension extends string>(
  extension: TExtension,
): TExtension extends `.${infer TWithoutDot}` ? TWithoutDot : TExtension;
export function removeDot(extension: string): string {
  return extension.replace(leadingDotRegex, '');
}

/**
 * Generates a filename glob pattern string based on the provided file extensions.
 * This function takes an array of file extensions and constructs a glob
 * pattern that matches files with the specified extensions.
 *
 * @param extensions - A readonly array of file extensions (with or without a leading dot).
 * @returns A glob pattern string matching the filenames with specified extensions.
 */
export const globFromExtensions = (extensions: readonly string[]): string => {
  const extensionsWithoutDot = extensions.map(removeDot);
  return `*.${extensionsWithoutDot.length > 1 ? `{${extensionsWithoutDot.join(',')}}` : extensionsWithoutDot[0]!}`;
};
