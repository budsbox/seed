import { describe, expect, test, expectTypeOf } from 'vitest';
import {
  parse,
  ParseFunction,
  SyntaxError as ParserSyntaxError,
} from '@budsbox/parsers-mime';
import mimesniffTest from 'mimesniff-tests';

const grammarSource = '<test-string>';

const parseFormatted: ParseFunction = (input, options) => {
  try {
    return parse(input, { ...options, grammarSource });
  } catch (err) {
    if (err instanceof ParserSyntaxError) {
      throw new ParserSyntaxError(
        err.format([{ source: grammarSource, text: input }]),
        err.expected,
        err.found ?? null,
        err.location,
      );
    } else {
      throw err;
    }
  }
};

describe.concurrent('RFC compliance, common cases', () => {
  describe.for(['default', 'sniffing'])('%s mode', (mode) => {
    const modeOptions = { sniff: mode === 'sniffing' };
    const overloadedParse: ParseFunction = (input, options) =>
      parseFormatted(input, {
        ...options,
        ...modeOptions,
      });

    test('should parse "text/html"', () => {
      expect(overloadedParse('text/html')).toEqual({
        essence: 'text/html',
        type: 'text',
        subtype: 'html',
        subtypeTokens: { tree: null, name: 'html', suffix: null },
        parameters: new Map(),
      });
    });

    test('should have toString method', () => {
      const type = parseFormatted('text/html');
      expect(Object.hasOwn(type, 'toString')).toEqual(true);
      expectTypeOf(type.toString).toBeFunction();
    });

    test('should parse "text/html" and serialize it back', () => {
      expectTypeOf(overloadedParse('text/html').toString).toBeFunction();
      expect(typeof overloadedParse('text/html').toString).toBe('function');
      expect(overloadedParse('text/html').toString()).toEqual('text/html');
    });

    test('should lowercase essence', () => {
      const res = overloadedParse('TEXT/HTML');
      expect(res.essence).toBe('text/html');
    });

    test('should parse tree, dotted name and suffix; everything lowercased', () => {
      expect(
        overloadedParse('Application/VnD.company.product.Feature+JsOn')
          .subtypeTokens,
      ).toEqual({
        tree: 'vnd.',
        name: 'company.product.feature',
        suffix: '+json',
      });
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

    test('should ignore parameters without value or with explicitly empty quoted value', () => {
      const res = overloadedParse('text/plain; a; b=""; c=   ; d=1');
      // a (no =) -> filtered, b (empty quotes) -> filtered, c (= with only spaces) -> filtered
      expect(res.parameters).toEqual(new Map([['d', '1']]));
      // also ensure only one entry exists
      expect([...res.parameters.entries()]).toEqual([['d', '1']]);
    });
  });
});

describe.concurrent('Sniffing mode', () => {
  const overloadedParse: ParseFunction = (input, options) =>
    parseFormatted(input, {
      ...options,
      sniff: true,
    });

  test('should accept leading/trailing whitespace and trailing semicolon in sniffing mode', () => {
    expect(overloadedParse('  text/html  ;   ')).toEqual({
      essence: 'text/html',
      type: 'text',
      subtype: 'html',
      subtypeTokens: { tree: null, name: 'html', suffix: null },
      parameters: new Map(),
    });
  });

  test('should parse unquoted values with internal spaces and trim trailing spaces', () => {
    const res = overloadedParse('text/plain; note=foo   bar  baz   ');
    expect(res.parameters).toEqual(new Map([['note', 'foo   bar  baz']]));
  });

  test('should parse overcomplicated non-restricted MIME-type in sniffing mode', () => {
    expect(
      overloadedParse(
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

  test.for(mimesniffTest)(
    'should pass test: $input -> $output',
    ({ input, output }) => {
      if (output === null) {
        expect(() => overloadedParse(input)).toThrowError('Expected');
      } else {
        expect(overloadedParse(input).toString()).toEqual(output);
      }
    },
  );
});
