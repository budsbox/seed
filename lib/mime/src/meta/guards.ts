import type { MimeTypeInput } from '#types';

import { hasProp, isBoolean } from '@budsbox/lib-es/guards';

import { parse } from '#lib';

import {
  extraArchiveTypes,
  extraFontTypes,
  textDataSuffixes,
} from './const.js';
import { mimeDb } from './mime-db-wrapper.js';
import { canonicalize, getMetaInfo, getSource } from './query.js';

/* ═══════════════════════════════ By Source ════════════════════════════════ */

export const isWellKnown = (mimeInput: MimeTypeInput): boolean =>
  hasProp(mimeDb, parse(mimeInput).essence);

export const isIana = (mimeInput: MimeTypeInput): boolean =>
  getSource(mimeInput) === 'iana';

export const isApache = (mimeInput: MimeTypeInput): boolean =>
  getSource(mimeInput) === 'apache';

export const isNginx = (mimeInput: MimeTypeInput): boolean =>
  getSource(mimeInput) === 'nginx';

export const isUnregistered = (mimeInput: MimeTypeInput): boolean =>
  !isIana(mimeInput);

/* ════════════════════════════════ By Tree ═════════════════════════════════ */

/**
 * Checks if the mime type is in the {@link https://datatracker.ietf.org/doc/html/rfc6838#section-3.1 Standards tree}.
 *
 * @param mimeInput - MIME input to check
 * @returns true if type is in the Standards tree, false otherwise.
 */
export const isStandardsTree = (mimeInput: MimeTypeInput): boolean => {
  const mimeType = parse(mimeInput);
  return !hasProp(mimeType, 'facet');
};

// https://datatracker.ietf.org/doc/html/rfc6838#section-3.2
export const isVendorTree = (mimeInput: MimeTypeInput): boolean => {
  const mimeType = parse(mimeInput);
  return hasProp(mimeType, 'facet', (facet) => facet === 'vnd.');
};

// https://datatracker.ietf.org/doc/html/rfc6838#section-3.3
export const isPersonalTree = (mimeInput: MimeTypeInput): boolean => {
  const mimeType = parse(mimeInput);
  return hasProp(mimeType, 'facet', (facet) => facet === 'prs.');
};

/* ════════════════════════════ By Content Type ═════════════════════════════ */

/* ───────────────────────────────── Media ────────────────────────────────── */

export const isImage = (mimeInput: MimeTypeInput): boolean => {
  const record = parse(mimeInput),
    canonical = canonicalize(record);

  return record.type === 'image' || canonical.type === 'image';
};

export const isSvg = (mimeInput: MimeTypeInput): boolean =>
  parse(mimeInput).essence === 'image/svg+xml';

export const isJpeg = (mimeInput: MimeTypeInput): boolean =>
  parse(mimeInput).essence === 'image/jpeg';

export const isPng = (mimeInput: MimeTypeInput): boolean =>
  parse(mimeInput).essence === 'image/png';

export const isGif = (mimeInput: MimeTypeInput): boolean =>
  parse(mimeInput).essence === 'image/gif';

export const isAudio = (mimeInput: MimeTypeInput): boolean => {
  const mimeType = parse(mimeInput),
    canonical = canonicalize(mimeType);
  return mimeType.type === 'audio' || canonical.type === 'audio';
};

export const isVideo = (mimeInput: MimeTypeInput): boolean => {
  const mimeType = parse(mimeInput),
    canonical = canonicalize(mimeType);
  return mimeType.type === 'video' || canonical.type === 'video';
};

export const isPlayable = (mimeInput: MimeTypeInput): boolean => {
  const mimeType = parse(mimeInput);
  return (
    isAudio(mimeType) ||
    isVideo(mimeType) ||
    mimeType.essence === 'application/ogg'
  );
};

export const isMedia = (mimeInput: MimeTypeInput): boolean => {
  const mimeType = parse(mimeInput);
  return isImage(mimeType) || isPlayable(mimeType);
};

/* ─────────────────────────────── Languages ──────────────────────────────── */

export const isXml = (mimeInput: MimeTypeInput): boolean => {
  const mimeType = parse(mimeInput);
  return (
    mimeType.suffix === '+xml' ||
    canonicalize(mimeType).essence === 'application/xml'
  );
};

export const isHtml = (mimeInput: MimeTypeInput): boolean =>
  parse(mimeInput).essence === 'text/html';

export const isJson = (mimeInput: MimeTypeInput): boolean => {
  const mimeType = parse(mimeInput);
  return (
    mimeType.suffix === '+json' ||
    canonicalize(mimeType).essence === 'application/json'
  );
};

export const isJsonSequence = (mimeInput: MimeTypeInput): boolean => {
  const { essence, suffix } = parse(mimeInput);
  return essence === 'application/json-seq' || suffix === '+json-seq';
};

export const isYaml = (mimeInput: MimeTypeInput): boolean => {
  const mimeType = parse(mimeInput);
  return mimeType.suffix === '+yaml' || mimeType.essence === 'application/yaml';
};

export const isCsv = (mimeInput: MimeTypeInput): boolean => {
  const mimeType = parse(mimeInput);
  return mimeType.suffix === '+csv' || mimeType.essence === 'text/csv';
};

export const isJavaScript = (mimeInput: MimeTypeInput): boolean =>
  canonicalize(parse(mimeInput)).essence === 'text/javascript';

export const isJs = isJavaScript;

/* ──────────────────────────────── Archives ──────────────────────────────── */

export const isZip = (mimeInput: MimeTypeInput): boolean => {
  const mimeType = parse(mimeInput);
  return (
    mimeType.suffix === '+zip' ||
    canonicalize(mimeType).essence === 'application/zip'
  );
};

export const isGzip = (mimeInput: MimeTypeInput): boolean => {
  const mimeType = parse(mimeInput);
  return (
    mimeType.suffix === '+gzip' ||
    canonicalize(mimeType).essence === 'application/gzip'
  );
};

export const isArchive = (mimeInput: MimeTypeInput): boolean => {
  const mimeType = parse(mimeInput);
  return (
    isZip(mimeType) ||
    isGzip(mimeType) ||
    extraArchiveTypes.has(mimeType.essence)
  );
};

/* ───────────────────────────── Miscellaneous ────────────────────────────── */

export const isFont = (mimeInput: MimeTypeInput): boolean => {
  const mimeType = canonicalize(parse(mimeInput));
  return mimeType.type === 'font' || extraFontTypes.has(mimeType.essence);
};

export const isExample = (mimeInput: MimeTypeInput): boolean => {
  const { type, subtype } = parse(mimeInput);
  return type === 'example' || subtype === 'example';
};

export const isCbor = (mimeInput: MimeTypeInput): boolean => {
  const { suffix, essence } = parse(mimeInput);
  return essence === 'application/cbor' || suffix === '+cbor';
};

export const isTextData = (mimeInput: MimeTypeInput): boolean => {
  const mimeType = parse(mimeInput),
    canonical = canonicalize(mimeType);
  return [mimeType, canonical].some(
    (mime) =>
      mime.type === 'text' ||
      hasProp(mime, 'suffix', (suffix) => textDataSuffixes.has(suffix)) ||
      isXml(mime) ||
      isJson(mime) ||
      isYaml(mime) ||
      isJsonSequence(mime),
  );
};

/* ═══════════════════════════════ By Feature ═══════════════════════════════ */

export const isCompressible = (
  mimeInput: MimeTypeInput,
  defaultValue = false,
): boolean => {
  const record = parse(mimeInput);
  const { compressible } = getMetaInfo(record);
  if (isBoolean(compressible)) return compressible;
  if (isArchive(record)) return false;
  if (isTextData(record)) return true;
  if (isPlayable(record)) return false;

  return defaultValue;
};
