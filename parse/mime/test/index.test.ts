import { describe, expect, test } from 'vitest';
import {
  parse,
  sniff,
  ParseFunction,
  SyntaxError as ParserSyntaxError,
  serializeMimeType,
} from '@budsbox/parse-mime';
import mimesniffTest from 'mime-sniff-test-data';

const grammarSource = '<test-string>';

const formatSyntaxError = (input: string, err: unknown) =>
  err instanceof ParserSyntaxError ?
    new ParserSyntaxError(
      err.format([{ source: grammarSource, text: input }]),
      err.expected,
      err.found ?? null,
      err.location,
    )
  : err;

const parseFormatted: ParseFunction = (input, options) => {
  try {
    return parse(input, { ...options, grammarSource });
  } catch (err) {
    throw formatSyntaxError(input, err);
  }
};

const sniffFormatted: ParseFunction = (input, options) => {
  try {
    return sniff(input, { ...options, grammarSource });
  } catch (err) {
    throw formatSyntaxError(input, err);
  }
};

describe.concurrent('IETF standards compliance, common cases', () => {
  describe.for(['semantic', 'sniffing'])('%s mode', (mode) => {
    const modeOptions = { sniff: mode === 'sniffing' };
    const overloadedParse: ParseFunction = (input, options) =>
      parseFormatted(input, {
        ...options,
        ...modeOptions,
      });

    test('should parse "text/html" and "x/x"', () => {
      expect(overloadedParse('text/html')).toEqual({
        essence: 'text/html',
        type: 'text',
        subtype: 'html',
        subtypeTokens: { tree: null, name: 'html', suffix: null },
        parameters: new Map(),
      });

      expect(overloadedParse('x/x')).toEqual({
        essence: 'x/x',
        type: 'x',
        subtype: 'x',
        subtypeTokens: { tree: null, name: 'x', suffix: null },
        parameters: new Map(),
      });
    });

    test('should parse "text/html" and serialize it back', () => {
      expect(serializeMimeType(overloadedParse('text/html'))).toEqual(
        'text/html',
      );
    });

    test('should parse and lowercase essence', () => {
      const res = overloadedParse('TEXT/HTML');
      expect(res.essence).toBe('text/html');
    });

    test('should parse tree, dotted name and suffix from subtype; everything lowercased', () => {
      expect(
        overloadedParse('Application/VnD.company.product.Feature+JsOn')
          .subtypeTokens,
      ).toEqual({
        tree: 'vnd.',
        name: 'company.product.feature',
        suffix: '+json',
      });
    });

    test('should parse and lowercase parameter names, ignoring leading whitespace (space and tab)', () => {
      expect(overloadedParse('text/plain; charset=utf-8').parameters).toEqual(
        new Map([['charset', 'utf-8']]),
      );
      expect(overloadedParse('text/plain; CHARSET=utf-8').parameters).toEqual(
        new Map([['charset', 'utf-8']]),
      );
      expect(overloadedParse('text/plain; ChArSeT=utf-8').parameters).toEqual(
        new Map([['charset', 'utf-8']]),
      );
      expect(overloadedParse('text/plain;  charset=utf-8').parameters).toEqual(
        new Map([['charset', 'utf-8']]),
      );
      expect(overloadedParse('text/plain;\tcharset=utf-8').parameters).toEqual(
        new Map([['charset', 'utf-8']]),
      );
      expect(
        overloadedParse('text/plain; \t charset=utf-8').parameters,
      ).toEqual(new Map([['charset', 'utf-8']]));
    });

    test('should parse parameter with http token unquoted value', () => {
      expect(overloadedParse('text/plain; token=abc123').parameters).toEqual(
        new Map([['token', 'abc123']]),
      );
      expect(
        overloadedParse('text/plain; token=user-agent').parameters,
      ).toEqual(new Map([['token', 'user-agent']]));
      expect(
        overloadedParse('text/plain; token=value_with.chars').parameters,
      ).toEqual(new Map([['token', 'value_with.chars']]));
    });

    test('should parse "charset" parameter and always lowercase its value', () => {
      expect(overloadedParse('text/plain; charset=utf-8').parameters).toEqual(
        new Map([['charset', 'utf-8']]),
      );
      expect(overloadedParse('text/plain; charset=UTF-8').parameters).toEqual(
        new Map([['charset', 'utf-8']]),
      );
      expect(overloadedParse('text/plain; charset=Utf-8').parameters).toEqual(
        new Map([['charset', 'utf-8']]),
      );
      expect(
        overloadedParse('text/plain; charset=ISO-8859-1').parameters,
      ).toEqual(new Map([['charset', 'iso-8859-1']]));
      expect(overloadedParse('text/plain; charset="UTF-8"').parameters).toEqual(
        new Map([['charset', 'utf-8']]),
      );
    });

    test('should keep content inside quoted value as-is (without surrounding quotes)', () => {
      const res = overloadedParse(
        'text/plain; title="Hello World"; quote="Hello \\"World\\""; equal="Hello = World"; semicolon="Hello; World;"',
      );
      expect(res.parameters).toEqual(
        new Map([
          ['title', 'Hello World'],
          ['quote', 'Hello "World"'],
          ['equal', 'Hello = World'],
          ['semicolon', 'Hello; World;'],
        ]),
      );
    });

    test('should parse multiple parameters with different names and value types', () => {
      const res = overloadedParse(
        'text/plain; a=1; charset=utf-8; token=value123; x="quoted value"; boundary=----WebKitFormBoundary',
      );
      expect(res.parameters).toEqual(
        new Map([
          ['a', '1'],
          ['charset', 'utf-8'],
          ['token', 'value123'],
          ['x', 'quoted value'],
          ['boundary', '----WebKitFormBoundary'],
        ]),
      );
      expect(res.parameters.size).toBe(5);
    });

    test('should tolerate trailing semicolon', () => {
      expect(overloadedParse('text/plain;').parameters).toEqual(new Map());
      expect(overloadedParse('text/plain; charset=utf-8;').parameters).toEqual(
        new Map([['charset', 'utf-8']]),
      );
      expect(overloadedParse('text/plain; a=1; b=2;').parameters).toEqual(
        new Map([
          ['a', '1'],
          ['b', '2'],
        ]),
      );
      expect(overloadedParse('text/plain; a=1; b=2;;').parameters).toEqual(
        new Map([
          ['a', '1'],
          ['b', '2'],
        ]),
      );
    });

    test('should ignore parameters explicitly empty quoted value', () => {
      const res = overloadedParse('text/plain; b=""; d=1');
      // a (no =) -> filtered, b (empty quotes) -> filtered, c (= with only spaces) -> filtered
      expect(res.parameters).toStrictEqual(new Map([['d', '1']]));
    });

    test('should accept leading/trailing whitespace and trailing semicolon in sniffing mode', () => {
      expect(sniffFormatted('  text/html  ;   ')).toEqual({
        essence: 'text/html',
        type: 'text',
        subtype: 'html',
        subtypeTokens: { tree: null, name: 'html', suffix: null },
        parameters: new Map(),
      });
    });
  });
});

describe.concurrent('IETF standards strict compliance, edge cases', () => {
  test('should parse semantic whitespace (space and tab) and throw on non-semantic', () => {
    expect(parseFormatted('text/html ; ').essence).toEqual('text/html');
    expect(() => parseFormatted('text/html ;\n')).toThrowError('Expected');
  });

  test('should throw if an unquoted parameter value is not a valid HTTP token', () => {
    expect(() => parseFormatted('x/x; foo=bar baz;')).toThrowError('Expected');
  });

  test('should throw if an unquoted parameter is empty', () => {
    expect(() => parseFormatted('x/x; foo=; bar=baz')).toThrowError('Expected');
  });
});

describe.concurrent('Options', () => {
  describe.concurrent('startRule option', () => {
    describe('mimeType rule (default)', () => {
      test('should parse complete MIME type with mimeType startRule', () => {
        const res = parseFormatted(
          'application/vnd.company.product+json; charset=utf-8',
          {
            startRule: 'mimeType',
          },
        );
        expect(res).toStrictEqual({
          essence: 'application/vnd.company.product+json',
          type: 'application',
          subtype: 'vnd.company.product+json',
          subtypeTokens: {
            tree: 'vnd.',
            name: 'company.product',
            suffix: '+json',
          },
          parameters: new Map([['charset', 'utf-8']]),
        });
      });

      test('should throw when mimeType rule receives only type without subtype', () => {
        expect(() =>
          parseFormatted('text', { startRule: 'mimeType' }),
        ).toThrowError('Expected');
      });
    });

    describe('essence rule', () => {
      test('should parse essence (type/subtype) with essence startRule', () => {
        const res = parseFormatted('application/json', {
          startRule: 'essence',
        });
        expect(res).toEqual({
          essence: 'application/json',
          type: 'application',
          subtype: 'json',
          subtypeTokens: { tree: null, name: 'json', suffix: null },
        });
      });

      test('should throw when essence rule receives MIME type with parameters', () => {
        expect(() =>
          parseFormatted('text/plain; charset=utf-8', { startRule: 'essence' }),
        ).toThrowError('Expected');
      });
    });

    describe('type rule', () => {
      test('should parse only type with type startRule', () => {
        const res = parseFormatted('text', { startRule: 'type' });
        expect(res).toBe('text');
      });

      test('should parse type and lowercase it', () => {
        const res = parseFormatted('TEXT', { startRule: 'type' });
        expect(res).toBe('text');
      });

      test('should throw when type rule receives type/subtype', () => {
        expect(() =>
          parseFormatted('text/html', { startRule: 'type' }),
        ).toThrowError('Expected');
      });
    });

    describe('subtype rule', () => {
      test('should parse subtype with subtype startRule', () => {
        const res = parseFormatted('html', { startRule: 'subtype' });
        expect(res).toEqual({
          subtype: 'html',
          subtypeTokens: { tree: null, name: 'html', suffix: null },
        });
      });

      test('should parse subtype with tree and suffix', () => {
        const res = parseFormatted('vnd.company.product+xml', {
          startRule: 'subtype',
        });
        expect(res).toStrictEqual({
          subtype: 'vnd.company.product+xml',
          subtypeTokens: {
            tree: 'vnd.',
            name: 'company.product',
            suffix: '+xml',
          },
        });
      });

      test('should throw when subtype rule receives type/subtype', () => {
        expect(() =>
          parseFormatted('text/html', { startRule: 'subtype' }),
        ).toThrowError('Expected');
      });
    });

    describe('tree rule', () => {
      test('should parse tree prefix with tree startRule', () => {
        const res = parseFormatted('vnd.', { startRule: 'tree' });
        expect(res).toBe('vnd.');
      });

      test('should parse and lowercase tree', () => {
        const res = parseFormatted('VND.', { startRule: 'tree' });
        expect(res).toBe('vnd.');
      });

      test('should throw when tree rule receives subtype without trailing dot', () => {
        expect(() => parseFormatted('vnd', { startRule: 'tree' })).toThrowError(
          'Expected',
        );
      });
    });

    describe('subtypeName rule', () => {
      test('should parse subtype name with subtypeName startRule', () => {
        const res = parseFormatted('html', { startRule: 'subtypeName' });
        expect(res).toBe('html');
      });

      test('should parse and lowercase subtype name', () => {
        const res = parseFormatted('HTML', { startRule: 'subtypeName' });
        expect(res).toBe('html');
      });

      test('should throw when subtypeName rule receives subtype with suffix', () => {
        expect(() =>
          parseFormatted('html+xml', { startRule: 'subtypeName' }),
        ).toThrowError('Expected');
      });
    });

    describe('subtypeSuffix rule', () => {
      test('should parse subtype suffix with subtypeSuffix startRule', () => {
        const res = parseFormatted('+xml', { startRule: 'subtypeSuffix' });
        expect(res).toBe('+xml');
      });

      test('should parse and lowercase subtype suffix', () => {
        const res = parseFormatted('+JSON', { startRule: 'subtypeSuffix' });
        expect(res).toBe('+json');
      });

      test('should throw when subtypeSuffix rule receives suffix without plus sign', () => {
        expect(() =>
          parseFormatted('xml', { startRule: 'subtypeSuffix' }),
        ).toThrowError('Expected');
      });
    });

    describe('parameters rule', () => {
      test('should parse parameters with parameters startRule', () => {
        const res = parseFormatted('; charset=utf-8; boundary=test', {
          startRule: 'parameters',
        });
        expect(res).toStrictEqual(
          new Map([
            ['charset', 'utf-8'],
            ['boundary', 'test'],
          ]),
        );
      });

      test('should parse empty parameters', () => {
        const res = parseFormatted('', { startRule: 'parameters' });
        expect(res).toEqual(new Map());
      });

      test('should throw when parameters rule receives non-parameter content', () => {
        expect(() =>
          parseFormatted('text/html', { startRule: 'parameters' }),
        ).toThrowError('Expected');
      });

      test('should throw when parameters rule receives non-parameter content (with leading semicolon)', () => {
        expect(() =>
          parseFormatted(';invalid@@@', { startRule: 'parameters' }),
        ).toThrowError('Expected');
      });

      test('should throw if an unquoted parameter is empty', () => {
        expect(() => parseFormatted('; foo=; bar=baz')).toThrowError(
          'Expected',
        );
      });

      test('should throw when parameters rule receives parameters string without leading semicolon', () => {
        expect(() =>
          parseFormatted('charset=utf-8; boundary=test', {
            startRule: 'parameters',
          }),
        ).toThrowError('Expected');
      });
    });

    describe('parameter rule', () => {
      test('should parse single parameter with parameter startRule', () => {
        const res = parseFormatted('charset=utf-8', { startRule: 'parameter' });
        expect(res).toStrictEqual(['charset', 'utf-8']);
      });

      test('should parse parameter with quoted value', () => {
        const res = parseFormatted('filename="test.txt"', {
          startRule: 'parameter',
        });
        expect(res).toStrictEqual(['filename', 'test.txt']);
      });

      test('should throw when parameter rule receives multiple parameters', () => {
        expect(() =>
          parseFormatted('charset=utf-8; boundary=test', {
            startRule: 'parameter',
          }),
        ).toThrowError('Expected');
      });
    });

    describe('httpToken rule', () => {
      test('should parse valid HTTP token with httpToken startRule', () => {
        const res = parseFormatted('application', { startRule: 'httpToken' });
        expect(res).toBe('application');
      });

      test('should parse HTTP token with special allowed chars', () => {
        const res = parseFormatted('user-agent', { startRule: 'httpToken' });
        expect(res).toBe('user-agent');
      });

      test('should parse HTTP token with underscores and dots', () => {
        const res = parseFormatted('content_type.v1', {
          startRule: 'httpToken',
        });
        expect(res).toBe('content_type.v1');
      });

      test('should throw when httpToken rule receives invalid token chars (space)', () => {
        expect(() =>
          parseFormatted('invalid token', { startRule: 'httpToken' }),
        ).toThrowError('Expected');
      });

      test('should throw when httpToken rule receives invalid token chars (slash)', () => {
        expect(() =>
          parseFormatted('text/html', { startRule: 'httpToken' }),
        ).toThrowError('Expected');
      });
    });
  });

  describe.concurrent('trim option', () => {
    test('should throw on whitespace around type when trim is disabled (default mode)', () => {
      expect(() => parseFormatted(' x/x ')).toThrowError('Expected');
      expect(() => parseFormatted(' text/html')).toThrowError('Expected');
      expect(() => parseFormatted('text/html ')).toThrowError('Expected');
      expect(() => parseFormatted(' text/html ', { trim: false })).toThrowError(
        'Expected',
      );
    });

    test('should parse whitespace around type when trim is enabled explicitly', () => {
      expect(parseFormatted(' x/x ', { trim: true })).toEqual({
        essence: 'x/x',
        type: 'x',
        subtype: 'x',
        subtypeTokens: { tree: null, name: 'x', suffix: null },
        parameters: new Map(),
      });
    });

    test('should trim whitespace around type by default in sniff mode', () => {
      expect(sniffFormatted(' x/x ')).toEqual({
        essence: 'x/x',
        type: 'x',
        subtype: 'x',
        subtypeTokens: { tree: null, name: 'x', suffix: null },
        parameters: new Map(),
      });
      expect(sniffFormatted(' text/html ')).toEqual({
        essence: 'text/html',
        type: 'text',
        subtype: 'html',
        subtypeTokens: { tree: null, name: 'html', suffix: null },
        parameters: new Map(),
      });
    });

    test('should throw on whitespace in sniff mode when trim is explicitly disabled', () => {
      expect(() =>
        parseFormatted(' x/x ', { sniff: true, trim: false }),
      ).toThrowError('Expected');
    });
  });

  describe.concurrent('restrictNames option', () => {
    test('should throw on non-restricted names by default in default mode', () => {
      expect(() => parseFormatted('$app.lication/json')).toThrowError(
        'Expected',
      );
      expect(() => parseFormatted('application/$emer.gency')).toThrowError(
        'Expected',
      );
      expect(() =>
        parseFormatted('application/emergency;$foo=bar'),
      ).toThrowError('Expected');
    });

    test('should throw on non-restricted names when restrictNames is enabled explicitly', () => {
      expect(() =>
        parseFormatted('$app.lication/json', { restrictNames: true }),
      ).toThrowError('Expected');
      expect(() =>
        parseFormatted('application/$emer.gency', { restrictNames: true }),
      ).toThrowError('Expected');
      expect(() =>
        parseFormatted('application/emergency;$foo=bar', {
          restrictNames: true,
        }),
      ).toThrowError('Expected');

      expect(() =>
        sniffFormatted('$app.lication/json', { restrictNames: true }),
      ).toThrowError('Expected');
      expect(() =>
        sniffFormatted('application/$emer.gency', { restrictNames: true }),
      ).toThrowError('Expected');
      expect(() =>
        sniffFormatted('application/emergency;$foo=bar', {
          restrictNames: true,
        }),
      ).toThrowError('Expected');
    });

    test('should parse non-restricted names when restrictNames is disabled explicitly', () => {
      expect(
        parseFormatted('$application/json', { restrictNames: false }).type,
      ).toEqual('$application');
      expect(
        parseFormatted('application/$json', { restrictNames: false }).subtype,
      ).toEqual('$json');
      expect(
        parseFormatted('application/$json ; $foo=bar', { restrictNames: false })
          .parameters,
      ).toEqual(new Map([['$foo', 'bar']]));
    });

    test('should allow non-restricted names by default in sniff mode', () => {
      expect(sniffFormatted('$application/json').type).toEqual('$application');
      expect(sniffFormatted('application/$json').subtype).toEqual('$json');
      expect(sniffFormatted('application/$json ; $foo=bar').parameters).toEqual(
        new Map([['$foo', 'bar']]),
      );
    });
  });

  describe.concurrent('multiParameter option', () => {
    test('should keep first occurrence of duplicate parameter by default (keep-first)', () => {
      const res = parseFormatted('text/plain; foo=bar; foo=baz; foo=qux');
      expect(res.parameters).toStrictEqual(new Map([['foo', 'bar']]));
    });

    test('should keep first occurrence of duplicate parameter when multiParameter is "keep-first"', () => {
      const res = parseFormatted('text/plain; foo=bar; foo=baz; foo=qux', {
        multiParameter: 'keep-first',
      });
      expect(res.parameters).toStrictEqual(new Map([['foo', 'bar']]));

      const resSniff = sniffFormatted('text/plain; foo=bar; foo=baz; foo=qux', {
        multiParameter: 'keep-first',
      });
      expect(resSniff.parameters).toStrictEqual(new Map([['foo', 'bar']]));
    });

    test('should keep last occurrence of duplicate parameter when multiParameter is "keep-last"', () => {
      const res = parseFormatted('text/plain; foo=bar; foo=baz; foo=qux', {
        multiParameter: 'keep-last',
      });
      expect(res.parameters).toStrictEqual(new Map([['foo', 'qux']]));

      const resSniff = sniffFormatted('text/plain; foo=bar; foo=baz; foo=qux', {
        multiParameter: 'keep-last',
      });
      expect(resSniff.parameters).toStrictEqual(new Map([['foo', 'qux']]));
    });

    test('should keep all occurrences as array when multiParameter is "list"', () => {
      const res = parseFormatted('text/plain; foo=bar; foo=baz; foo=qux', {
        multiParameter: 'list',
      });
      expect(res.parameters).toStrictEqual(
        new Map([['foo', ['bar', 'baz', 'qux']]]),
      );

      const resSniff = sniffFormatted('text/plain; foo=bar; foo=baz; foo=qux', {
        multiParameter: 'list',
      });
      expect(resSniff.parameters).toStrictEqual(
        new Map([['foo', ['bar', 'baz', 'qux']]]),
      );
    });

    test('should handle mix of duplicate and unique parameters with multiParameter "keep-first"', () => {
      const res = parseFormatted(
        'text/plain; charset=utf-8; foo=bar; charset=iso-8859-1; foo=baz; boundary=test',
        { multiParameter: 'keep-first' },
      );
      expect(res.parameters).toEqual(
        new Map([
          ['charset', 'utf-8'],
          ['foo', 'bar'],
          ['boundary', 'test'],
        ]),
      );
    });

    test('should handle mix of duplicate and unique parameters with multiParameter "keep-last"', () => {
      const res = parseFormatted(
        'text/plain; charset=utf-8; foo=bar; charset=iso-8859-1; foo=baz; boundary=test',
        { multiParameter: 'keep-last' },
      );
      expect(res.parameters).toEqual(
        new Map([
          ['charset', 'iso-8859-1'],
          ['foo', 'baz'],
          ['boundary', 'test'],
        ]),
      );
    });

    test('should handle mix of duplicate and unique parameters with multiParameter "list"', () => {
      const res = parseFormatted(
        'text/plain; charset=utf-8; foo=bar; charset=iso-8859-1; foo=baz; boundary=test',
        { multiParameter: 'list' },
      );
      expect(res.parameters).toEqual(
        new Map([
          ['charset', ['utf-8', 'iso-8859-1']],
          ['foo', ['bar', 'baz']],
          ['boundary', ['test']],
        ]),
      );
      expect(res.parameters.get('charset')).toHaveLength(2);
      expect(res.parameters.get('foo')).toHaveLength(2);
      expect(res.parameters.get('boundary')).toHaveLength(1);
    });

    test('should handle single occurrence with multiParameter "list"', () => {
      const res = parseFormatted('text/plain; foo=bar', {
        multiParameter: 'list',
      });
      expect(res.parameters).toEqual(new Map([['foo', ['bar']]]));
      expect(res.parameters.get('foo')).toHaveLength(1);
    });
  });
});

describe.concurrent('Sniff mode', () => {
  test('should accept leading/trailing whitespace and trailing semicolon in sniffing mode', () => {
    expect(sniffFormatted('  text/html  ')).toEqual({
      essence: 'text/html',
      type: 'text',
      subtype: 'html',
      subtypeTokens: { tree: null, name: 'html', suffix: null },
      parameters: new Map(),
    });
  });

  test('should parse unquoted values with internal spaces and trim trailing spaces', () => {
    const res = sniffFormatted('text/plain; note=foo   bar  baz   ');
    expect(res.parameters).toEqual(new Map([['note', 'foo   bar  baz']]));
  });

  test('should parse overcomplicated non-restricted MIME-type in sniffing mode', () => {
    expect(
      sniffFormatted(
        '  apP.lIcaTion/emergencycAlldata.deviceiNfo+xMl;  chaRset=utf-8   ;foo=bAr "  azAz ; kEk=foo ;  ror="lol fof \\"  ";bruh=""; oraoraora= ; foo=   ; fufufu=1     ',
      ),
    ).toEqual({
      essence: 'app.lication/emergencycalldata.deviceinfo+xml',
      type: 'app.lication',
      subtype: 'emergencycalldata.deviceinfo+xml',
      subtypeTokens: {
        tree: 'emergencycalldata.',
        name: 'deviceinfo',
        suffix: '+xml',
      },
      parameters: new Map([
        ['charset', 'utf-8'],
        ['foo', 'bAr "  azAz'],
        ['kek', 'foo'],
        ['ror', 'lol fof "  '],
        ['fufufu', '1'],
      ]),
    });
  });

  /**
   * @see https://github.com/web-platform-tests/wpt/blob/4388a16a0229329e0e4bd770fc88bcf423d2b7bb/mimesniff/mime-types/resources/generated-mime-types.json
   */
  test('should pass all MIME Sniffing Standard tests', () => {
    for (const { input, output } of mimesniffTest) {
      if (output === null) {
        expect.soft(() => sniffFormatted(input)).toThrowError('Expected');
      } else {
        expect.soft(serializeMimeType(sniffFormatted(input))).toEqual(output);
        expect
          .soft(sniffFormatted(input))
          .toStrictEqual(sniffFormatted(output));
      }
    }
  });
});
