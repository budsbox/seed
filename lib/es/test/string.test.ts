import { describe, expect, test } from 'vitest';

import {
  formatPackageName,
  parsePackageName,
  resolvePackageName,
  serializePackageName,
} from '#string';

describe.concurrent('parsePackageName', () => {
  test('parses scoped package name', (): void => {
    const result = parsePackageName('@scope/package-name');
    expect(result).toStrictEqual({
      scope: '@scope/',
      name: 'package-name',
    });
  });

  test('parses scoped package name with clean flag', (): void => {
    const result = parsePackageName('@scope/package-name', true);
    expect(result).toStrictEqual({
      scope: 'scope',
      name: 'package-name',
    });
  });

  test('parses unscoped package name', (): void => {
    expect(parsePackageName('package-name')).toStrictEqual({
      scope: null,
      name: 'package-name',
    });
    expect(parsePackageName('package-name', true)).toStrictEqual({
      scope: null,
      name: 'package-name',
    });
  });

  test('handles complex package names with multiple slashes', (): void => {
    expect(parsePackageName('@scope/sub/package')).toStrictEqual({
      scope: '@scope/',
      name: 'sub/package',
    });
    expect(parsePackageName('@scope/sub/package', true)).toStrictEqual({
      scope: 'scope',
      name: 'sub/package',
    });
  });

  test('throws TypeError for non-string packageName', (): void => {
    expect(() => parsePackageName(123 as never)).toThrowError(
      new TypeError('Expected packageName to be string, got number instead'),
    );
    expect(() => parsePackageName(null as never)).toThrowError(
      new TypeError('Expected packageName to be string, got null instead'),
    );
    expect(() => parsePackageName(undefined as never)).toThrowError(
      new TypeError('Expected packageName to be string, got undefined instead'),
    );
  });

  test('throws TypeError for non-boolean clean flag', (): void => {
    expect(() => parsePackageName('@scope/pkg', 'true' as never)).toThrowError(
      new TypeError('Expected clean to be boolean, got string instead'),
    );
  });
});

describe.concurrent('serializePackageName', () => {
  test('serializes package with scope', (): void => {
    expect(serializePackageName({ scope: '@scope/', name: 'package' })).toBe(
      '@scope/package',
    );
    expect(serializePackageName({ scope: '@scope', name: 'package' })).toBe(
      '@scope/package',
    );
    expect(serializePackageName({ scope: 'scope', name: 'package' })).toBe(
      '@scope/package',
    );
  });

  test('serializes package without scope', (): void => {
    expect(serializePackageName({ name: 'package' })).toBe('package');
    expect(serializePackageName({ scope: null, name: 'package' })).toBe(
      'package',
    );
  });

  test('serializes null with allowNil flag', (): void => {
    const result = serializePackageName(null, true);
    expect(result).toBe('');
  });

  test('serializes undefined with allowNil flag', (): void => {
    const result = serializePackageName(undefined, true);
    expect(result).toBe('');
  });

  test('throws TypeError for null without allowNil flag', (): void => {
    expect(() => serializePackageName(null as never)).toThrowError(TypeError);
  });

  test('throws TypeError for undefined without allowNil flag', (): void => {
    expect(() => serializePackageName(undefined as never)).toThrowError(
      TypeError,
    );
  });

  test('handles string identifier', (): void => {
    const result = serializePackageName('@scope/package' as never);
    expect(result).toBe('@scope/package');
  });
});

describe.concurrent('resolvePackageName', () => {
  test('resolves string identifier with scope', (): void => {
    const result = resolvePackageName('@scope/package');
    expect(result).toBe('@scope/package');
  });

  test('resolves string identifier without scope', (): void => {
    const result = resolvePackageName('package');
    expect(result).toBe('package');
  });

  test('resolves string identifier with baseScope', (): void => {
    const result = resolvePackageName('package', { baseScope: '@base' });
    expect(result).toBe('@base/package');
  });

  test('resolves string identifier with scope ignoring baseScope', (): void => {
    const result = resolvePackageName('@scope/package', { baseScope: '@base' });
    expect(result).toBe('@scope/package');
  });

  test('resolves object identifier with scope', (): void => {
    const result = resolvePackageName({ scope: '@scope', name: 'package' });
    expect(result).toBe('@scope/package');
  });

  test('resolves object identifier without scope', (): void => {
    const result = resolvePackageName({ name: 'package' });
    expect(result).toBe('package');
  });

  test('resolves object identifier with baseScope', (): void => {
    const result = resolvePackageName(
      { name: 'package' },
      { baseScope: '@base' },
    );
    expect(result).toBe('@base/package');
  });

  test('resolves object identifier with scope ignoring baseScope', (): void => {
    const result = resolvePackageName(
      { scope: '@scope', name: 'package' },
      { baseScope: '@base' },
    );
    expect(result).toBe('@scope/package');
  });

  test('returns parsed object when parsed flag is true', (): void => {
    const result = resolvePackageName('package', { parsed: true });
    expect(result).toStrictEqual({
      scope: null,
      name: 'package',
    });
  });

  test('returns parsed object with baseScope when parsed flag is true', (): void => {
    const result = resolvePackageName('package', {
      baseScope: '@base',
      parsed: true,
    });
    expect(result).toStrictEqual({
      scope: '@base',
      name: 'package',
    });
  });

  test('returns parsed object for scoped package when parsed flag is true', (): void => {
    const result = resolvePackageName('@scope/package', { parsed: true });
    expect(result).toStrictEqual({
      scope: '@scope/',
      name: 'package',
    });
  });

  test('handles undefined baseScope', (): void => {
    const result = resolvePackageName('package', { baseScope: undefined });
    expect(result).toBe('package');
  });

  test('handles null baseScope', (): void => {
    const result = resolvePackageName('package', { baseScope: null as never });
    expect(result).toBe('package');
  });

  test('resolves without options', (): void => {
    const result = resolvePackageName('@scope/package');
    expect(result).toBe('@scope/package');
  });

  test('resolves with empty options object', (): void => {
    const result = resolvePackageName('package', {});
    expect(result).toBe('package');
  });
});

describe.concurrent('formatPackageName', () => {
  test('formats package name with default options', () => {
    expect(formatPackageName('example')).toBe('example');
  });

  test('formats package name with scope from parent', () => {
    expect(
      formatPackageName('example', {
        parent: '@scope/parent',
      }),
    ).toBe('@scope/parent_example');
  });

  test('formats package name with relCwd path', () => {
    expect(
      formatPackageName('example', {
        parent: '@scope/parent',
        relCwd: 'nested/deep',
      }),
    ).toBe('@scope/parent_nested-deep-example');
  });

  test('formats package name with custom pathDelimiter', () => {
    expect(
      formatPackageName('example', {
        parent: '@scope/parent',
        relCwd: 'nested/deep',
        pathDelimiter: '.',
      }),
    ).toBe('@scope/parent_nested.deep.example');
  });

  test('formats package name with custom nameDelimiter', () => {
    expect(
      formatPackageName('example', {
        parent: '@scope/parent',
        relCwd: 'nested',
        nameDelimiter: '-',
      }),
    ).toBe('@scope/parent-nested-example');
  });

  test('excludes default path chunks', () => {
    expect(
      formatPackageName('example', {
        parent: '@scope/parent',
        relCwd: 'packages/nested',
      }),
    ).toBe('@scope/parent_nested-example');
  });

  test('excludes custom path chunks', () => {
    expect(
      formatPackageName('example', {
        parent: '@scope/parent',
        relCwd: 'libs/nested/deep',
        excludePathChunks: ['libs', 'nested'],
      }),
    ).toBe('@scope/parent_deep-example');
  });

  test('removes base from path chunks when at end', () => {
    expect(
      formatPackageName('example', {
        parent: '@scope/parent',
        relCwd: 'nested/example',
      }),
    ).toBe('@scope/parent_nested-example');
  });

  test('formats top-level package with root equals parent', () => {
    expect(
      formatPackageName('example', {
        root: '@scope/root',
        parent: '@scope/root',
        relCwd: 'nested',
      }),
    ).toBe('@scope/nested-example');
  });

  test('formats non-top-level package with different parent and root', () => {
    expect(
      formatPackageName('example', {
        root: '@scope/root',
        parent: '@scope/parent',
        relCwd: 'nested',
      }),
    ).toBe('@scope/parent_nested-example');
  });

  test('handles empty relCwd', () => {
    expect(
      formatPackageName('example', {
        parent: '@scope/parent',
        relCwd: '',
      }),
    ).toBe('@scope/parent_example');
  });

  test('handles parent without scope', () => {
    expect(
      formatPackageName('example', {
        parent: 'parent',
        relCwd: 'nested',
      }),
    ).toBe('parent_nested-example');
  });

  test('handles null parent', () => {
    expect(
      formatPackageName('example', {
        parent: null,
        relCwd: 'nested',
      }),
    ).toBe('nested-example');
  });

  test('handles undefined parent with null root', () => {
    expect(
      formatPackageName('example', {
        root: null,
        relCwd: 'nested',
      }),
    ).toBe('nested-example');
  });

  test('handles multiple consecutive path separators', () => {
    expect(
      formatPackageName('example', {
        parent: '@scope/parent',
        relCwd: 'nested//deep///extra',
      }),
    ).toBe('@scope/parent_nested-deep-extra-example');
  });

  test('handles empty excludePathChunks array', () => {
    expect(
      formatPackageName('example', {
        parent: '@scope/parent',
        relCwd: 'packages/nested',
        excludePathChunks: [],
      }),
    ).toBe('@scope/parent_packages-nested-example');
  });

  test('throws TypeError for non-string base', () => {
    expect(() => formatPackageName(123 as never)).toThrowError(
      new TypeError('Expected base to be string, got number instead'),
    );
  });

  test('throws TypeError for non-object options', () => {
    expect(() => formatPackageName('example', 'invalid' as never)).toThrowError(
      new TypeError('Expected options to be object, got string instead'),
    );
  });

  test('throws TypeError for invalid root type', () => {
    expect(() =>
      formatPackageName('example', { root: 123 as never }),
    ).toThrowError(
      new TypeError(
        'Expected options.root to be string or null or undefined, got number instead',
      ),
    );
  });

  test('throws TypeError for invalid parent type', () => {
    expect(() =>
      formatPackageName('example', { parent: true as never }),
    ).toThrowError(
      new TypeError(
        'Expected options.parent to be string or null or undefined, got boolean instead',
      ),
    );
  });

  test('throws TypeError for invalid relCwd type', () => {
    expect(() =>
      formatPackageName('example', { relCwd: 123 as never }),
    ).toThrowError(
      new TypeError(
        'Expected options.relCwd to be string or undefined, got number instead',
      ),
    );
  });

  test('throws TypeError for invalid pathDelimiter type', () => {
    expect(() =>
      formatPackageName('example', { pathDelimiter: null as never }),
    ).toThrowError(
      new TypeError(
        'Expected options.pathDelimiter to be string or undefined, got null instead',
      ),
    );
  });

  test('throws TypeError for invalid nameDelimiter type', () => {
    expect(() =>
      formatPackageName('example', { nameDelimiter: [] as never }),
    ).toThrowError(
      new TypeError(
        'Expected options.nameDelimiter to be string or undefined, got array instead',
      ),
    );
  });

  test('throws TypeError for non-array excludePathChunks', () => {
    expect(() =>
      formatPackageName('example', { excludePathChunks: 'invalid' as never }),
    ).toThrowError(
      new TypeError(
        'Expected excludePathChunks to be array, got string instead',
      ),
    );
  });

  test('throws TypeError for excludePathChunks with non-string elements', () => {
    expect(() =>
      formatPackageName('example', { excludePathChunks: [123] as never }),
    ).toThrowError(
      new TypeError(
        'Expected excludePathChunks[0] to be string, got number instead',
      ),
    );
  });
});
