/**
 * Defines constant sets and maps used by MIME type helpers, including extra type classifications,
 * data-oriented suffixes, and canonicalization aliases.
 *
 * @module
 */
import type { MimeTypeEssence, MimeTypeSuffix } from './types.js';

import { entries } from '@budsbox/lib-es/object';

/**
 * Additional font MIME type essences that should be treated as fonts.
 */
export const extraFontTypes = new Set<MimeTypeEssence>([
  'application/vnd.ms-fontobject',
]);

/**
 * Additional archive MIME type essences that should be treated as archives.
 *
 * Intended for use in helpers like `isArchive`, alongside checks such as `isZip` and `isGzip`.
 */
export const extraArchiveTypes = new Set<MimeTypeEssence>([
  'application/x-bzip',
  'application/x-bzip2',
  'application/x-tar',
  'application/x-7z-compressed',
]);

/**
 * MIME type suffixes that typically indicate text-friendly structured data.
 *
 * Useful for heuristics when deciding whether content is likely readable or structured (for example,
 * when a MIME type ends with one of these suffixes).
 */
export const textDataSuffixes = new Set<MimeTypeSuffix>([
  '+json',
  '+xml',
  '+yaml',
  '+jwt',
  '+jws',
  '+json-seq',
  '+csv',
]);

/**
 * Canonicalization lookup from alias essence to canonical essence.
 *
 * This map is meant to be consulted by {@link canonicalize}
 * to normalize known aliases to preferred MIME type essence.
 *
 * The sources of this map include:
 * - {@link https://www.iana.org/assignments/media-types/media-types.xhtml IANA Media Types Registry}
 * - {@link https://mimesniff.spec.whatwg.org/#mime-type-groups MIME Sniffing Standard — MIME Type Groups}
 * - {@link https://developer.mozilla.org/en-US/docs/Web/HTTP/Guides/MIME_types/Common_types Mozilla Developer Network — Common MIME Types}
 */
export const canonicalTypesMap = new Map<MimeTypeEssence, MimeTypeEssence>(
  entries({
    // <canonical essence>: <alias essence>[]
    'application/fdf': ['application/vnd.fdf'],
    'application/geo+json': ['application/vnd.geo+json'],
    'application/gzip': ['application/x-gzip'],
    'application/json': ['text/json'],
    'application/rtf': ['text/rtf'],
    'application/smil+xml': ['application/smil'],
    'application/sql': ['application/x-sql'],
    'application/vnd.3gpp.mcvideo-info+xml': [
      'application/vnd.3gpp.mcvideo-affiliation-info+xml',
    ],
    'application/vnd.afpc.afplinedata': ['application/vnd.ibm.afplinedata'],
    'application/vnd.afpc.modca': ['application/vnd.ibm.modcap'],
    'application/vnd.aristanetworks.swi': ['application/vnd.arastra.swi'],
    'application/vnd.oasis.opendocument.base': [
      'application/vnd.oasis.opendocument.database',
    ],
    'application/vnd.rar': [
      'application/x-rar-compressed',
      'application/x-compressed',
    ],
    'application/vnd.visionary': ['application/vnd.informix-visionary'],
    'application/xfdf': ['application/vnd.adobe.xfdf'],
    'application/xliff+xml': ['application/x-xliff+xml'],
    'application/xml': ['text/xml'],
    'application/zip': ['application/x-zip-compressed'],
    'audio/aac': ['audio/x-aac'],
    'audio/aiff': ['audio/x-aiff'],
    'audio/midi': ['audio/x-midi'],
    'audio/mp4': ['audio/x-m4a'],
    'audio/mpeg': ['audio/mpeg3', 'audio/mp3'],
    'audio/qcelp': ['audio/vnd.qcelp'],
    'audio/wav': [
      'audio/vnd.wave',
      'audio/vnd.wav',
      'audio/wave',
      'audio/x-wav',
      'audio/x-pn-wav',
    ],
    'font/collection': ['application/font-cff'],
    'font/otf': [
      'application/font-otf',
      'application/x-font-otf',
      'application/x-font-opentype',
      'application/vnd.ms-opentype',
    ],
    'font/sfnt': ['application/font-sfnt'],
    'font/ttf': [
      'application/font-ttf',
      'application/x-font-ttf',
      'application/x-font-truetype',
    ],
    'font/woff': ['application/font-woff'],
    'font/woff2': ['application/font-woff2'],
    'image/bmp': ['image/x-ms-bmp'],
    'image/emf': ['image/x-emf'],
    'image/vnd.microsoft.icon': ['image/x-icon'],
    'image/vnd.zbrush.pcx': ['image/x-pcx'],
    'image/wmf': ['image/x-wmf'],
    'model/x3d+fastinfoset': ['model/x3d+binary'],
    'model/x3d-vrml': ['model/x3d+vrml'],
    'text/javascript': [
      'ecmascript',
      'javascript',
      'x-ecmascript',
      'x-javascript',
      'javascript1.0',
      'javascript1.1',
      'javascript1.2',
      'javascript1.3',
      'javascript1.4',
      'javascript1.5',
      'jscript',
      'livescript',
    ].flatMap((subtype) =>
      ['application', 'text'].map(
        (type): MimeTypeEssence => `${type}/${subtype}`,
      ),
    ),
    'text/org': ['text/x-org'],
    'video/vnd.youtube.yt': ['application/vnd.youtube.yt'],
    // https://www.rfc-editor.org/rfc/rfc2361
    'video/x-msvideo': ['video/vnd.avi'],
  } as const satisfies Record<MimeTypeEssence, MimeTypeEssence[]>).flatMap(
    ([canonical, aliases]) => aliases.map((alias) => [alias, canonical]),
  ),
);
