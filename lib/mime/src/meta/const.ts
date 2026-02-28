import type {
  MimeTypeEssence,
  MimeTypeSuffix,
  WellKnownSuffixes,
} from '#types';

import type { MetaResolveOptions, MimeTypeMeta } from './types.js';

import { ROSet } from '@budsbox/lib-es/set';

import { mimeDb } from './mime-db-wrapper.js';

/**
 * Additional font MIME type essences that should be treated as fonts.
 */
export const extraFontTypes = new ROSet<MimeTypeEssence>([
  'application/vnd.ms-fontobject',
]);

/**
 * Additional archive MIME type essences that should be treated as archives.
 */
export const extraArchiveTypes = new ROSet<MimeTypeEssence>([
  'application/x-bzip',
  'application/x-bzip2',
  'application/x-tar',
  'application/x-7z-compressed',
]);

/**
 * MIME type suffixes that typically indicate text-friendly structured data.
 */
export const textDataSuffixes = new ROSet<MimeTypeSuffix>([
  '+json',
  '+xml',
  '+yaml',
  '+jwt',
  '+jws',
  '+json-seq',
  '+csv',
]);

export const suffixToMediaTypeLookup = Object.freeze({
  '+cbor': 'application/cbor',
  '+cbor-seq': 'application/cbor-seq',
  '+cose': 'application/cose',
  '+csv': 'text/csv',
  '+cwt': 'application/cwt',
  '+fastinfoset': 'application/fastinfoset',
  '+gzip': 'application/gzip',
  '+json': 'application/json',
  '+json-seq': 'application/json-seq',
  '+jwt': 'application/jwt',
  '+sqlite3': 'application/vnd.sqlite3',
  '+tlv': 'application/vnd.oma.lwm2m+tlv',
  '+wbxml': 'application/vnd.wap.wbxml',
  '+xml': 'application/xml',
  '+yaml': 'application/yaml',
  '+zip': 'application/zip',
  '+zstd': 'application/zstd',
} as const satisfies Partial<Record<WellKnownSuffixes, MimeTypeEssence>>);

/**
 * A mapping of canonical MIME types to their commonly used aliases.
 *
 * This variable contains an associative object where **the keys represent
 * the canonical essence of a MIME type**, and **the values are arrays containing
 * its alias essences**. Each essence is a unique identifier string for the type
 * of data or format, following MIME type conventions.
 *
 * The aliases listed here include variations commonly used in practical scenarios,
 * even if they are unofficial or deprecated.
 *
 * The sources of canonical MIME type essences are as follows:
 * - {@link https://www.iana.org/assignments/media-types/media-types.xhtml IANA Media Types Registry}
 * - {@link https://mimesniff.spec.whatwg.org/#mime-type-groups MIME Sniffing Standard — MIME Type Groups}
 * - {@link https://developer.mozilla.org/en-US/docs/Web/HTTP/Guides/MIME_types/Common_types Mozilla Developer Network — Common MIME Types}
 *
 * The sources of alias MIME type essences, on top of the sources above, are as follows:
 * - {@link https://gist.github.com/fnagel/259567/85859f9685e8fb1abe12d2e869831a615317e7f6}
 * - {@link https://github.com/fnagel/pluploadfe/blob/64eab6f483bdc5907dd868c73d1bac6bae3bf982/Classes/Statics/MimeTypes.php}
 * - {@link https://github.com/jshttp/mime-db `mime-db`} package
 */
export const defaultAliasesMap: Readonly<
  Record<MimeTypeEssence, MimeTypeEssence[]>
> = {
  // <canonical essence>: <alias essence>[]

  // though there's no official specification, application/cdr seems to be the most common essence for CorelDRAW files
  'application/cdr': [
    'application/x-coreldraw',
    'application/coreldraw',
    'application/x-cdr',
    'image/cdr',
    'image/coreldraw',
    'image/x-cdr',
    'image/x-coreldraw',
  ],
  'application/dotlottie+zip': ['application/zip+dotlottie'], // see https://github.com/jshttp/mime-db/issues/427
  'application/fdf': ['application/vnd.fdf'],
  'application/geo+json': ['application/vnd.geo+json'],
  'application/gzip': ['application/x-gzip'],
  'application/java-archive': [
    'application/jar',
    'application/jar-archive',
    'application/x-java-archive',
  ],
  'application/json': ['text/json'],
  'application/mathml+xml': ['application/mathml'],
  'application/pgp-encrypted': ['application/pgp'],
  'application/pkcs12': ['application/x-pkcs12'],
  'application/rtf': ['text/rtf'],
  'application/smil+xml': ['application/smil'],
  'application/sql': ['application/x-sql'],
  'application/vnd.3gpp.mcvideo-info+xml': [
    'application/vnd.3gpp.mcvideo-affiliation-info+xml',
  ],
  'application/vnd.afpc.afplinedata': ['application/vnd.ibm.afplinedata'],
  'application/vnd.afpc.modca': ['application/vnd.ibm.modcap'],
  'application/vnd.apple.keynote': ['application/x-iwork-keynote-sffkey'],
  'application/vnd.apple.mpegurl': ['audio/x-mpequrl', 'audio/x-mpegurl'],
  'application/vnd.apple.numbers': ['application/x-iwork-numbers-sffnumbers'],
  'application/vnd.apple.pages': ['application/x-iwork-pages-sffpages'],
  'application/vnd.aristanetworks.swi': ['application/vnd.arastra.swi'],
  'application/vnd.ms-excel': ['application/msexcel'],
  'application/vnd.ms-powerpoint': ['application/mspowerpoint'],
  'application/vnd.oasis.opendocument.base': [
    'application/vnd.oasis.opendocument.database',
  ],
  'application/vnd.oasis.opendocument.text': [
    'application/x-vnd.oasis.opendocument.text',
  ],
  'application/vnd.quark.quarkxpress': ['application/x-quark-express'],
  'application/vnd.rar': [
    'application/x-rar-compressed',
    'application/x-compressed',
  ],
  'application/vnd.visionary': ['application/vnd.informix-visionary'],
  'application/x-tar': ['application/tar'], // application/x-tar is not official, but the most common
  'application/xfdf': ['application/vnd.adobe.xfdf'],
  'application/xliff+xml': ['application/x-xliff+xml'],
  'application/xml': ['text/xml'],
  'application/yaml': ['text/yaml', 'text/x-yaml', 'application/x-yaml'], // https://datatracker.ietf.org/doc/html/rfc7303#section-4.1
  'application/zip': [
    'application/x-zip-compressed',
    'application/x-zip',
    'application/zip-compressed',
  ],
  'audio/aac': ['audio/x-aac'],
  'audio/aiff': ['audio/x-aiff'],
  'audio/flac': ['audio/x-flac'],
  'audio/matroska': ['audio/x-matroska'],
  'audio/midi': ['audio/x-midi'],
  'audio/mp4': ['audio/x-m4a', 'audio/m4a'],
  'audio/mpeg': ['audio/mpeg3', 'audio/mp3'],
  'audio/qcelp': ['audio/vnd.qcelp'],
  'audio/wav': [
    'audio/vnd.wave',
    'audio/vnd.wav',
    'audio/wave',
    'audio/x-wav',
    'audio/x-pn-wav',
  ],
  'audio/x-pn-realaudio': [
    'audio/vnd.rn-realaudio',
    'audio/x-realaudio',
    'application/vnd.rn-realmedia',
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
  'image/jpeg': ['image/pjpeg', 'image/x-jpeg'],
  'image/jpm': ['video/jpm', 'image/x-jpm'],
  'image/svg+xml': ['image/svg', 'image/xml-svg', 'text/xml-svg'],
  'image/vnd.dwg': ['application/acad'],
  'image/vnd.microsoft.icon': ['image/x-icon'],
  'image/vnd.zbrush.pcx': ['image/x-pcx'],
  'image/wmf': ['image/x-wmf'],
  'model/vrml': ['x-world/x-vrml'],
  'model/x3d+fastinfoset': ['model/x3d+binary'],
  'model/x3d-vrml': ['model/x3d+vrml'],
  'text/csv': ['text/comma-separated-values', 'text/x-comma-separated-values'],
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
  'text/markdown': ['text/x-markdown'],
  'text/org': ['text/x-org'],
  'text/sgml': ['text/x-sgml'],
  'text/vcard': ['text/x-vcard'],
  'video/matroska': ['video/x-matroska'],
  'video/vnd.youtube.yt': ['application/vnd.youtube.yt'],
  'video/x-msvideo': ['video/vnd.avi'],
};

[defaultAliasesMap, ...Object.values(defaultAliasesMap)].forEach(Object.freeze);

/**
 * Immutable object containing default metadata for MIME types.
 */
export const defaultMeta = Object.freeze({
  extensions: new ROSet(),
} as const satisfies MimeTypeMeta);

/**
 * Immutable default options used for resolving metadata.
 */
export const defaultResolveOptions = Object.freeze({
  aliases: Object.freeze({}),
  db: mimeDb,
  keepCharsetCase: false,
  noMerge: false,
  setCharset: false,
} as const satisfies Required<MetaResolveOptions>);
