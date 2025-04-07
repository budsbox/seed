import {
  FileTypeCode,
  FileExtension,
  QueryJsExtensionsParams,
  JsSourceType,
  JsLangCode,
} from './types.js';
import {
  fileTypeCodeToExtensions,
  jsSourceTypeToExtensions,
  jsxExtensions,
} from './const.js';
import { intersection, union, ensureArray, diff } from '@budsbox/lib-es/array';
import { isNil } from '@budsbox/lib-es/guards';

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
 * Generates a list of JavaScript-related file extensions based on the provided language and source type parameters.
 *
 * @param lang - Specifies the programming language(s) to query, which could be a single language or an array of languages.
 * @param sourceType - Defines the source type (e.g., ES Modules or CommonJS) being handled for JavaScript files.
 * @param targetSourceType - Defines the target source type for comparison. Defaults to the value of `sourceType`.
 * @param jsx - A boolean indicating whether JSX-related extensions should be included to the output. Defaults to `false`.
 * @returns An array of file extensions that match the specified query parameters, excluding or including JSX extensions as specified.
 */
export const queryJsExtensions = ({
  lang,
  sourceType,
  targetSourceType = sourceType,
  jsx = false,
}: QueryJsExtensionsParams): FileExtension[] => {
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
