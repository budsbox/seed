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

describe.concurrent('RFC compliance, common cases', () => {
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

    test('should ignore parameters without value or with explicitly empty quoted value', () => {
      const res = overloadedParse('text/plain; a; b=""; c=   ; d=1');
      // a (no =) -> filtered, b (empty quotes) -> filtered, c (= with only spaces) -> filtered
      expect(res.parameters).toEqual(new Map([['d', '1']]));
      // also ensure only one entry exists
      expect([...res.parameters.entries()]).toEqual([['d', '1']]);
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

describe.concurrent('RFC strict compliance, edge cases', () => {
  test('should parse semantic whitespace (space and tab) and throw on non-semantic', () => {
    expect(parseFormatted('text/html ; ').essence).toEqual('text/html');
    expect(() => parseFormatted('text/html ;\n')).toThrowError('Expected');
  });

  test('should throw if an unquoted parameter value is not a valid HTTP token', () => {
    expect(() => parseFormatted('x/x; foo=bar baz;')).toThrowError('Expected');
  });
});

describe.concurrent('Options', () => {
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
  test('should pass all standard tests', () => {
    for (const { input, output } of mimesniffTest) {
      if (output === null) {
        expect(() => sniffFormatted(input)).toThrowError('Expected');
      } else {
        expect(serializeMimeType(sniffFormatted(input))).toEqual(output);
        expect(sniffFormatted(input)).toStrictEqual(sniffFormatted(output));
      }
    }
  });
});
