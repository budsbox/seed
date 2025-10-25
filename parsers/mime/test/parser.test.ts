import { expect, test } from 'vitest';
import {
  parse,
  ParseFunction,
  SyntaxError as ParserSyntaxError,
} from '@budsbox/parsers-mime';

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

test('should parse the most basic MIME-type', () => {
  expect(parseFormatted('text/html')).toEqual({
    essence: 'text/html',
    type: 'text',
    subtype: 'html',
    subtypeTokens: { tree: null, name: 'html', suffix: null },
    parameters: new Map(),
  });
});

test('should loosely parse overcomplicated MIME-type', () => {
  expect(
    parseFormatted(
      '  apPlIcaTion/emergencycAlldata.deviceiNfo+xMl;  chaRset=utf-8   ;foo=bAr "  azAz ; kEk  =foo ;  ror ="lol fof \\"  ";bruh=""; oraoraora  = ; foo=   ; fufufu =1     ',
      { loose: true },
    ),
  ).toEqual({
    essence: 'application/emergencycalldata.deviceinfo+xml',
    type: 'application',
    subtype: 'emergencycalldata.deviceinfo+xml',
    subtypeTokens: {
      tree: 'emergencycalldata',
      name: 'deviceinfo',
      suffix: 'xml',
    },
    parameters: new Map([
      ['charset', 'utf-8'],
      ['foo', 'bAr "  azAz'],
      ['kek  ', 'foo'],
      ['ror ', 'lol fof "  '],
      ['fufufu ', '1'],
    ]),
  });
});

test('should lowercase essence', () => {
  const res = parseFormatted('TEXT/HTML');
  expect(res.essence).toBe('text/html');
  expect(res.type).toBe('text');
  expect(res.subtype).toBe('html');
  expect(res.subtypeTokens).toEqual({ tree: null, name: 'html', suffix: null });
});

test('should parse tree, dotted name and suffix; everything lowercased', () => {
  expect(
    parseFormatted('Application/VnD.company.product.Feature+JsOn'),
  ).toEqual({
    essence: 'application/vnd.company.product.feature+json',
    type: 'application',
    subtype: 'vnd.company.product.feature+json',
    subtypeTokens: {
      tree: 'vnd',
      name: 'company.product.feature',
      suffix: 'json',
    },
    parameters: new Map(),
  });
});

test('should loosely accept leading/trailing whitespace and trailing semicolon', () => {
  expect(parseFormatted('  text/html  ;   ', { loose: true })).toEqual({
    essence: 'text/html',
    type: 'text',
    subtype: 'html',
    subtypeTokens: { tree: null, name: 'html', suffix: null },
    parameters: new Map(),
  });
});

test('should lowercase parameter names and keep the first occurrence on duplicates', () => {
  const res = parseFormatted(
    'text/plain; CHARSET=UTF-8; charset=win1251; KeK  =VaL',
  );
  expect(res.parameters).toEqual(
    new Map([
      ['charset', 'UTF-8'], // first wins, second is ignored
      ['kek  ', 'VaL'], // name lowercased, spaces preserved, value preserved as-is
    ]),
  );
});

test('should ignore parameters without value or with explicitly empty quoted value', () => {
  const res = parseFormatted('text/plain; a; b=""; c=   ; d=1');
  // a (no =) -> filtered, b (empty quotes) -> filtered, c (= with only spaces) -> filtered
  expect(res.parameters).toEqual(new Map([['d', '1']]));
  // also ensure only one entry exists
  expect([...res.parameters.entries()]).toEqual([['d', '1']]);
});

test('should parse unquoted values with internal spaces and trim trailing spaces', () => {
  const res = parseFormatted('text/plain; note=foo   bar  baz   ');
  expect(res.parameters).toEqual(new Map([['note', 'foo   bar  baz']]));
});

test('should keep content inside quoted value as-is (without surrounding quotes)', () => {
  const res = parseFormatted('text/plain; title="Hello World"');
  expect(res.parameters).toEqual(new Map([['title', 'Hello World']]));
});
