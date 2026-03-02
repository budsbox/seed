import { describe, expect, test } from 'vitest';

import {
  isApache,
  isArchive,
  isAudio,
  isCbor,
  isCsv,
  isExample,
  isFont,
  isGif,
  isGzip,
  isHtml,
  isIana,
  isImage,
  isJavaScript,
  isJs,
  isJson,
  isJsonSequence,
  isJpeg,
  isMedia,
  isNginx,
  isPersonalTree,
  isPlayable,
  isPng,
  isStandardsTree,
  isSvg,
  isUnregistered,
  isVendorTree,
  isVideo,
  isWellKnown,
  isXml,
  isYaml,
  isZip,
  isTextData,
  isCompressible,
} from '#meta/guards';

// ─── isWellKnown ────────────────────────────────────────────────────────────

describe.concurrent('isWellKnown', () => {
  test('returns true for a known MIME type', () => {
    expect(isWellKnown('text/html')).toBe(true);
  });

  test('returns true for a known MIME type with params', () => {
    expect(isWellKnown('application/json; charset=utf-8')).toBe(true);
  });

  test('returns false for an unknown MIME type', () => {
    expect(isWellKnown('application/x-totally-made-up-type')).toBe(false);
  });
});

// ─── isIana ─────────────────────────────────────────────────────────────────

describe.concurrent('isIana', () => {
  test('returns true for an IANA-sourced MIME type', () => {
    expect(isIana('text/html')).toBe(true);
  });

  test('returns false for a non-IANA MIME type', () => {
    expect(isIana('application/x-totally-unknown')).toBe(false);
  });
});

// ─── isApache ───────────────────────────────────────────────────────────────

describe.concurrent('isApache', () => {
  test('returns true for an Apache-sourced MIME type', () => {
    expect(isApache('application/x-dvi')).toBe(true);
  });

  test('returns false for an IANA MIME type', () => {
    expect(isApache('text/html')).toBe(false);
  });
});

// ─── isNginx ────────────────────────────────────────────────────────────────

describe.concurrent('isNginx', () => {
  test('returns true for an Nginx-sourced MIME type', () => {
    expect(isNginx('application/x-cocoa')).toBe(true);
  });

  test('returns false for an IANA MIME type', () => {
    expect(isNginx('text/html')).toBe(false);
  });
});

// ─── isUnregistered ─────────────────────────────────────────────────────────

describe.concurrent('isUnregistered', () => {
  test('returns true for a non-IANA MIME type', () => {
    expect(isUnregistered('application/x-totally-unknown')).toBe(true);
  });

  test('returns false for an IANA MIME type', () => {
    expect(isUnregistered('text/html')).toBe(false);
  });
});

// ─── isStandardsTree ────────────────────────────────────────────────────────

describe.concurrent('isStandardsTree', () => {
  test('returns true for a standards-tree type (no facet)', () => {
    expect(isStandardsTree('text/html')).toBe(true);
  });

  test('returns false for a vendor-tree type', () => {
    expect(isStandardsTree('application/vnd.ms-excel')).toBe(false);
  });

  test('returns false for a personal-tree type', () => {
    expect(isStandardsTree('application/prs.cww')).toBe(false);
  });
});

// ─── isVendorTree ───────────────────────────────────────────────────────────

describe.concurrent('isVendorTree', () => {
  test('returns true for a vnd. MIME type', () => {
    expect(isVendorTree('application/vnd.ms-excel')).toBe(true);
  });

  test('returns false for a standards-tree type', () => {
    expect(isVendorTree('text/html')).toBe(false);
  });

  test('returns false for a personal-tree type', () => {
    expect(isVendorTree('application/prs.cww')).toBe(false);
  });
});

// ─── isPersonalTree ─────────────────────────────────────────────────────────

describe.concurrent('isPersonalTree', () => {
  test('returns true for a prs. MIME type', () => {
    expect(isPersonalTree('application/prs.cww')).toBe(true);
  });

  test('returns false for a standards-tree type', () => {
    expect(isPersonalTree('text/html')).toBe(false);
  });

  test('returns false for a vendor-tree type', () => {
    expect(isPersonalTree('application/vnd.ms-excel')).toBe(false);
  });
});

// ─── isImage ────────────────────────────────────────────────────────────────

describe.concurrent('isImage', () => {
  test('returns true for image/png', () => {
    expect(isImage('image/png')).toBe(true);
  });

  test('returns true for image/jpeg', () => {
    expect(isImage('image/jpeg')).toBe(true);
  });

  test('returns true for an alias that canonicalizes to image type', () => {
    expect(isImage('image/x-icon')).toBe(true);
  });

  test('returns false for text/html', () => {
    expect(isImage('text/html')).toBe(false);
  });
});

// ─── isSvg ──────────────────────────────────────────────────────────────────

describe.concurrent('isSvg', () => {
  test('returns true for image/svg+xml', () => {
    expect(isSvg('image/svg+xml')).toBe(true);
  });

  test('returns false for image/png', () => {
    expect(isSvg('image/png')).toBe(false);
  });

  test('returns false for an svg alias (essence check only)', () => {
    expect(isSvg('image/svg')).toBe(false);
  });
});

// ─── isJpeg ─────────────────────────────────────────────────────────────────

describe.concurrent('isJpeg', () => {
  test('returns true for image/jpeg', () => {
    expect(isJpeg('image/jpeg')).toBe(true);
  });

  test('returns false for image/png', () => {
    expect(isJpeg('image/png')).toBe(false);
  });

  test('returns false for a jpeg alias (essence check only)', () => {
    expect(isJpeg('image/pjpeg')).toBe(false);
  });
});

// ─── isPng ──────────────────────────────────────────────────────────────────

describe.concurrent('isPng', () => {
  test('returns true for image/png', () => {
    expect(isPng('image/png')).toBe(true);
  });

  test('returns false for image/jpeg', () => {
    expect(isPng('image/jpeg')).toBe(false);
  });
});

// ─── isGif ──────────────────────────────────────────────────────────────────

describe.concurrent('isGif', () => {
  test('returns true for image/gif', () => {
    expect(isGif('image/gif')).toBe(true);
  });

  test('returns false for image/png', () => {
    expect(isGif('image/png')).toBe(false);
  });
});

// ─── isAudio ────────────────────────────────────────────────────────────────

describe.concurrent('isAudio', () => {
  test('returns true for audio/mpeg', () => {
    expect(isAudio('audio/mpeg')).toBe(true);
  });

  test('returns true for an alias that canonicalizes to audio type', () => {
    expect(isAudio('audio/x-aac')).toBe(true);
  });

  test('returns false for video/mp4', () => {
    expect(isAudio('video/mp4')).toBe(false);
  });
});

// ─── isVideo ────────────────────────────────────────────────────────────────

describe.concurrent('isVideo', () => {
  test('returns true for video/mp4', () => {
    expect(isVideo('video/mp4')).toBe(true);
  });

  test('returns true for an alias that canonicalizes to video type', () => {
    expect(isVideo('video/x-matroska')).toBe(true);
  });

  test('returns false for audio/mpeg', () => {
    expect(isVideo('audio/mpeg')).toBe(false);
  });
});

// ─── isPlayable ─────────────────────────────────────────────────────────────

describe.concurrent('isPlayable', () => {
  test('returns true for audio/mpeg', () => {
    expect(isPlayable('audio/mpeg')).toBe(true);
  });

  test('returns true for video/mp4', () => {
    expect(isPlayable('video/mp4')).toBe(true);
  });

  test('returns true for application/ogg', () => {
    expect(isPlayable('application/ogg')).toBe(true);
  });

  test('returns false for image/png', () => {
    expect(isPlayable('image/png')).toBe(false);
  });

  test('returns false for text/html', () => {
    expect(isPlayable('text/html')).toBe(false);
  });
});

// ─── isMedia ────────────────────────────────────────────────────────────────

describe.concurrent('isMedia', () => {
  test('returns true for an image type', () => {
    expect(isMedia('image/png')).toBe(true);
  });

  test('returns true for a playable type', () => {
    expect(isMedia('audio/mpeg')).toBe(true);
  });

  test('returns false for text/html', () => {
    expect(isMedia('text/html')).toBe(false);
  });

  test('returns false for application/json', () => {
    expect(isMedia('application/json')).toBe(false);
  });
});

// ─── isXml ──────────────────────────────────────────────────────────────────

describe.concurrent('isXml', () => {
  test('returns true for application/xml', () => {
    expect(isXml('application/xml')).toBe(true);
  });

  test('returns true for a type with +xml suffix', () => {
    expect(isXml('application/atom+xml')).toBe(true);
  });

  test('returns true for text/xml alias', () => {
    expect(isXml('text/xml')).toBe(true);
  });

  test('returns false for application/json', () => {
    expect(isXml('application/json')).toBe(false);
  });
});

// ─── isHtml ─────────────────────────────────────────────────────────────────

describe.concurrent('isHtml', () => {
  test('returns true for text/html', () => {
    expect(isHtml('text/html')).toBe(true);
  });

  test('returns false for application/xhtml+xml', () => {
    expect(isHtml('application/xhtml+xml')).toBe(false);
  });

  test('returns false for text/plain', () => {
    expect(isHtml('text/plain')).toBe(false);
  });
});

// ─── isJson ─────────────────────────────────────────────────────────────────

describe.concurrent('isJson', () => {
  test('returns true for application/json', () => {
    expect(isJson('application/json')).toBe(true);
  });

  test('returns true for a type with +json suffix', () => {
    expect(isJson('application/geo+json')).toBe(true);
  });

  test('returns true for text/json alias', () => {
    expect(isJson('text/json')).toBe(true);
  });

  test('returns false for text/html', () => {
    expect(isJson('text/html')).toBe(false);
  });
});

// ─── isJsonSequence ─────────────────────────────────────────────────────────

describe.concurrent('isJsonSequence', () => {
  test('returns true for application/json-seq', () => {
    expect(isJsonSequence('application/json-seq')).toBe(true);
  });

  test('returns true for a type with +json-seq suffix', () => {
    expect(isJsonSequence('application/vnd.example+json-seq')).toBe(true);
  });

  test('returns false for application/json', () => {
    expect(isJsonSequence('application/json')).toBe(false);
  });
});

// ─── isYaml ─────────────────────────────────────────────────────────────────

describe.concurrent('isYaml', () => {
  test('returns true for application/yaml', () => {
    expect(isYaml('application/yaml')).toBe(true);
  });

  test('returns true for a type with +yaml suffix', () => {
    expect(isYaml('application/vnd.example+yaml')).toBe(true);
  });

  test('returns true for text/yaml alias', () => {
    expect(isYaml('text/yaml')).toBe(true);
  });

  test('returns false for application/json', () => {
    expect(isYaml('application/json')).toBe(false);
  });
});

// ─── isCsv ──────────────────────────────────────────────────────────────────

describe.concurrent('isCsv', () => {
  test('returns true for text/csv', () => {
    expect(isCsv('text/csv')).toBe(true);
  });

  test('returns true for a type with +csv suffix', () => {
    expect(isCsv('application/vnd.example+csv')).toBe(true);
  });

  test('returns true for text/comma-separated-values alias', () => {
    expect(isCsv('text/comma-separated-values')).toBe(true);
  });

  test('returns false for application/json', () => {
    expect(isCsv('application/json')).toBe(false);
  });
});

// ─── isJavaScript / isJs ────────────────────────────────────────────────────

describe.concurrent('isJavaScript', () => {
  test('returns true for text/javascript', () => {
    expect(isJavaScript('text/javascript')).toBe(true);
  });

  test('returns true for application/javascript alias', () => {
    expect(isJavaScript('application/javascript')).toBe(true);
  });

  test('returns true for application/x-javascript alias', () => {
    expect(isJavaScript('application/x-javascript')).toBe(true);
  });

  test('returns false for text/html', () => {
    expect(isJavaScript('text/html')).toBe(false);
  });
});

describe.concurrent('isJs', () => {
  test('is an alias for isJavaScript', () => {
    expect(isJs).toBe(isJavaScript);
  });
});

// ─── isZip ──────────────────────────────────────────────────────────────────

describe.concurrent('isZip', () => {
  test('returns true for application/zip', () => {
    expect(isZip('application/zip')).toBe(true);
  });

  test('returns true for a type with +zip suffix', () => {
    expect(isZip('application/vnd.example+zip')).toBe(true);
  });

  test('returns true for application/x-zip-compressed alias', () => {
    expect(isZip('application/x-zip-compressed')).toBe(true);
  });

  test('returns false for application/gzip', () => {
    expect(isZip('application/gzip')).toBe(false);
  });
});

// ─── isGzip ─────────────────────────────────────────────────────────────────

describe.concurrent('isGzip', () => {
  test('returns true for application/gzip', () => {
    expect(isGzip('application/gzip')).toBe(true);
  });

  test('returns true for application/x-gzip alias', () => {
    expect(isGzip('application/x-gzip')).toBe(true);
  });

  test('returns true for a type with +gzip suffix', () => {
    expect(isGzip('application/vnd.example+gzip')).toBe(true);
  });

  test('returns false for application/zip', () => {
    expect(isGzip('application/zip')).toBe(false);
  });
});

// ─── isArchive ──────────────────────────────────────────────────────────────

describe.concurrent('isArchive', () => {
  test('returns true for application/zip', () => {
    expect(isArchive('application/zip')).toBe(true);
  });

  test('returns true for application/gzip', () => {
    expect(isArchive('application/gzip')).toBe(true);
  });

  test('returns true for application/x-tar (extraArchiveTypes)', () => {
    expect(isArchive('application/x-tar')).toBe(true);
  });

  test('returns true for application/x-7z-compressed (extraArchiveTypes)', () => {
    expect(isArchive('application/x-7z-compressed')).toBe(true);
  });

  test('returns true for application/vnd.rar (extraArchiveTypes)', () => {
    expect(isArchive('application/vnd.rar')).toBe(true);
  });

  test('returns false for image/png', () => {
    expect(isArchive('image/png')).toBe(false);
  });

  test('returns false for text/html', () => {
    expect(isArchive('text/html')).toBe(false);
  });
});

// ─── isFont ─────────────────────────────────────────────────────────────────

describe.concurrent('isFont', () => {
  test('returns true for font/woff2', () => {
    expect(isFont('font/woff2')).toBe(true);
  });

  test('returns true for font/ttf', () => {
    expect(isFont('font/ttf')).toBe(true);
  });

  test('returns true for application/vnd.ms-fontobject (extraFontTypes)', () => {
    expect(isFont('application/vnd.ms-fontobject')).toBe(true);
  });

  test('returns true for application/font-woff alias', () => {
    expect(isFont('application/font-woff')).toBe(true);
  });

  test('returns false for image/png', () => {
    expect(isFont('image/png')).toBe(false);
  });
});

// ─── isExample ──────────────────────────────────────────────────────────────

describe.concurrent('isExample', () => {
  test('returns true when type is "example"', () => {
    expect(isExample('example/foo')).toBe(true);
  });

  test('returns true when subtype is "example"', () => {
    expect(isExample('application/example')).toBe(true);
  });

  test('returns false for text/html', () => {
    expect(isExample('text/html')).toBe(false);
  });
});

// ─── isCbor ─────────────────────────────────────────────────────────────────

describe.concurrent('isCbor', () => {
  test('returns true for application/cbor', () => {
    expect(isCbor('application/cbor')).toBe(true);
  });

  test('returns true for a type with +cbor suffix', () => {
    expect(isCbor('application/vnd.example+cbor')).toBe(true);
  });

  test('returns false for application/json', () => {
    expect(isCbor('application/json')).toBe(false);
  });

  test('returns false for application/cbor-seq (no suffix match)', () => {
    expect(isCbor('application/cbor-seq')).toBe(false);
  });
});

// ─── isTextData ─────────────────────────────────────────────────────────────

describe.concurrent('isTextData', () => {
  // text/* types
  test('returns true for text/plain', () => {
    expect(isTextData('text/plain')).toBe(true);
  });

  test('returns true for text/html', () => {
    expect(isTextData('text/html')).toBe(true);
  });

  test('returns true for text/css', () => {
    expect(isTextData('text/css')).toBe(true);
  });

  // XML types
  test('returns true for application/xml', () => {
    expect(isTextData('application/xml')).toBe(true);
  });

  test('returns true for text/xml alias', () => {
    expect(isTextData('text/xml')).toBe(true);
  });

  test('returns true for a type with +xml suffix', () => {
    expect(isTextData('application/atom+xml')).toBe(true);
  });

  test('returns true for image/svg+xml (xml suffix on non-text type)', () => {
    expect(isTextData('image/svg+xml')).toBe(true);
  });

  // JSON types
  test('returns true for application/json', () => {
    expect(isTextData('application/json')).toBe(true);
  });

  test('returns true for text/json alias', () => {
    expect(isTextData('text/json')).toBe(true);
  });

  test('returns true for a type with +json suffix', () => {
    expect(isTextData('application/geo+json')).toBe(true);
  });

  // JSON Sequence types
  test('returns true for application/json-seq', () => {
    expect(isTextData('application/json-seq')).toBe(true);
  });

  test('returns true for a type with +json-seq suffix', () => {
    expect(isTextData('application/vnd.example+json-seq')).toBe(true);
  });

  // YAML types
  test('returns true for application/yaml', () => {
    expect(isTextData('application/yaml')).toBe(true);
  });

  test('returns true for text/yaml alias', () => {
    expect(isTextData('text/yaml')).toBe(true);
  });

  test('returns true for a type with +yaml suffix', () => {
    expect(isTextData('application/vnd.example+yaml')).toBe(true);
  });

  // textDataSuffixes: +jwt, +jws, +csv
  test('returns true for a type with +jwt suffix', () => {
    expect(isTextData('application/vnd.example+jwt')).toBe(true);
  });

  test('returns true for a type with +csv suffix', () => {
    expect(isTextData('application/vnd.example+csv')).toBe(true);
  });

  // charset-based detection
  test('returns true for text/javascript (has charset in meta)', () => {
    expect(isTextData('text/javascript')).toBe(true);
  });

  test('returns true for application/javascript alias (canonicalizes, has charset)', () => {
    expect(isTextData('application/javascript')).toBe(true);
  });

  // Negative cases
  test('returns false for image/png', () => {
    expect(isTextData('image/png')).toBe(false);
  });

  test('returns false for audio/mpeg', () => {
    expect(isTextData('audio/mpeg')).toBe(false);
  });

  test('returns false for video/mp4', () => {
    expect(isTextData('video/mp4')).toBe(false);
  });

  test('returns false for application/zip', () => {
    expect(isTextData('application/zip')).toBe(false);
  });

  test('returns false for application/octet-stream', () => {
    expect(isTextData('application/octet-stream')).toBe(false);
  });

  test('returns false for font/woff2', () => {
    expect(isTextData('font/woff2')).toBe(false);
  });

  test('returns false for application/x-tar (archive)', () => {
    expect(isTextData('application/x-tar')).toBe(false);
  });
});

// ─── isCompressible ─────────────────────────────────────────────────────────

describe.concurrent('isCompressible', () => {
  // Explicit compressible=true in mime-db
  test('returns true for application/json (compressible in db)', () => {
    expect(isCompressible('application/json')).toBe(true);
  });

  test('returns true for text/html (compressible in db)', () => {
    expect(isCompressible('text/html')).toBe(true);
  });

  // Explicit compressible=false in mime-db
  test('returns false for image/png (compressible=false in db)', () => {
    expect(isCompressible('image/png')).toBe(false);
  });

  // Fallback: archive → false
  test('returns false for application/zip (archive)', () => {
    expect(isCompressible('application/zip')).toBe(false);
  });

  test('returns false for application/gzip (archive)', () => {
    expect(isCompressible('application/gzip')).toBe(false);
  });

  test("returns false for application/x-tar (tar doesn't compress files inside)", () => {
    expect(isCompressible('application/x-tar')).toBe(true);
  });

  // Fallback: text data → true
  test('returns true for text/csv (text data fallback)', () => {
    expect(isCompressible('text/csv')).toBe(true);
  });

  test('returns true for application/yaml (text data fallback)', () => {
    expect(isCompressible('application/yaml')).toBe(true);
  });

  // Fallback: playable → false
  test('returns false for audio/wav (playable fallback)', () => {
    expect(isCompressible('audio/wav')).toBe(false);
  });

  test('returns false for video/mp4 (playable fallback)', () => {
    expect(isCompressible('video/mp4')).toBe(false);
  });

  // Default value parameter
  test('returns false by default when compressibility cannot be determined', () => {
    expect(isCompressible('application/vnd.x-unknown-type-xyzzy')).toBe(false);
  });

  test('returns true when defaultValue=true and compressibility cannot be determined', () => {
    expect(isCompressible('application/vnd.x-unknown-type-xyzzy', true)).toBe(
      true,
    );
  });

  test('returns false when defaultValue=false and compressibility cannot be determined', () => {
    expect(isCompressible('application/vnd.x-unknown-type-xyzzy', false)).toBe(
      false,
    );
  });
});
