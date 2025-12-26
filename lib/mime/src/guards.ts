import type { MimeTypeInput, OutputType } from './types.js';

import { hasProp, isString } from '@budsbox/lib-es/guards';

import { parse, produceOutput, setParameter, update } from '#lib';
import { type MimeDbRecord, type MimeDbSource, mimeDb } from '#mime-db';

import {
  canonicalTypesMap,
  extraArchiveTypes,
  extraFontTypes,
} from './const.js';

export const isWellKnown = (mimeInput: MimeTypeInput): boolean =>
  getRecord(mimeInput) !== null;

export const canonicalize = <TInput extends MimeTypeInput>(
  mimeInput: TInput,
  setCharset = false,
): OutputType<TInput> => {
  const mimeType = parse(mimeInput);
  const canonicalEssence =
    canonicalTypesMap.get(mimeType.essence) ?? mimeType.essence;

  let record =
    mimeType.essence === canonicalEssence ?
      mimeType
    : update(mimeType, 'essence', canonicalEssence);
  if (setCharset && !record.parameters.has('charset')) {
    const charset = getRecord(record)?.charset ?? getRecord(mimeType)?.charset;
    if (isString(charset)) record = setParameter(record, 'charset', charset);
  }

  return produceOutput(mimeInput, record);
};

export const getRecord = (mimeInput: MimeTypeInput): MimeDbRecord | null =>
  mimeDb[parse(mimeInput).essence] ?? null;

/* ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ BY SOURCE ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ */

export const isIana = (mimeInput: MimeTypeInput): boolean =>
  getSource(mimeInput) === 'iana';

export const isApache = (mimeInput: MimeTypeInput): boolean =>
  getSource(mimeInput) === 'apache';

export const isNginx = (mimeInput: MimeTypeInput): boolean =>
  getSource(mimeInput) === 'nginx';

export const isUnregistered = (mimeInput: MimeTypeInput): boolean =>
  !isIana(mimeInput);

export const getSource = (mimeInput: MimeTypeInput): MimeDbSource | null => {
  const { essence } = parse(mimeInput);
  return getRecord(essence)?.source ?? null;
};

/* ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ BY TREE ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ */

export const isStandardTree = (mimeInput: MimeTypeInput): boolean => {
  const mimeType = parse(mimeInput);
  return isIana(mimeType) && !hasProp(mimeType, 'facet');
};

export const isVendorTree = (mimeInput: MimeTypeInput): boolean => {
  const mimeType = parse(mimeInput);
  return (
    isIana(mimeType) && hasProp(mimeType, 'facet', (facet) => facet === 'vnd.')
  );
};

export const isUnregisteredTree = (mimeInput: MimeTypeInput): boolean => {
  const mimeType = parse(mimeInput);
  return (
    isIana(mimeType) && hasProp(mimeType, 'facet', (facet) => facet === 'x.')
  );
};

/* ~~~~~~~~~~~~~~~~~~~~~~~~~~~~ BY CONTENT TYPE ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ */

/* ───────────────────────────────── Media ────────────────────────────────── */

export const isImage = (mimeInput: MimeTypeInput): boolean =>
  parse(mimeInput).type === 'image';

export const isSvg = (mimeInput: MimeTypeInput): boolean =>
  parse(mimeInput).essence === 'image/svg+xml';

export const isJpeg = (mimeInput: MimeTypeInput): boolean =>
  parse(mimeInput).essence === 'image/jpeg';

export const isPng = (mimeInput: MimeTypeInput): boolean =>
  parse(mimeInput).essence === 'image/png';

export const isGif = (mimeInput: MimeTypeInput): boolean =>
  parse(mimeInput).essence === 'image/gif';

export const isAudio = (mimeInput: MimeTypeInput): boolean =>
  parse(mimeInput).type === 'audio';

export const isVideo = (mimeInput: MimeTypeInput): boolean =>
  parse(mimeInput).type === 'video';

export const isMultimedia = (mimeInput: MimeTypeInput): boolean => {
  const mimeType = parse(mimeInput);
  return isVideo(mimeType) || mimeType.essence === 'application/ogg';
};

export const isMedia = (mimeInput: MimeTypeInput): boolean => {
  const mimeType = parse(mimeInput);
  return isImage(mimeType) || isAudio(mimeType) || isMultimedia(mimeType);
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

/* ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ BY FEATURE ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ */

export const isCompressible = (mimeInput: MimeTypeInput): boolean =>
  getRecord(mimeInput)?.compressible === true;
