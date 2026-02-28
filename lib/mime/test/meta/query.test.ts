import { canonicalize } from '#meta';
import { defaultAliasesMap } from '#meta/const';

import { expect, describe, test } from 'vitest';
import { entries } from '@budsbox/lib-es/object';

describe.concurrent('canonicalize', () => {
  describe('default canonicals', () => {
    test.concurrent.for(entries(defaultAliasesMap))(
      'canonicalize aliases of %s',
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
