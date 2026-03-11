import type { ArrayValues } from 'type-fest';

import type { Undef } from '@budsbox/lib-types';

import type {
  fileTypeCodeToExtensions,
  jsSourceTypeToExtensions,
  jsxExtensions,
} from './const.js';

type FileTypeCodeToExtensions = typeof fileTypeCodeToExtensions;
type JSXExtensionsList = typeof jsxExtensions;
type JsSourceTypeToExtensions = typeof jsSourceTypeToExtensions;

/**
 * JavaScript source type (e.g., CommonJS or ECMAScript module).
 */
export type JsSourceType = Exclude<keyof JsSourceTypeToExtensions, 'ambiguous'>;

/**
 * Unique code representing a file type.
 */
export type FileTypeCode = keyof FileTypeCodeToExtensions;

/**
 * A literal representing a file extension.
 */
export type FileExtension = ArrayValues<FileTypeCodeToExtensions[FileTypeCode]>;

/**
 * Language code for JavaScript-like languages (JS or TS).
 */
export type JsLangCode = Extract<FileTypeCode, 'js' | 'ts'>;

/**
 * List of file extensions that support JSX.
 */
export type JSXExtensions = ArrayValues<JSXExtensionsList>;

/**
 * Parameters for querying JavaScript extensions.
 */
export interface QueryJsExtensionsParams {
  /**
   * Whether to include JSX extensions.
   */
  jsx?: Undef<boolean>;

  /**
   * The language code(s) to filter by.
   */
  lang?: Undef<readonly JsLangCode[] | JsLangCode>;

  /**
   * The source type of the files.
   */
  sourceType?: Undef<JsSourceType>;

  /**
   * The target source type for the files.
   */
  targetSourceType?: Undef<JsSourceType>;
}
