import { describe, expect, it } from 'vitest';

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
} from '#meta/guards';

// ─── isWellKnown ────────────────────────────────────────────────────────────

describe('isWellKnown', () => {
  it('returns true for a known MIME type', () => {
    expect(isWellKnown('text/html')).toBe(true);
  });

  it('returns true for a known MIME type with params', () => {
    expect(isWellKnown('application/json; charset=utf-8')).toBe(true);
  });

  it('returns false for an unknown MIME type', () => {
    expect(isWellKnown('application/x-totally-made-up-type')).toBe(false);
  });
});

// ─── isIana ─────────────────────────────────────────────────────────────────

describe('isIana', () => {
  it('returns true for an IANA-sourced MIME type', () => {
    expect(isIana('text/html')).toBe(true);
  });

  it('returns false for a non-IANA MIME type', () => {
    // application/x-www-form-urlencoded is typically sourced from apache/nginx
    expect(isIana('application/x-totally-unknown')).toBe(false);
  });
});

// ─── isApache ───────────────────────────────────────────────────────────────

describe('isApache', () => {
  it('returns true for an Apache-sourced MIME type', () => {
    expect(isApache('application/x-dvi')).toBe(true);
  });

  it('returns false for an IANA MIME type', () => {
    expect(isApache('text/html')).toBe(false);
  });
});

// ─── isNginx ────────────────────────────────────────────────────────────────

describe('isNginx', () => {
  it('returns true for an Nginx-sourced MIME type', () => {
    expect(isNginx('application/x-cocoa')).toBe(true);
  });

  it('returns false for an IANA MIME type', () => {
    expect(isNginx('text/html')).toBe(false);
  });
});

// ─── isUnregistered ─────────────────────────────────────────────────────────

describe('isUnregistered', () => {
  it('returns true for a non-IANA MIME type', () => {
    expect(isUnregistered('application/x-totally-unknown')).toBe(true);
  });

  it('returns false for an IANA MIME type', () => {
    expect(isUnregistered('text/html')).toBe(false);
  });
});

// ─── isStandardsTree ────────────────────────────────────────────────────────

describe('isStandardsTree', () => {
  it('returns true for a standards-tree type (no facet)', () => {
    expect(isStandardsTree('text/html')).toBe(true);
  });

  it('returns false for a vendor-tree type', () => {
    expect(isStandardsTree('application/vnd.ms-excel')).toBe(false);
  });

  it('returns false for a personal-tree type', () => {
    expect(isStandardsTree('application/prs.cww')).toBe(false);
  });
});

// ─── isVendorTree ───────────────────────────────────────────────────────────

describe('isVendorTree', () => {
  it('returns true for a vnd. MIME type', () => {
    expect(isVendorTree('application/vnd.ms-excel')).toBe(true);
  });

  it('returns false for a standards-tree type', () => {
    expect(isVendorTree('text/html')).toBe(false);
  });

  it('returns false for a personal-tree type', () => {
    expect(isVendorTree('application/prs.cww')).toBe(false);
  });
});

// ─── isPersonalTree ─────────────────────────────────────────────────────────

describe('isPersonalTree', () => {
  it('returns true for a prs. MIME type', () => {
    expect(isPersonalTree('application/prs.cww')).toBe(true);
  });

  it('returns false for a standards-tree type', () => {
    expect(isPersonalTree('text/html')).toBe(false);
  });

  it('returns false for a vendor-tree type', () => {
    expect(isPersonalTree('application/vnd.ms-excel')).toBe(false);
  });
});

// ─── isImage ────────────────────────────────────────────────────────────────

describe('isImage', () => {
  it('returns true for image/png', () => {
    expect(isImage('image/png')).toBe(true);
  });

  it('returns true for image/jpeg', () => {
    expect(isImage('image/jpeg')).toBe(true);
  });

  it('returns true for an alias that canonicalizes to image type', () => {
    expect(isImage('image/x-icon')).toBe(true);
  });

  it('returns false for text/html', () => {
    expect(isImage('text/html')).toBe(false);
  });
});

// ─── isSvg ──────────────────────────────────────────────────────────────────

describe('isSvg', () => {
  it('returns true for image/svg+xml', () => {
    expect(isSvg('image/svg+xml')).toBe(true);
  });

  it('returns false for image/png', () => {
    expect(isSvg('image/png')).toBe(false);
  });

  it('returns false for a non-svg alias (canonical check not performed here)', () => {
    expect(isSvg('image/svg')).toBe(false);
  });
});

// ─── isJpeg ─────────────────────────────────────────────────────────────────

describe('isJpeg', () => {
  it('returns true for image/jpeg', () => {
    expect(isJpeg('image/jpeg')).toBe(true);
  });

  it('returns false for image/png', () => {
    expect(isJpeg('image/png')).toBe(false);
  });

  it('returns false for a jpeg alias (essence check only)', () => {
    expect(isJpeg('image/pjpeg')).toBe(false);
  });
});

// ─── isPng ──────────────────────────────────────────────────────────────────

describe('isPng', () => {
  it('returns true for image/png', () => {
    expect(isPng('image/png')).toBe(true);
  });

  it('returns false for image/jpeg', () => {
    expect(isPng('image/jpeg')).toBe(false);
  });
});

// ─── isGif ──────────────────────────────────────────────────────────────────

describe('isGif', () => {
  it('returns true for image/gif', () => {
    expect(isGif('image/gif')).toBe(true);
  });

  it('returns false for image/png', () => {
    expect(isGif('image/png')).toBe(false);
  });
});

// ─── isAudio ────────────────────────────────────────────────────────────────

describe('isAudio', () => {
  it('returns true for audio/mpeg', () => {
    expect(isAudio('audio/mpeg')).toBe(true);
  });

  it('returns true for an alias that canonicalizes to audio type', () => {
    expect(isAudio('audio/x-aac')).toBe(true);
  });

  it('returns false for video/mp4', () => {
    expect(isAudio('video/mp4')).toBe(false);
  });
});

// ─── isVideo ────────────────────────────────────────────────────────────────

describe('isVideo', () => {
  it('returns true for video/mp4', () => {
    expect(isVideo('video/mp4')).toBe(true);
  });

  it('returns true for an alias that canonicalizes to video type', () => {
    expect(isVideo('video/x-matroska')).toBe(true);
  });

  it('returns false for audio/mpeg', () => {
    expect(isVideo('audio/mpeg')).toBe(false);
  });
});

// ─── isPlayable ─────────────────────────────────────────────────────────────

describe('isPlayable', () => {
  it('returns true for audio/mpeg', () => {
    expect(isPlayable('audio/mpeg')).toBe(true);
  });

  it('returns true for video/mp4', () => {
    expect(isPlayable('video/mp4')).toBe(true);
  });

  it('returns true for application/ogg', () => {
    expect(isPlayable('application/ogg')).toBe(true);
  });

  it('returns false for image/png', () => {
    expect(isPlayable('image/png')).toBe(false);
  });

  it('returns false for text/html', () => {
    expect(isPlayable('text/html')).toBe(false);
  });
});

// ─── isMedia ────────────────────────────────────────────────────────────────

describe('isMedia', () => {
  it('returns true for an image type', () => {
    expect(isMedia('image/png')).toBe(true);
  });

  it('returns true for a playable type', () => {
    expect(isMedia('audio/mpeg')).toBe(true);
  });

  it('returns false for text/html', () => {
    expect(isMedia('text/html')).toBe(false);
  });

  it('returns false for application/json', () => {
    expect(isMedia('application/json')).toBe(false);
  });
});

// ─── isXml ──────────────────────────────────────────────────────────────────

describe('isXml', () => {
  it('returns true for application/xml', () => {
    expect(isXml('application/xml')).toBe(true);
  });

  it('returns true for a type with +xml suffix', () => {
    expect(isXml('application/atom+xml')).toBe(true);
  });

  it('returns true for text/xml alias (canonicalizes to application/xml)', () => {
    expect(isXml('text/xml')).toBe(true);
  });

  it('returns false for application/json', () => {
    expect(isXml('application/json')).toBe(false);
  });
});

// ─── isHtml ─────────────────────────────────────────────────────────────────

describe('isHtml', () => {
  it('returns true for text/html', () => {
    expect(isHtml('text/html')).toBe(true);
  });

  it('returns false for application/xhtml+xml', () => {
    expect(isHtml('application/xhtml+xml')).toBe(false);
  });

  it('returns false for text/plain', () => {
    expect(isHtml('text/plain')).toBe(false);
  });
});

// ─── isJson ─────────────────────────────────────────────────────────────────

describe('isJson', () => {
  it('returns true for application/json', () => {
    expect(isJson('application/json')).toBe(true);
  });

  it('returns true for a type with +json suffix', () => {
    expect(isJson('application/geo+json')).toBe(true);
  });

  it('returns true for text/json alias', () => {
    expect(isJson('text/json')).toBe(true);
  });

  it('returns false for text/html', () => {
    expect(isJson('text/html')).toBe(false);
  });
});

// ─── isJsonSequence ─────────────────────────────────────────────────────────

describe('isJsonSequence', () => {
  it('returns true for application/json-seq', () => {
    expect(isJsonSequence('application/json-seq')).toBe(true);
  });

  it('returns true for a type with +json-seq suffix', () => {
    expect(isJsonSequence('application/vnd.example+json-seq')).toBe(true);
  });

  it('returns false for application/json', () => {
    expect(isJsonSequence('application/json')).toBe(false);
  });
});

// ─── isYaml ─────────────────────────────────────────────────────────────────

describe('isYaml', () => {
  it('returns true for application/yaml', () => {
    expect(isYaml('application/yaml')).toBe(true);
  });

  it('returns true for a type with +yaml suffix', () => {
    expect(isYaml('application/vnd.example+yaml')).toBe(true);
  });

  it('returns true for text/yaml alias', () => {
    expect(isYaml('text/yaml')).toBe(true);
  });

  it('returns false for application/json', () => {
    expect(isYaml('application/json')).toBe(false);
  });
});

// ─── isCsv ──────────────────────────────────────────────────────────────────

describe('isCsv', () => {
  it('returns true for text/csv', () => {
    expect(isCsv('text/csv')).toBe(true);
  });

  it('returns true for a type with +csv suffix', () => {
    expect(isCsv('application/vnd.example+csv')).toBe(true);
  });

  it('returns true for text/comma-separated-values alias', () => {
    expect(isCsv('text/comma-separated-values')).toBe(true);
  });

  it('returns false for application/json', () => {
    expect(isCsv('application/json')).toBe(false);
  });
});

// ─── isJavaScript / isJs ────────────────────────────────────────────────────

describe('isJavaScript', () => {
  it('returns true for text/javascript', () => {
    expect(isJavaScript('text/javascript')).toBe(true);
  });

  it('returns true for application/javascript alias', () => {
    expect(isJavaScript('application/javascript')).toBe(true);
  });

  it('returns true for application/x-javascript alias', () => {
    expect(isJavaScript('application/x-javascript')).toBe(true);
  });

  it('returns false for text/html', () => {
    expect(isJavaScript('text/html')).toBe(false);
  });
});

describe('isJs', () => {
  it('is an alias for isJavaScript', () => {
    expect(isJs).toBe(isJavaScript);
  });
});

// ─── isZip ──────────────────────────────────────────────────────────────────

describe('isZip', () => {
  it('returns true for application/zip', () => {
    expect(isZip('application/zip')).toBe(true);
  });

  it('returns true for a type with +zip suffix', () => {
    expect(isZip('application/vnd.example+zip')).toBe(true);
  });

  it('returns true for application/x-zip-compressed alias', () => {
    expect(isZip('application/x-zip-compressed')).toBe(true);
  });

  it('returns false for application/gzip', () => {
    expect(isZip('application/gzip')).toBe(false);
  });
});

// ─── isGzip ─────────────────────────────────────────────────────────────────

describe('isGzip', () => {
  it('returns true for application/gzip', () => {
    expect(isGzip('application/gzip')).toBe(true);
  });

  it('returns true for application/x-gzip alias', () => {
    expect(isGzip('application/x-gzip')).toBe(true);
  });

  it('returns true for a type with +gzip suffix', () => {
    expect(isGzip('application/vnd.example+gzip')).toBe(true);
  });

  it('returns false for application/zip', () => {
    expect(isGzip('application/zip')).toBe(false);
  });
});

// ─── isArchive ──────────────────────────────────────────────────────────────

describe('isArchive', () => {
  it('returns true for application/zip', () => {
    expect(isArchive('application/zip')).toBe(true);
  });

  it('returns true for application/gzip', () => {
    expect(isArchive('application/gzip')).toBe(true);
  });

  it('returns true for application/x-tar (extraArchiveTypes)', () => {
    expect(isArchive('application/x-tar')).toBe(true);
  });

  it('returns true for application/x-7z-compressed (extraArchiveTypes)', () => {
    expect(isArchive('application/x-7z-compressed')).toBe(true);
  });

  it('returns true for application/vnd.rar (extraArchiveTypes)', () => {
    expect(isArchive('application/vnd.rar')).toBe(true);
  });

  it('returns false for image/png', () => {
    expect(isArchive('image/png')).toBe(false);
  });

  it('returns false for text/html', () => {
    expect(isArchive('text/html')).toBe(false);
  });
});

// ─── isFont ─────────────────────────────────────────────────────────────────

describe('isFont', () => {
  it('returns true for font/woff2', () => {
    expect(isFont('font/woff2')).toBe(true);
  });

  it('returns true for font/ttf', () => {
    expect(isFont('font/ttf')).toBe(true);
  });

  it('returns true for application/vnd.ms-fontobject (extraFontTypes)', () => {
    expect(isFont('application/vnd.ms-fontobject')).toBe(true);
  });

  it('returns true for application/font-woff alias', () => {
    expect(isFont('application/font-woff')).toBe(true);
  });

  it('returns false for image/png', () => {
    expect(isFont('image/png')).toBe(false);
  });
});

// ─── isExample ──────────────────────────────────────────────────────────────

describe('isExample', () => {
  it('returns true when type is "example"', () => {
    expect(isExample('example/foo')).toBe(true);
  });

  it('returns true when subtype is "example"', () => {
    expect(isExample('application/example')).toBe(true);
  });

  it('returns false for text/html', () => {
    expect(isExample('text/html')).toBe(false);
  });
});

// ─── isCbor ─────────────────────────────────────────────────────────────────

describe('isCbor', () => {
  it('returns true for application/cbor', () => {
    expect(isCbor('application/cbor')).toBe(true);
  });

  it('returns true for a type with +cbor suffix', () => {
    expect(isCbor('application/vnd.example+cbor')).toBe(true);
  });

  it('returns false for application/json', () => {
    expect(isCbor('application/json')).toBe(false);
  });

  it('returns false for application/cbor-seq', () => {
    expect(isCbor('application/cbor-seq')).toBe(false);
  });
});
