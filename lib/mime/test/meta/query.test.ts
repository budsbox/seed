import { canonicalize } from '#meta';
import { defaultAliasesMap } from '#meta/const';

import { expect, describe, test } from 'vitest';
import { entries } from '@budsbox/lib-es/object';

describe('canonicalize', () => {
  test.for(entries(defaultAliasesMap))(
    'canonicalize aliases of %s',
    ([key, value]) => {
      expect(canonicalize(key)).toBe(key);
      value.forEach((v) => expect(canonicalize(v)).toBe(key));
    },
  );

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
});
