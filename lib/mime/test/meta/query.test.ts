import {
  canonicalize,
  getMeta,
  getCharset,
  getSource,
  getStructuredDataType,
  getMimesByExt,
  getMimeByExt,
} from '#meta';
import { defaultAliasesMap, suffixToMediaTypeLookup } from '#meta/const';

import { expect, describe, test } from 'vitest';
import { entries } from '@budsbox/lib-es/object';
import { ROSet } from '@budsbox/lib-es/set';

describe.concurrent('canonicalize', () => {
  describe('default canonicals', () => {
    test.concurrent.for(entries(defaultAliasesMap))(
      'correctly canonicalizes aliases of %s',
      ([key, value]) => {
        expect(canonicalize(key)).toBe(key);
        value.forEach((v) => expect(canonicalize(v)).toBe(key));
      },
    );
  });

  test('canonicalize with custom direct alias', () => {
    expect(
      canonicalize('application/livescript', {
        aliases: { 'application/javascript': 'application/livescript' },
      }),
    ).toBe('application/javascript');
  });

  test('canonicalize with custom alias for canonical', () => {
    expect(
      canonicalize('application/livescript', {
        aliases: { 'application/javascript': 'text/javascript' },
      }),
    ).toBe('application/javascript');
  });

  test('canonicalize with default charset', () => {
    expect(
      canonicalize('application/livescript', {
        setCharset: true,
      }),
    ).toBe('text/javascript;charset=utf-8');
  });

  describe.concurrent('already canonical types', () => {
    test('returns the same essence when already canonical', () => {
      expect(canonicalize('text/javascript')).toBe('text/javascript');
    });

    test('returns the same essence for a type with no aliases', () => {
      expect(canonicalize('image/png')).toBe('image/png');
    });
  });

  describe.concurrent('charset behavior', () => {
    test('does not add charset when setCharset is false (default)', () => {
      expect(canonicalize('text/javascript')).toBe('text/javascript');
      expect(canonicalize('text/javascript', { setCharset: false })).toBe(
        'text/javascript',
      );
    });

    test('does not add charset when already present in input', () => {
      expect(
        canonicalize('text/javascript;charset=iso-8859-1', {
          setCharset: true,
        }),
      ).toBe('text/javascript;charset=iso-8859-1');
    });

    test('does not add charset for types without a default charset', () => {
      expect(canonicalize('image/png', { setCharset: true })).toBe('image/png');
    });

    test('setCharset applies after alias resolution', () => {
      // application/livescript resolves to text/javascript which has charset=utf-8
      expect(canonicalize('application/livescript', { setCharset: true })).toBe(
        'text/javascript;charset=utf-8',
      );
    });
  });

  describe.concurrent('custom aliases', () => {
    test('custom alias overrides default alias resolution', () => {
      // text/javascript is normally canonical, redirect it to a custom type
      expect(
        canonicalize('text/javascript', {
          aliases: { 'application/ecmascript': 'text/javascript' },
        }),
      ).toBe('application/ecmascript');
    });

    test('canonical type itself is returned when no matching alias', () => {
      expect(
        canonicalize('text/html', {
          aliases: { 'application/javascript': 'text/javascript' },
        }),
      ).toBe('text/html');
    });

    test('custom single alias (non-array) resolves correctly', () => {
      expect(
        canonicalize('text/x-custom', {
          aliases: { 'application/custom': 'text/x-custom' },
        }),
      ).toBe('application/custom');
    });

    test('multiple aliases for same canonical all resolve correctly', () => {
      const options = {
        aliases: {
          'application/custom': ['text/x-custom-a', 'text/x-custom-b'] as const,
        },
      } as const;

      expect(canonicalize('text/x-custom-a', options)).toBe(
        'application/custom',
      );
      expect(canonicalize('text/x-custom-b', options)).toBe(
        'application/custom',
      );
    });

    test('canonical key of custom alias is returned as-is', () => {
      expect(
        canonicalize('application/custom', {
          aliases: { 'application/custom': 'text/x-custom' },
        }),
      ).toBe('application/custom');
    });

    test('setCharset works together with custom alias', () => {
      // application/livescript -> text/javascript via custom alias, then charset added
      expect(
        canonicalize('application/livescript', {
          aliases: { 'text/javascript': 'application/livescript' },
          setCharset: true,
        }),
      ).toBe('text/javascript;charset=utf-8');
    });
  });

  describe.concurrent('MIME type with parameters', () => {
    test('preserves existing parameters during canonicalization', () => {
      expect(canonicalize('application/javascript;charset=utf-8')).toBe(
        'text/javascript;charset=utf-8',
      );
    });

    test('preserves multiple parameters', () => {
      expect(
        canonicalize('application/javascript;charset=utf-8;boundary=something'),
      ).toBe('text/javascript;charset=utf-8;boundary=something');
    });
  });
});

describe.concurrent('getMeta', () => {
  test('returns meta information for a given MIME type', () => {
    const metaInfo = getMeta('text/plain');
    expect(metaInfo).toEqual({
      extensions: new ROSet([
        'txt',
        'text',
        'conf',
        'def',
        'list',
        'log',
        'in',
        'ini',
      ]),
      compressible: true,
      source: 'iana',
    });
  });

  test('returns merged meta-information for a given MIME type', () => {
    // https://github.com/jshttp/mime-db/issues/403
    const metaInfo = getMeta('application/yaml');
    expect(metaInfo).toEqual({
      extensions: new ROSet(['yaml', 'yml']),
      compressible: true,
      source: 'iana',
    });
  });

  test('returns unmerged meta-information wheh noMerge is true', () => {
    // https://github.com/jshttp/mime-db/issues/403
    const metaInfo = getMeta('application/yaml', { noMerge: true });
    expect(metaInfo).toEqual({
      extensions: new ROSet(),
      source: 'iana',
    });
  });
});

describe.concurrent('getSource', () => {
  describe.concurrent('iana sources', () => {
    test('returns iana for application/json', () => {
      expect(getSource('application/json')).toBe('iana');
    });

    test('returns iana for text/html', () => {
      expect(getSource('text/html')).toBe('iana');
    });

    test('returns iana for image/png', () => {
      expect(getSource('image/png')).toBe('iana');
    });
  });

  describe.concurrent('apache sources', () => {
    test('returns apache for chemical/x-cif', () => {
      expect(getSource('chemical/x-cif')).toBe('apache');
    });

    test('returns apache for chemical/x-cmdf', () => {
      expect(getSource('chemical/x-cmdf')).toBe('apache');
    });

    test('returns apache for image/x-pict', () => {
      expect(getSource('image/x-pict')).toBe('apache');
    });

    test('returns apache for image/x-portable-anymap', () => {
      expect(getSource('image/x-portable-anymap')).toBe('apache');
    });
  });

  describe.concurrent('nginx', () => {
    test('returns nginx for image/x-ms-bmp', () => {
      expect(getSource('image/x-ms-bmp')).toBe('nginx');
    });

    test('returns nginx for image/x-jng', () => {
      expect(getSource('image/x-jng')).toBe('nginx');
    });
  });

  describe.concurrent('unknown / missing types', () => {
    test('returns null for a completely unknown type', () => {
      expect(getSource('application/x-totally-unknown-type-xyz')).toBeNull();
    });

    test('returns null for a fabricated vendor type', () => {
      expect(
        getSource('application/vnd.nonexistent-company.format'),
      ).toBeNull();
    });
  });

  describe.concurrent('alias resolution', () => {
    test("doesn't resolve alias to canonical before returning source", () => {
      expect(getSource('application/javascript')).toBe('apache');
    });
  });

  describe.concurrent('MIME type with parameters', () => {
    test('ignores parameters and returns source for the essence', () => {
      expect(getSource('application/json;charset=utf-8')).toBe('iana');
    });

    test('ignores parameters for an apache-sourced type', () => {
      expect(getSource('image/x-pict;q=0.9')).toBe('apache');
    });
  });
});

describe.concurrent('getCharset', () => {
  test('default charset from metadata', () => {
    expect(getCharset('text/javascript')).toBe('utf-8');
  });

  test('explicit charset parameter takes priority', () => {
    expect(getCharset('text/javascript;charset=windows-1252')).toBe(
      'windows-1252',
    );
  });

  test('types without a default charset', () => {
    expect(getCharset('image/png')).toBeUndefined();
    expect(getCharset('application/octet-stream')).toBeUndefined();
    expect(getCharset('video/mp4')).toBeUndefined();
  });

  test('returns undefined for unknown type', () => {
    expect(getCharset('application/x-totally-unknown-xyz')).toBeUndefined();
  });

  describe.concurrent('alias resolution', () => {
    test('resolves alias before looking up charset', () => {
      // application/javascript is an alias of text/javascript (utf-8)
      expect(getCharset('application/javascript')).toBe('utf-8');
    });
  });

  describe.concurrent('explicit charset on aliased type', () => {
    test('returns explicit charset parameter even on an alias', () => {
      expect(getCharset('application/javascript;charset=iso-8859-1')).toBe(
        'iso-8859-1',
      );
    });
  });
});

describe.concurrent('getStructuredDataType', () => {
  describe('known suffixes', () => {
    test.concurrent.for(Object.entries(suffixToMediaTypeLookup))(
      'returns correct essence for example/example%s',
      ([suffix, essence]) => {
        expect(getStructuredDataType(`example/example${suffix}`)).toBe(essence);
        expect(
          getStructuredDataType({
            type: 'example',
            subtype: `example${suffix}`,
          }),
        ).toBe(essence);
      },
    );
  });

  describe('known suffixes with parameters', () => {
    test.concurrent.for(Object.entries(suffixToMediaTypeLookup))(
      'returns correct essence for example/example%s; q=0.9',
      ([suffix, essence]) => {
        expect(getStructuredDataType(`example/example${suffix}; q=0.9`)).toBe(
          essence,
        );
      },
    );
  });

  test('returns essence of a type w/o suffix', () => {
    expect(getStructuredDataType('application/json')).toBe('application/json');
    expect(getStructuredDataType('text/html; charset=utf-8')).toBe('text/html');
  });

  test('returns essence of a type with unknown suffix', () => {
    expect(getStructuredDataType('example/example+example')).toBe(
      'example/example+example',
    );
  });
});

describe.concurrent('getMimesByExt', () => {
  describe.concurrent('basic extension lookup', () => {
    test('returns MIME types for json', () => {
      expect(getMimesByExt('json')).toStrictEqual(['application/json']);
    });

    test('returns MIME types for html', () => {
      const result = getMimesByExt('html');
      expect(result[0]).toBe('text/html');
    });

    test('returns MIME types for txt', () => {
      const result = getMimesByExt('txt');
      expect(result[0]).toBe('text/plain');
    });

    test('returns MIME types for js', () => {
      const result = getMimesByExt('js');
      expect(result[0]).toBe('text/javascript');
    });
  });

  describe.concurrent('dot-prefixed extensions', () => {
    test('resolves .json via last segment after dot', () => {
      expect(getMimesByExt('.json')).toStrictEqual(['application/json']);
    });

    test('resolves .html', () => {
      const result = getMimesByExt('.html');
      expect(result[0]).toBe('text/html');
    });
  });

  describe.concurrent('full filenames', () => {
    test('extracts extension from filename', () => {
      expect(getMimesByExt('document.pdf')[0]).toBe('application/pdf');
    });

    test('extracts extension from filename with multiple dots', () => {
      expect(getMimesByExt('archive.tar.gz')[0]).toBe('application/gzip');
    });

    test('extracts extension from deeply nested path-like name', () => {
      expect(getMimesByExt('some.config.json')).toStrictEqual([
        'application/json',
      ]);
    });
  });

  describe.concurrent('empty and unknown extensions', () => {
    test('returns empty array for empty string', () => {
      expect(getMimesByExt('')).toStrictEqual([]);
    });

    test('returns empty array for unknown extension', () => {
      expect(getMimesByExt('zzzzunknownext')).toStrictEqual([]);
    });
  });

  describe.concurrent('custom map as plain object', () => {
    test('returns custom MIME type when extension matches', () => {
      expect(
        getMimesByExt('myext', { myext: 'application/x-custom' }),
      ).toStrictEqual(['application/x-custom']);
    });

    test('falls back to default lookup when extension not in custom map', () => {
      expect(
        getMimesByExt('json', { myext: 'application/x-custom' }),
      ).toStrictEqual(['application/json']);
    });
  });

  describe.concurrent('custom map as Map', () => {
    test('returns custom MIME type when extension matches', () => {
      const customMap = new Map([['myext', 'application/x-custom']] as const);
      expect(getMimesByExt('myext', customMap)).toStrictEqual([
        'application/x-custom',
      ]);
    });

    test('falls back to default lookup when extension not in Map', () => {
      const customMap = new Map([['myext', 'application/x-custom']] as const);
      expect(getMimesByExt('json', customMap)).toStrictEqual([
        'application/json',
      ]);
    });
  });

  describe.concurrent('invalid arguments', () => {
    test('throws on non-string extOrName', () => {
      expect(() => getMimesByExt(123 as never)).toThrow(TypeError);
    });

    test('throws on null extOrName', () => {
      expect(() => getMimesByExt(null as never)).toThrow(TypeError);
    });

    test('throws on invalid customMap type', () => {
      expect(() => getMimesByExt('json', 42 as never)).toThrow(TypeError);
    });
  });
});

describe.concurrent('getMimeByExt', () => {
  describe.concurrent('basic extension lookup', () => {
    test('returns primary MIME type for json', () => {
      expect(getMimeByExt('json')).toBe('application/json');
    });

    test('returns primary MIME type for html', () => {
      expect(getMimeByExt('html')).toBe('text/html');
    });

    test('returns primary MIME type for png', () => {
      expect(getMimeByExt('png')).toBe('image/png');
    });
  });

  describe.concurrent('dot-prefixed and filenames', () => {
    test('resolves .css', () => {
      expect(getMimeByExt('.css')).toBe('text/css');
    });

    test('resolves filename with extension', () => {
      expect(getMimeByExt('index.html')).toBe('text/html');
    });

    test('resolves filename with multiple dots', () => {
      expect(getMimeByExt('app.bundle.js')).toBe('text/javascript');
    });
  });

  describe.concurrent('empty and unknown extensions', () => {
    test('returns undefined for empty string', () => {
      expect(getMimeByExt('')).toBe(undefined);
    });

    test('returns undefined for unknown extension', () => {
      expect(getMimeByExt('zzzzunknownext')).toBeUndefined();
    });
  });

  describe.concurrent('custom map', () => {
    test('returns custom MIME type from plain object', () => {
      expect(getMimeByExt('myext', { myext: 'text/x-mine' })).toBe(
        'text/x-mine',
      );
    });

    test('returns custom MIME type from Map', () => {
      const customMap = new Map([['myext', 'text/x-mine']] as const);
      expect(getMimeByExt('myext', customMap)).toBe('text/x-mine');
    });

    test('falls back to default when extension not in custom map', () => {
      expect(getMimeByExt('json', { myext: 'text/x-mine' })).toBe(
        'application/json',
      );
    });
  });

  describe.concurrent('invalid arguments', () => {
    test('throws on non-string extOrName', () => {
      expect(() => getMimeByExt(undefined as never)).toThrow(TypeError);
    });

    test('throws on invalid customMap type', () => {
      expect(() => getMimeByExt('json', 'bad' as never)).toThrow(TypeError);
    });
  });
});
