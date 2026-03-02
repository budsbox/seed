import type { MimeTypeInput } from '#types';

import { hasProp, isBoolean, isString } from '@budsbox/lib-es/guards';

import { parse } from '#lib';

import {
  extraArchiveTypes,
  extraFontTypes,
  textDataSuffixes,
} from './const.js';
import { mimeDb } from './mime-db-wrapper.js';
import { canonicalize, getMeta, getSource } from './query.js';

/* ═══════════════════════════════ By Source ════════════════════════════════ */

/**
 * Determines whether the provided {@link MimeTypeInput MIME type input} is well-known based on its presence
 * in the MIME database.
 *
 * @param mimeInput - The {@link MimeTypeInput MIME type input} to be checked. It can be a string or object
 * accepted by the {@link parse} function.
 * @returns `true` if the MIME input is found in the database; otherwise, `false`.
 * @category Checks
 */
export const isWellKnown = (mimeInput: MimeTypeInput): boolean =>
  hasProp(mimeDb, parse(mimeInput).essence);

/**
 * Checks if the given {@link MimeTypeInput MIME type input} originates from the `iana` (Internet Assigned Numbers Authority)
 * {@link https://www.iana.org/assignments/media-types/media-types.xhtml source}.
 *
 * @param mimeInput - The {@link MimeTypeInput MIME type input} to be checked. It can be a string or object
 * accepted by the {@link parse} function.
 * @returns `true` if the MIME type input's source is "iana", otherwise `false`.
 * @category Checks
 */
export const isIana = (mimeInput: MimeTypeInput): boolean =>
  getSource(mimeInput) === 'iana';

/**
 * Checks if the given {@link MimeTypeInput MIME type input} originates from the `apache` (Apache common media types)
 * {@link https://svn.apache.org/repos/asf/httpd/httpd/trunk/docs/conf/mime.types source}.
 *
 * @param mimeInput - The {@link MimeTypeInput MIME type input} to be checked. It can be a string or object
 * accepted by the {@link parse} function.
 * @returns `true` if the MIME type input's source is "apache", otherwise `false`.
 * @category Checks
 */
export const isApache = (mimeInput: MimeTypeInput): boolean =>
  getSource(mimeInput) === 'apache';

/**
 * Checks if the given {@link MimeTypeInput MIME type input} originates from the `nginx`
 * {@link https://hg.nginx.org/nginx/raw-file/default/conf/mime.types source}.
 *
 * @param mimeInput - The {@link MimeTypeInput MIME type input} to be checked. It can be a string or object
 * accepted by the {@link parse} function.
 * @returns `true` if the MIME type input's source is "nginx", otherwise `false`.
 * @category Checks
 */
export const isNginx = (mimeInput: MimeTypeInput): boolean =>
  getSource(mimeInput) === 'nginx';

/**
 * Determines if a given {@link MimeTypeInput MIME type input} is unregistered.
 *
 * This function evaluates the provided {@link MimeTypeInput MIME type input} and returns
 * a boolean value indicating whether the input is not registered
 * with the Internet Assigned Numbers Authority (IANA).
 *
 * @param mimeInput - The {@link MimeTypeInput MIME type input} to be checked.
 * @returns `true` if the {@link MimeTypeInput MIME type input} is unregistered, otherwise `false`.
 * @category Checks
 */
export const isUnregistered = (mimeInput: MimeTypeInput): boolean =>
  !isIana(mimeInput);

/* ════════════════════════════════ By Tree ═════════════════════════════════ */

/**
 * Checks if the mime type is in the {@link https://datatracker.ietf.org/doc/html/rfc6838#section-3.1 Standards tree}.
 *
 * @param mimeInput - {@link MimeTypeInput MIME type input} to check
 * @returns true if type is in the Standards tree, false otherwise.
 * @category Checks
 */
export const isStandardsTree = (mimeInput: MimeTypeInput): boolean => {
  const mimeType = parse(mimeInput);
  return !hasProp(mimeType, 'facet');
};

/**
 * Checks if the mime type is in the {@link https://datatracker.ietf.org/doc/html/rfc6838#section-3.2 Vendor tree}.
 *
 * @param mimeInput - {@link MimeTypeInput MIME type input} to check
 * @returns true if type is in the Vendor tree, false otherwise.
 * @category Checks
 */
export const isVendorTree = (mimeInput: MimeTypeInput): boolean => {
  const mimeType = parse(mimeInput);
  return hasProp(mimeType, 'facet', (facet) => facet === 'vnd.');
};

/**
 * Checks if the mime type is in the {@link https://datatracker.ietf.org/doc/html/rfc6838#section-3.3 Personal tree}.
 *
 * @param mimeInput - {@link MimeTypeInput MIME type input} to check.
 * @returns true if type is in the Personal tree, false otherwise.
 * @category Checks
 */
export const isPersonalTree = (mimeInput: MimeTypeInput): boolean => {
  const mimeType = parse(mimeInput);
  return hasProp(mimeType, 'facet', (facet) => facet === 'prs.');
};

/* ════════════════════════════ By Content Type ═════════════════════════════ */

/* ───────────────────────────────── Media ────────────────────────────────── */

/**
 * Determines whether the given MIME type represents an image.
 *
 * @param mimeInput - The {@link MimeTypeInput MIME type input} to be checked. It can be a string or object
 * accepted by the {@link parse} function.
 * @returns A boolean indicating whether the MIME type is categorized as an image.
 * @category Checks
 */
export const isImage = (mimeInput: MimeTypeInput): boolean => {
  const record = parse(mimeInput),
    canonical = canonicalize(record);

  return record.type === 'image' || canonical.type === 'image';
};

/**
 * Determines whether the given MIME type input represents an SVG image format.
 *
 * @param mimeInput - The {@link MimeTypeInput MIME type input} to be checked. It can be a string or object
 * accepted by the {@link parse} function.
 * @returns `true` if the MIME type is `image/svg+xml`, otherwise `false`.
 * @category Checks
 */
export const isSvg = (mimeInput: MimeTypeInput): boolean =>
  parse(mimeInput).essence === 'image/svg+xml';

/**
 * Determines whether the given MIME type input represents a JPEG image format.
 *
 * @param mimeInput - The {@link MimeTypeInput MIME type input} to be checked. It can be a string or object
 * accepted by the {@link parse} function.
 * @returns `true` if the MIME type is `image/jpeg`, otherwise `false`.
 * @category Checks
 */
export const isJpeg = (mimeInput: MimeTypeInput): boolean =>
  parse(mimeInput).essence === 'image/jpeg';

/**
 * Determines whether the given MIME type input represents a PNG image format.
 *
 * @param mimeInput - The {@link MimeTypeInput MIME type input} to be checked. It can be a string or object
 * accepted by the {@link parse} function.
 * @returns `true` if the MIME type is `image/png`, otherwise `false`.
 * @category Checks
 */
export const isPng = (mimeInput: MimeTypeInput): boolean =>
  parse(mimeInput).essence === 'image/png';

/**
 * Determines whether the given MIME type input represents a GIF image format.
 *
 * @param mimeInput - The {@link MimeTypeInput MIME type input} to be checked. It can be a string or object
 * accepted by the {@link parse} function.
 * @returns `true` if the MIME type is `image/gif`, otherwise `false`.
 * @category Checks
 */
export const isGif = (mimeInput: MimeTypeInput): boolean =>
  parse(mimeInput).essence === 'image/gif';

/**
 * Determines if the given MIME type input corresponds to an audio type.
 *
 * This function processes the input MIME type, normalizes it into a canonical form,
 * and checks whether the type is classified as 'audio'.
 *
 * @param mimeInput - The {@link MimeTypeInput MIME type input} to be checked. It can be a string or object
 * accepted by the {@link parse} function.
 * @returns `true` if the MIME type is identified as an audio type, otherwise `false`.
 * @category Checks
 */
export const isAudio = (mimeInput: MimeTypeInput): boolean => {
  const mimeType = parse(mimeInput),
    canonical = canonicalize(mimeType);
  return mimeType.type === 'audio' || canonical.type === 'audio';
};

/**
 * Determines whether the given MIME type input corresponds to a video type.
 *
 * This function parses and canonicalizes the given MIME input, then evaluates
 * whether the resolved MIME type is classified as a video.
 *
 * @param mimeInput - The {@link MimeTypeInput MIME type input} to be checked. It can be a string or object
 * accepted by the {@link parse} function.
 * @returns `true` if the MIME type is a video type, otherwise `false`.
 * @category Checks
 */
export const isVideo = (mimeInput: MimeTypeInput): boolean => {
  const mimeType = parse(mimeInput),
    canonical = canonicalize(mimeType);
  return mimeType.type === 'video' || canonical.type === 'video';
};

/**
 * Determines whether the provided MIME type input corresponds to a playable media format.
 *
 * @param mimeInput - The {@link MimeTypeInput MIME type input} to be checked. It can be a string or object
 * accepted by the {@link parse} function.
 * @returns `true` if the MIME type corresponds to a playable audio or video format, or if it is identified as `application/ogg`.
 * @category Checks
 */
export const isPlayable = (mimeInput: MimeTypeInput): boolean => {
  const mimeType = canonicalize(parse(mimeInput));
  return (
    isAudio(mimeType) ||
    isVideo(mimeType) ||
    mimeType.essence === 'application/ogg'
  );
};

/**
 * Determines whether the given MIME type input corresponds to a media type.
 *
 * A media type is defined as either an image or a {@link playable playable format}. The function
 * parses the provided MIME type input and checks if it matches known image or playable media types.
 *
 * @param mimeInput - The {@link MimeTypeInput MIME type input} to be checked. It can be a string or object
 * accepted by the {@link parse} function.
 * @returns `true` if the MIME type corresponds to a media type (image or playable), otherwise `false`.
 * @category Checks
 */
export const isMedia = (mimeInput: MimeTypeInput): boolean => {
  const mimeType = parse(mimeInput);
  return isImage(mimeType) || isPlayable(mimeType);
};

/* ─────────────────────────────── Languages ──────────────────────────────── */

/**
 * Determines whether the given MIME type input represents an XML format.
 *
 * This function checks if the MIME type has a suffix of `+xml` or if its
 * canonicalized essence matches `application/xml`.
 *
 * @param mimeInput - The {@link MimeTypeInput MIME type input} to be checked. It can be a string or object
 * accepted by the {@link parse} function.
 * @returns `true` if the MIME type represents an XML format; otherwise, `false`.
 * @category Checks
 */
export const isXml = (mimeInput: MimeTypeInput): boolean => {
  const mimeType = parse(mimeInput);
  return (
    mimeType.suffix === '+xml' ||
    canonicalize(mimeType).essence === 'application/xml'
  );
};

/**
 * Determines if the given MIME type input represents an HTML document.
 *
 * This function parses the provided MIME type input and checks if its essence equals `text/html`.
 *
 * @param mimeInput - The {@link MimeTypeInput MIME type input} to be checked. It can be a string or object
 * accepted by the {@link parse} function.
 * @returns A boolean value indicating whether the MIME type corresponds to HTML.
 * @category Checks
 */
export const isHtml = (mimeInput: MimeTypeInput): boolean =>
  parse(mimeInput).essence === 'text/html';

/**
 * Determines whether the given MIME type input represents a JSON MIME type.
 *
 * Checks if the MIME type has a suffix of `+json` or if its canonicalized essence
 * matches `'application/json'`.
 *
 * @param mimeInput - The {@link MimeTypeInput MIME type input} to be checked. It can be a string or object
 * accepted by the {@link parse} function.
 * @returns `true` if the MIME type corresponds to JSON, otherwise `false`.
 * @category Checks
 */
export const isJson = (mimeInput: MimeTypeInput): boolean => {
  const mimeType = parse(mimeInput);
  return (
    mimeType.suffix === '+json' ||
    canonicalize(mimeType).essence === 'application/json'
  );
};

/**
 * Determines if the given MIME type input represents a JSON Sequence.
 *
 * A JSON Sequence is identified by the `application/json-seq` essence or a suffix of `+json-seq`.
 *
 * @param mimeInput - The {@link MimeTypeInput MIME type input} to be checked. It can be a string or object
 * accepted by the {@link parse} function.
 * @returns `true` if the MIME type represents a JSON Sequence; otherwise, `false`.
 * @category Checks
 */
export const isJsonSequence = (mimeInput: MimeTypeInput): boolean => {
  const { essence, suffix } = parse(mimeInput);
  return essence === 'application/json-seq' || suffix === '+json-seq';
};

/**
 * Determines whether a given MIME type input corresponds to a YAML content type.
 *
 * This function parses the provided MIME type input and evaluates if it matches
 * the criteria for a YAML MIME type. It checks whether the parsed MIME type
 * has a suffix of `+yaml` or its canonicalized essence of `application/yaml`.
 *
 * @param mimeInput - The {@link MimeTypeInput MIME type input} to be checked. It can be a string or object
 * accepted by the {@link parse} function.
 * @returns `true` if the MIME type represents a YAML content type, otherwise `false`.
 * @category Checks
 */
export const isYaml = (mimeInput: MimeTypeInput): boolean => {
  const mimeType = parse(mimeInput);
  return (
    mimeType.suffix === '+yaml' ||
    canonicalize(mimeType).essence === 'application/yaml'
  );
};

/**
 * Determines whether the given MIME type input corresponds to a CSV file.
 *
 * The function parses the provided MIME type input and checks if it
 * matches the criteria for a CSV format. Specifically, it verifies if
 * the MIME type suffix is `+csv` or if the canonicalized essence
 * of the MIME type is `text/csv`.
 *
 * @param mimeInput - The {@link MimeTypeInput MIME type input} to be checked. It can be a string or object
 * accepted by the {@link parse} function.
 * @returns `true` if the MIME type corresponds to a CSV file, otherwise `false`.
 * @category Checks
 */
export const isCsv = (mimeInput: MimeTypeInput): boolean => {
  const mimeType = parse(mimeInput);
  return (
    mimeType.suffix === '+csv' || canonicalize(mimeType).essence === 'text/csv'
  );
};

/**
 * Checks if the provided MIME type input corresponds to JavaScript.
 *
 * This function processes the given input by parsing and canonicalizing it,
 * ultimately comparing its essence to the MIME type string `text/javascript`.
 * Returns `true` if the input is identified as JavaScript, otherwise `false`.
 *
 * @param mimeInput - The {@link MimeTypeInput MIME type input} to be checked. It can be a string or object
 * accepted by the {@link parse} function.
 * @returns A boolean indicating whether the input represents JavaScript.
 * @remarks Has alias `isJs`.
 * @category Checks
 */
export const isJavaScript = (mimeInput: MimeTypeInput): boolean =>
  canonicalize(parse(mimeInput)).essence === 'text/javascript';

/**
 * Alias for {@link isJavaScript}.
 *
 * @category Checks
 */
export const isJs = isJavaScript;

/* ──────────────────────────────── Archives ──────────────────────────────── */

/**
 * Determines whether the provided MIME type input represents a ZIP-based format.
 *
 * This function parses the input MIME type and checks if it either has a `+zip` suffix
 * or corresponds to the canonical MIME type `application/zip`. This is useful for
 * identifying ZIP archive types based on their MIME specifications.
 *
 * @param mimeInput - The {@link MimeTypeInput MIME type input} to be checked. It can be a string or object
 * accepted by the {@link parse} function.
 * @returns `true` if the MIME type is identified as a ZIP format, otherwise `false`.
 * @category Checks
 */
export const isZip = (mimeInput: MimeTypeInput): boolean => {
  const mimeType = parse(mimeInput);
  return (
    mimeType.suffix === '+zip' ||
    canonicalize(mimeType).essence === 'application/zip'
  );
};

/**
 * Determines if the given MIME type input represents a gzip-compressed format.
 *
 * This function checks whether the MIME type has a suffix of `+gzip` or
 * matches the canonicalized essence of `application/gzip`.
 *
 * @param mimeInput - The {@link MimeTypeInput MIME type input} to be checked. It can be a string or object
 * accepted by the {@link parse} function.
 * @returns `true` if the MIME type indicates gzip compression, otherwise `false`.
 * @category Checks
 */
export const isGzip = (mimeInput: MimeTypeInput): boolean => {
  const mimeType = parse(mimeInput);
  return (
    mimeType.suffix === '+gzip' ||
    canonicalize(mimeType).essence === 'application/gzip'
  );
};

/**
 * Checks if the given MIME type represents an archive file format.
 *
 * This function determines if the MIME type corresponds to a commonly
 * recognized archive type, such as ZIP, GZIP, RAR, etc.
 *
 * @param mimeInput - The {@link MimeTypeInput MIME type input} to be checked. It can be a string or object
 * accepted by the {@link parse} function.
 * @returns A boolean indicating whether the MIME type is an archive format.
 * @category Checks
 */
export const isArchive = (mimeInput: MimeTypeInput): boolean => {
  const mimeType = canonicalize(parse(mimeInput));
  return (
    isZip(mimeType) ||
    isGzip(mimeType) ||
    extraArchiveTypes.has(mimeType.essence)
  );
};

/* ───────────────────────────── Miscellaneous ────────────────────────────── */

/**
 * Determines whether the given MIME type input corresponds to a font type.
 *
 * This function evaluates the provided MIME type input and checks if it falls
 * under the category of font types. The determination is based on standard
 * MIME type parsing and canonicalization, as well as additional font type rules
 * specified in the {@link extraFontTypes} set.
 *
 * @param mimeInput - The {@link MimeTypeInput MIME type input} to be checked. It can be a string or object
 * accepted by the {@link parse} function.
 * @returns `true` if the MIME type corresponds to a font type; otherwise `false`.
 * @category Checks
 */
export const isFont = (mimeInput: MimeTypeInput): boolean => {
  const mimeType = canonicalize(parse(mimeInput));
  return mimeType.type === 'font' || extraFontTypes.has(mimeType.essence);
};

/**
 * Determines if the provided MIME type input is categorized as an example.
 *
 * This function parses the given MIME type input into its type and subtype components
 * and checks if either the type or subtype equals 'example'.
 *
 * @param mimeInput - The {@link MimeTypeInput MIME type input} to be checked. It can be a string or object
 * accepted by the {@link parse} function.
 * @returns `true` if the type or subtype of the MIME type is 'example', otherwise `false`.
 * @category Checks
 */
export const isExample = (mimeInput: MimeTypeInput): boolean => {
  const { type, subtype } = parse(mimeInput);
  return type === 'example' || subtype === 'example';
};

/**
 * Determines if the given MIME type input represents a CBOR (Concise Binary Object Representation) type.
 *
 * A MIME type is considered CBOR if its essence matches "application/cbor" or its suffix ends in "+cbor".
 *
 * @param mimeInput - The {@link MimeTypeInput MIME type input} to be checked. It can be a string or object
 * accepted by the {@link parse} function.
 * @returns `true` if the MIME type represents a CBOR type, otherwise `false`.
 * @category Checks
 */
export const isCbor = (mimeInput: MimeTypeInput): boolean => {
  const { suffix, essence } = parse(mimeInput);
  return essence === 'application/cbor' || suffix === '+cbor';
};

/**
 * Determines if the given MIME type input corresponds to text-based data.
 *
 * This function checks the MIME type and its canonical form to evaluate
 * whether the input represents a text-based data format. It verifies if
 * the type is explicitly declared as "text", or if it has a specific suffix
 * recognized as text-related. Additionally, it checks for formats such as XML,
 * JSON, YAML, and JSON Sequence.
 *
 * @param mimeInput - The {@link MimeTypeInput MIME type input} to be checked. It can be a string or object
 * accepted by the {@link parse} function.
 * @returns A boolean indicating whether the input is text-based data.
 * @category Checks
 */
export const isTextData = (mimeInput: MimeTypeInput): boolean => {
  const mimeType = parse(mimeInput),
    canonical = canonicalize(mimeType);
  return (
    [mimeType, canonical].some(
      (mime) =>
        mime.type === 'text' ||
        hasProp(mime, 'suffix', (suffix) => textDataSuffixes.has(suffix)) ||
        isXml(mime) ||
        isJson(mime) ||
        isYaml(mime) ||
        isJsonSequence(mime),
    ) || isString(getMeta(canonical).charset)
  );
};

/* ═════════════════════════════════ By Meta ════════════════════════════════ */

/**
 * Determines whether the provided MIME type is compressible based on its characteristics.
 *
 * This function evaluates the MIME type's metadata to determine its compressibility.
 * If the `compressible` property is explicitly defined in the metadata, that value is returned.
 * Otherwise, the function evaluates additional characteristics, such as whether the input is an archive,
 * text data, or playable media. A default value can be returned if the compressibility cannot be determined.
 *
 * @param mimeInput - The {@link MimeTypeInput MIME type input} to be checked. It can be a string or object
 * accepted by the {@link parse} function.
 * @param defaultValue - The value to return when compressibility cannot be determined. Defaults to `false`.
 * @returns A boolean indicating whether the MIME type is compressible.
 * @category Checks
 */
export const isCompressible = (
  mimeInput: MimeTypeInput,
  defaultValue = false,
): boolean => {
  const record = parse(mimeInput);
  const { compressible } = getMeta(record);
  if (isBoolean(compressible)) return compressible;
  if (isArchive(record)) return false;
  if (isTextData(record)) return true;
  if (isPlayable(record)) return false;

  return defaultValue;
};
