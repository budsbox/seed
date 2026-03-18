/**
 * Provides Mime Sniffing Standard-related utilities.
 *
 * @module
 */

import type { MimeTypeEssence, MimeTypeInput } from '#types';

import type { MimeGroup } from './types.js';

import { parse } from '#lib';

import {
  isArchive,
  isFont,
  isHtml,
  isImage,
  isJs,
  isJson,
  isPlayable,
  isSvg,
  isXml,
  isZip,
} from './guards.js';
import { canonicalize } from './query.js';

/**
 * Simplifies a given MIME type input to its minimal essence according to
 * {@link https://mimesniff.spec.whatwg.org/#minimize-a-supported-mime-type Mime Sniffing Standard}.
 *
 * @param mimeInput - The MIME type input to be processed. Can be a string or an object representing the MIME type.
 * @returns The minimal essence of the MIME type, such as `text/javascript`, `application/json`, or the {@link canonicalize canonical form} of the input.
 * @category MIME Sniffing Standard
 */
export function minimize(mimeInput: MimeTypeInput): MimeTypeEssence {
  const record = canonicalize(parse(mimeInput));

  if (isJs(record)) return 'text/javascript';
  if (isJson(record)) return 'application/json';
  if (isSvg(record)) return 'image/svg+xml';
  if (isXml(record)) return 'application/xml';
  return record.essence;
}

/**
 * Analyzes the provided MIME type input and categorizes it into relevant MIME groups according to
 * {@link https://mimesniff.spec.whatwg.org/#mime-type-groups Mime Sniffing Standard}.
 *
 * @param mimeInput - The input containing MIME type information to be analyzed and categorized.
 * @returns A set of MIME groups that classify the given MIME type input.
 * @category MIME Sniffing Standard
 */
export function sniffMimeGroups(mimeInput: MimeTypeInput): Set<MimeGroup> {
  const record = parse(mimeInput);
  const mimeGroups = new Set<MimeGroup>();
  if (isImage(record)) mimeGroups.add('image');
  if (isPlayable(record)) mimeGroups.add('audio or video');
  if (isFont(record)) mimeGroups.add('font');
  if (isZip(record)) mimeGroups.add('zip-based');
  if (isArchive(record) && record.suffix !== '+zip') mimeGroups.add('archive');
  if (isHtml(record)) mimeGroups.add('html');
  if (isXml(record)) mimeGroups.add('xml');
  if (
    mimeGroups.has('html') ||
    mimeGroups.has('xml') ||
    record.essence === 'application/pdf'
  )
    mimeGroups.add('scriptable');
  if (isJs(record)) mimeGroups.add('javascript');
  if (isJson(record)) mimeGroups.add('json');

  return mimeGroups;
}
