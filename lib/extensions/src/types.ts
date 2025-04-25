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

export type JsSourceType = Exclude<keyof JsSourceTypeToExtensions, 'ambiguous'>;

export type FileTypeCode = keyof FileTypeCodeToExtensions;

export type FileExtension = ArrayValues<FileTypeCodeToExtensions[FileTypeCode]>;

export type JsLangCode = Extract<FileTypeCode, 'js' | 'ts'>;

export type JSXExtensions = ArrayValues<JSXExtensionsList>;

/*
 * it should be possible to infer list of extension literals from types of params,
 * I may try to implement it one day j4f
 */
export interface QueryJsExtensionsParams {
  lang?: Undef<JsLangCode | readonly JsLangCode[]>;
  sourceType?: Undef<JsSourceType>;
  targetSourceType?: Undef<JsSourceType>;
  jsx?: Undef<boolean>;
}
