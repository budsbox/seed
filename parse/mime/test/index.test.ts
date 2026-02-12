import { describe, expect, test } from 'vitest';
import {
  parse,
  sniff,
  ParseFunction,
  SyntaxError as ParserSyntaxError,
  serializeMimeType,
} from '@budsbox/parse-mime';
import generatedMimeSniffTests from 'mime-sniff-test-data/generated.json';
import handCraftedMimeSniffTests from 'mime-sniff-test-data/hand-crafted.json';

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

describe.sequential('MIME Parser test suite', () => {
  describe.concurrent('IETF standards compliance, common cases', () => {
    describe.for(['semantic', 'sniffing'])('%s mode', (mode) => {
      const overloadedParse: ParseFunction =
        mode === 'sniffing' ? sniffFormatted : parseFormatted;

      test('should parse "text/html" and "x/x"', () => {
        expect(overloadedParse('text/html')).toEqual({
          essence: 'text/html',
          type: 'text',
          subtype: 'html',
          parameters: new Map(),
        });

        expect(overloadedParse('x/x')).toEqual({
          essence: 'x/x',
          type: 'x',
          subtype: 'x',
          parameters: new Map(),
        });
      });

      test('should parse "text/html" and serialize it back', () => {
        const source = 'text/html';
        const parsed = overloadedParse(source);
        const serialized = serializeMimeType(parsed);

        expect(serialized).toBe(source);
      });

      test('should parse and lowercase essence', () => {
        const res = overloadedParse('TEXT/HTML');
        expect(res.essence).toBe('text/html');
      });

      test('should parse facet and suffix from subtype; values are detected (subtype casing may be preserved)', () => {
        const res = overloadedParse(
          'Application/VnD.company.product.Feature+JsOn',
        );
        expect(res.subtype).toBe('vnd.company.product.feature+json');
        expect(res.facet).toBe('vnd.');
        expect(res.suffix).toBe('+json');
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
        expect(
          overloadedParse('text/plain;  charset=utf-8').parameters,
        ).toEqual(new Map([['charset', 'utf-8']]));
        expect(
          overloadedParse('text/plain;\tcharset=utf-8').parameters,
        ).toEqual(new Map([['charset', 'utf-8']]));
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
        expect(
          overloadedParse('text/plain; charset=utf-8;').parameters,
        ).toStrictEqual(new Map([['charset', 'utf-8']]));
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

      test('should keep parameters with explicitly empty quoted value', () => {
        const res = overloadedParse('text/plain; b=""; d=1');
        // a (no =) -> filtered, b (empty quotes) -> filtered, c (= with only spaces) -> filtered
        expect(res.parameters).toStrictEqual(
          new Map([
            ['b', ''],
            ['d', '1'],
          ]),
        );
      });

      test('should accept leading/trailing whitespace and trailing semicolon in sniffing mode', () => {
        expect(sniffFormatted('  text/html  ;   ')).toEqual({
          essence: 'text/html',
          type: 'text',
          subtype: 'html',
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
      expect(() => parseFormatted('x/x; foo=bar baz;')).toThrowError(
        'Expected',
      );
    });

    test('should throw if an unquoted parameter is empty', () => {
      expect(() => parseFormatted('x/x; foo=; bar=baz')).toThrowError(
        'Expected',
      );
    });

    test('should parse "charset" parameter and lowercase its value', () => {
      expect(parseFormatted('text/plain; charset=utf-8').parameters).toEqual(
        new Map([['charset', 'utf-8']]),
      );
      expect(parseFormatted('text/plain; charset=UTF-8').parameters).toEqual(
        new Map([['charset', 'utf-8']]),
      );
      expect(parseFormatted('text/plain; charset=Utf-8').parameters).toEqual(
        new Map([['charset', 'utf-8']]),
      );
      expect(
        parseFormatted('text/plain; charset=ISO-8859-1').parameters,
      ).toEqual(new Map([['charset', 'iso-8859-1']]));
      expect(parseFormatted('text/plain; charset="UTF-8"').parameters).toEqual(
        new Map([['charset', 'utf-8']]),
      );
    });

    test('should throw on unclosed quoted parameter value', () => {
      expect(() =>
        parseFormatted('text/plain; charset="utf-8\\"'),
      ).toThrowError('Expected');
    });
  });

  describe.concurrent('Options', () => {
    describe('startRule option', () => {
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
            facet: 'vnd.',
            suffix: '+json',
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
          });
        });

        test('should throw when essence rule receives MIME type with parameters', () => {
          expect(() =>
            parseFormatted('text/plain; charset=utf-8', {
              startRule: 'essence',
            }),
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
          });
        });

        test('should parse subtype with facet and suffix', () => {
          const res = parseFormatted('vnd.company.product+xml', {
            startRule: 'subtype',
          });
          expect(res).toStrictEqual({
            subtype: 'vnd.company.product+xml',
            facet: 'vnd.',
            suffix: '+xml',
          });
        });

        test('should throw when subtype rule receives type/subtype', () => {
          expect(() =>
            parseFormatted('text/html', { startRule: 'subtype' }),
          ).toThrowError('Expected');
        });
      });

      // Obsolete start rules removed from the parser (covered by other tests):
      // - 'tree'
      // - 'subtypeName'
      // - 'subtypeSuffix'

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
          const res = parseFormatted('charset=utf-8', {
            startRule: 'parameter',
          });
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

      describe('parameterName rule', () => {
        test('should parse valid parameter name with parameterName startRule', () => {
          const res = parseFormatted('charset', {
            startRule: 'parameterName',
          });
          expect(res).toBe('charset');
        });

        test('should lowercase parameter name', () => {
          const res = parseFormatted('CHARSET', {
            startRule: 'parameterName',
          });
          expect(res).toBe('charset');
        });

        test('should throw when parameterName rule receives non-token characters', () => {
          expect(() =>
            parseFormatted('invalid name', { startRule: 'parameterName' }),
          ).toThrowError('Expected');
        });

        test('should throw when parameterName rule receives parameter with value', () => {
          expect(() =>
            parseFormatted('charset=utf-8', { startRule: 'parameterName' }),
          ).toThrowError('Expected');
        });

        test('should throw on empty string for parameterName rule', () => {
          expect(() =>
            parseFormatted('', { startRule: 'parameterName' }),
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

    describe('trim option', () => {
      test('should validate the option type', () => {
        expect(() =>
          parseFormatted('text/html', { trim: 'invalid' as never }),
        ).toThrowError(
          'Expected options.trim to be boolean, got string instead',
        );
        expect(() =>
          parseFormatted('text/html', { trim: true }),
        ).not.toThrowError(TypeError);
        expect(() =>
          parseFormatted('text/html', { trim: false }),
        ).not.toThrowError(TypeError);
        expect(() => parseFormatted('text/html', {})).not.toThrowError(
          TypeError,
        );
      });

      test('should throw on whitespace around type when trim is disabled (default mode)', () => {
        expect(() => parseFormatted(' x/x ')).toThrowError('Expected');
        expect(() => parseFormatted(' text/html')).toThrowError('Expected');
        expect(() => parseFormatted('text/html ')).toThrowError('Expected');
        expect(() =>
          parseFormatted(' text/html ', { trim: false }),
        ).toThrowError('Expected');
      });

      test('should parse whitespace around type when trim is enabled explicitly', () => {
        expect(parseFormatted(' x/x ', { trim: true })).toEqual({
          essence: 'x/x',
          type: 'x',
          subtype: 'x',
          parameters: new Map(),
        });
      });

      test('should trim whitespace around type by default in sniff mode', () => {
        expect(sniffFormatted(' x/x ')).toEqual({
          essence: 'x/x',
          type: 'x',
          subtype: 'x',
          parameters: new Map(),
        });
        expect(sniffFormatted(' text/html ')).toEqual({
          essence: 'text/html',
          type: 'text',
          subtype: 'html',
          parameters: new Map(),
        });
      });

      test('should throw on whitespace in sniff mode when trim is explicitly disabled', () => {
        expect(() =>
          parseFormatted(' x/x ', { sniff: true, trim: false }),
        ).toThrowError('Expected');
      });
    });

    describe('restrictNames option', () => {
      test('should validate the option type', () => {
        expect(() =>
          parseFormatted('text/html', { restrictNames: 'invalid' as never }),
        ).toThrowError(
          'Expected options.restrictNames to be boolean, got string instead',
        );
        expect(() =>
          parseFormatted('text/html', { restrictNames: true }),
        ).not.toThrowError(TypeError);
        expect(() =>
          parseFormatted('text/html', { restrictNames: false }),
        ).not.toThrowError(TypeError);
        expect(() => parseFormatted('text/html', {})).not.toThrowError(
          TypeError,
        );
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
      });

      test('should parse non-restricted names when restrictNames is disabled explicitly', () => {
        expect(
          parseFormatted('$application/json', { restrictNames: false }).type,
        ).toEqual('$application');
        expect(
          parseFormatted('application/$json', { restrictNames: false }).subtype,
        ).toEqual('$json');
        expect(
          parseFormatted('application/$json ; $foo=bar', {
            restrictNames: false,
          }).parameters,
        ).toEqual(new Map([['$foo', 'bar']]));
      });

      test('should ignore this option in sniff mode', () => {
        expect(
          sniffFormatted('$application/json', { restrictNames: true }).type,
        ).toEqual('$application');
        expect(
          sniffFormatted('application/$json', { restrictNames: true }).subtype,
        ).toEqual('$json');
        expect(
          sniffFormatted('application/$json ; $foo=bar', {
            restrictNames: true,
          }).parameters,
        ).toEqual(new Map([['$foo', 'bar']]));
      });
    });

    describe('multiParameter option', () => {
      test('should validate the option value', () => {
        expect(() =>
          parseFormatted('text/plain', { multiParameter: 'invalid' as never }),
        ).toThrowError(
          'Expected options.multiParameter to be any of: "keep-first", "keep-last", or "list", got "invalid" instead',
        );
        expect(() =>
          parseFormatted('text/plain', { multiParameter: 'keep-first' }),
        ).not.toThrow(TypeError);
        expect(() =>
          parseFormatted('text/plain', { multiParameter: 'keep-last' }),
        ).not.toThrow(TypeError);
        expect(() =>
          parseFormatted('text/plain', { multiParameter: 'list' }),
        ).not.toThrow(TypeError);
      });

      test('should keep first occurrence of duplicate parameter by default (keep-first)', () => {
        const res = parseFormatted('text/plain; foo=bar; foo=baz; foo=qux');
        expect(res.parameters).toStrictEqual(new Map([['foo', 'bar']]));
      });

      test('should keep first occurrence of duplicate parameter when multiParameter is "keep-first"', () => {
        const res = parseFormatted('text/plain; foo=bar; foo=baz; foo=qux', {
          multiParameter: 'keep-first',
        });
        expect(res.parameters).toStrictEqual(new Map([['foo', 'bar']]));

        const resSniff = sniffFormatted(
          'text/plain; foo=bar; foo=baz; foo=qux',
          {
            multiParameter: 'keep-first',
          },
        );
        expect(resSniff.parameters).toStrictEqual(new Map([['foo', 'bar']]));
      });

      test('should keep last occurrence of duplicate parameter when multiParameter is "keep-last"', () => {
        const res = parseFormatted('text/plain; foo=bar; foo=baz; foo=qux', {
          multiParameter: 'keep-last',
        });
        expect(res.parameters).toStrictEqual(new Map([['foo', 'qux']]));

        const resSniff = sniffFormatted(
          'text/plain; foo=bar; foo=baz; foo=qux',
          {
            multiParameter: 'keep-last',
          },
        );
        expect(resSniff.parameters).toStrictEqual(new Map([['foo', 'qux']]));
      });

      test('should keep all occurrences as array when multiParameter is "list"', () => {
        const res = parseFormatted('text/plain; foo=bar; foo=baz; foo=qux', {
          multiParameter: 'list',
        });
        expect(res.parameters).toStrictEqual(
          new Map([['foo', ['bar', 'baz', 'qux']]]),
        );

        const resSniff = sniffFormatted(
          'text/plain; foo=bar; foo=baz; foo=qux',
          {
            multiParameter: 'list',
          },
        );
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

    describe('keepCharsetCase option', () => {
      test('should validate the option type', () => {
        expect(() =>
          parseFormatted('text/html', { keepCharsetCase: 'invalid' as never }),
        ).toThrowError(
          'Expected options.keepCharsetCase to be boolean, got string instead',
        );
        expect(() =>
          parseFormatted('text/html', { keepCharsetCase: true }),
        ).not.toThrowError(TypeError);
        expect(() =>
          parseFormatted('text/html', { keepCharsetCase: false }),
        ).not.toThrowError(TypeError);
        expect(() => parseFormatted('text/html', {})).not.toThrowError(
          TypeError,
        );
      });

      test('should lowercase charset by default in semantic mode', () => {
        const parsed = parseFormatted('text/plain; charset=Utf-8');
        expect(parsed.parameters.get('charset')).toBe('utf-8');

        const serialized = serializeMimeType(parsed);
        expect(serialized).toBe('text/plain;charset=utf-8');
      });

      test('should preserve charset case when keepCharsetCase is true in semantic mode', () => {
        const parsed = parseFormatted('text/plain; charset=Utf-8', {
          keepCharsetCase: true,
        });
        expect(parsed.parameters.get('charset')).toBe('Utf-8');

        const serialized = serializeMimeType(parsed);
        expect(serialized).toBe('text/plain;charset=Utf-8');
      });

      test('should keep charset case by default in sniff mode', () => {
        const parsed = sniffFormatted('text/plain; charset=UTF-8');
        expect(parsed.parameters.get('charset')).toBe('UTF-8');

        const serialized = serializeMimeType(parsed);
        expect(serialized).toBe('text/plain;charset=UTF-8');
      });

      test('should lowercase charset when keepCharsetCase is false in sniff mode', () => {
        const parsed = sniffFormatted('text/plain; charset=UTF-8', {
          keepCharsetCase: false,
        });
        expect(parsed.parameters.get('charset')).toBe('utf-8');

        const serialized = serializeMimeType(parsed);
        expect(serialized).toBe('text/plain;charset=utf-8');
      });
    });
  });

  describe('Sniff mode', () => {
    test('should accept leading/trailing whitespace and trailing semicolon', () => {
      expect(sniffFormatted('  text/html  ')).toEqual({
        essence: 'text/html',
        type: 'text',
        subtype: 'html',
        parameters: new Map(),
      });
    });

    test('should parse unquoted values with internal spaces and trim trailing spaces', () => {
      const res = sniffFormatted('text/plain; note=foo   bar  baz   ');
      expect(res.parameters).toEqual(new Map([['note', 'foo   bar  baz']]));
    });

    test('should accept subtypes with the facet only', () => {
      const res = sniffFormatted('application/vnd.');
      expect(serializeMimeType(res)).toBe('application/vnd.');
      expect(res.type).toBe('application');
      expect(res.subtype).toBe('vnd.');
    });

    test('should accept subtypes starting with a "+" sign', () => {
      const res = sniffFormatted('application/+json');
      expect(serializeMimeType(res)).toBe('application/+json');
      expect(res.type).toBe('application');
      expect(res.subtype).toBe('+json');
    });

    test('should parse overcomplicated non-restricted MIME-type', () => {
      expect(
        sniffFormatted(
          '  apP.lIcaTion/emergencycAlldata.deviceiNfo+xMl;  chaRset=utf-8   ;foo=bAr "  azAz ; kEk=foo ;  ror="lol fof \\"  ";bruh=""; oraoraora= ; foo=   ; fufufu=1     ',
        ),
      ).toStrictEqual({
        essence: 'app.lication/emergencycalldata.deviceinfo+xml',
        type: 'app.lication',
        subtype: 'emergencycalldata.deviceinfo+xml',
        facet: 'emergencycalldata.',
        suffix: '+xml',
        parameters: new Map([
          ['charset', 'utf-8'],
          ['foo', 'bAr "  azAz'],
          ['kek', 'foo'],
          ['ror', 'lol fof "  '],
          ['bruh', ''],
          ['fufufu', '1'],
        ]),
      });
    });

    /**
     * @see {@link https://raw.githubusercontent.com/web-platform-tests/wpt/refs/heads/master/mimesniff/mime-types/resources/generated-mime-types.json}
     */
    test('MIME Sniffing Standard generated tests', () => {
      for (const { input, output } of generatedMimeSniffTests) {
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

    describe('MIME Sniffing Standard hand-crafted tests', () => {
      test.for(handCraftedMimeSniffTests)(
        'should correctly process $input',
        ({ input, output }) => {
          if (output === null) {
            expect(() => sniffFormatted(input)).toThrowError('Expected');
          } else {
            expect(serializeMimeType(sniffFormatted(input))).toBe(output);
            expect(sniffFormatted(input)).toStrictEqual(sniffFormatted(output));
          }
        },
      );
    });
  });

  describe('edgeCases', () => {
    test('throws when input is not string', () => {
      expect(() => sniffFormatted(null as never)).toThrowError(TypeError);
      expect(() => sniffFormatted(undefined as never)).toThrowError(
        'Expected input to be string, got undefined instead',
      );
      expect(() => sniffFormatted(123 as never)).toThrowError(TypeError);
      expect(() => sniffFormatted(true as never)).toThrowError(TypeError);
      expect(() => sniffFormatted({} as never)).toThrowError(TypeError);
      expect(() => sniffFormatted([] as never)).toThrowError(TypeError);
    });

    test('throws when options is not object or not a null/undefined', () => {
      expect(() => sniffFormatted('text/html', null as never)).not.toThrowError(
        TypeError,
      );
      expect(() =>
        sniffFormatted('text/html', undefined as never),
      ).not.toThrowError(TypeError);
      expect(() => sniffFormatted('text/html', {} as never)).not.toThrowError(
        TypeError,
      );
      expect(() => parse('text/html', 'foobar' as never)).toThrowError(
        TypeError,
      );
      expect(() => parse('text/html', 'foobar' as never)).toThrowError(
        'Expected options to be object, got string instead',
      );
    });
  });
});
