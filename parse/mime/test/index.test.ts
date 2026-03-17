/* eslint-disable @typescript-eslint/consistent-type-assertions */
import { describe, expect, test } from 'vitest';

import generatedTestData from '@budsbox/gen-mime-sniff-test-data/generated' with { type: 'json' };
import handCraftedTestData from '@budsbox/gen-mime-sniff-test-data/hand-crafted' with { type: 'json' };
import {
  type ParseFunction,
  SyntaxError as ParserSyntaxError,
  isHttpToken,
  parse,
  serializeMimeType,
  serializeParameters,
  sniff,
} from '@budsbox/parse-mime';

const grammarSource = '<test-string>';

const formatSyntaxError = (input: string, err: unknown): unknown =>
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
    return sniff(input, { ...options, grammarSource, sniff: true });
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
      expect(() => parseFormatted('text/html ;\n')).toThrow('Expected');
    });

    test('should throw if an unquoted parameter value is not a valid HTTP token', () => {
      expect(() => parseFormatted('x/x; foo=bar baz;')).toThrow('Expected');
    });

    test('should throw if an unquoted parameter is empty', () => {
      expect(() => parseFormatted('x/x; foo=; bar=baz')).toThrow('Expected');
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
      expect(() => parseFormatted('text/plain; charset="utf-8\\"')).toThrow(
        'Expected',
      );
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
            facet: 'vnd.',
            parameters: new Map([['charset', 'utf-8']]),
            subtype: 'vnd.company.product+json',
            suffix: '+json',
            type: 'application',
          });
        });

        test('should throw when mimeType rule receives only type without subtype', () => {
          expect(() =>
            parseFormatted('text', { startRule: 'mimeType' }),
          ).toThrow('Expected');
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
          ).toThrow('Expected');
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
          ).toThrow('Expected');
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
          ).toThrow('Expected');
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
          ).toThrow('Expected');
        });

        test('should throw when parameters rule receives non-parameter content (with leading semicolon)', () => {
          expect(() =>
            parseFormatted(';invalid@@@', { startRule: 'parameters' }),
          ).toThrow('Expected');
        });

        test('should throw if an unquoted parameter is empty', () => {
          expect(() => parseFormatted('; foo=; bar=baz')).toThrow('Expected');
        });

        test('should throw when parameters rule receives parameters string without leading semicolon', () => {
          expect(() =>
            parseFormatted('charset=utf-8; boundary=test', {
              startRule: 'parameters',
            }),
          ).toThrow('Expected');
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
          ).toThrow('Expected');
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
          ).toThrow('Expected');
        });

        test('should throw when parameterName rule receives parameter with value', () => {
          expect(() =>
            parseFormatted('charset=utf-8', { startRule: 'parameterName' }),
          ).toThrow('Expected');
        });

        test('should throw on empty string for parameterName rule', () => {
          expect(() =>
            parseFormatted('', { startRule: 'parameterName' }),
          ).toThrow('Expected');
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
          ).toThrow('Expected');
        });

        test('should throw when httpToken rule receives invalid token chars (slash)', () => {
          expect(() =>
            parseFormatted('text/html', { startRule: 'httpToken' }),
          ).toThrow('Expected');
        });
      });
    });

    describe('trim option', () => {
      test('should validate the option type', () => {
        expect(() =>
          parseFormatted('text/html', { trim: 'invalid' as never }),
        ).toThrow('Expected options.trim to be boolean, got string instead');
        expect(() => parseFormatted('text/html', { trim: true })).not.toThrow(
          TypeError,
        );
        expect(() => parseFormatted('text/html', { trim: false })).not.toThrow(
          TypeError,
        );
        expect(() => parseFormatted('text/html', {})).not.toThrow(TypeError);
      });

      test('should throw on whitespace around type when trim is disabled (default mode)', () => {
        expect(() => parseFormatted(' x/x ')).toThrow('Expected');
        expect(() => parseFormatted(' text/html')).toThrow('Expected');
        expect(() => parseFormatted('text/html ')).toThrow('Expected');
        expect(() => parseFormatted(' text/html ', { trim: false })).toThrow(
          'Expected',
        );
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
        ).toThrow('Expected');
      });
    });

    describe('restrictNames option', () => {
      test('should validate the option type', () => {
        expect(() =>
          parseFormatted('text/html', { restrictNames: 'invalid' as never }),
        ).toThrow(
          'Expected options.restrictNames to be boolean, got string instead',
        );
        expect(() =>
          parseFormatted('text/html', { restrictNames: true }),
        ).not.toThrow(TypeError);
        expect(() =>
          parseFormatted('text/html', { restrictNames: false }),
        ).not.toThrow(TypeError);
        expect(() => parseFormatted('text/html', {})).not.toThrow(TypeError);
      });

      test('should throw on non-restricted names when restrictNames is enabled explicitly', () => {
        expect(() =>
          parseFormatted('$app.lication/json', { restrictNames: true }),
        ).toThrow('Expected');
        expect(() =>
          parseFormatted('application/$emer.gency', { restrictNames: true }),
        ).toThrow('Expected');
        expect(() =>
          parseFormatted('application/emergency;$foo=bar', {
            restrictNames: true,
          }),
        ).toThrow('Expected');
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
        ).toThrow(
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
        expect(serializeParameters(res.parameters)).toBe(
          ';foo=bar;foo=baz;foo=qux',
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
        ).toThrow(
          'Expected options.keepCharsetCase to be boolean, got string instead',
        );
        expect(() =>
          parseFormatted('text/html', { keepCharsetCase: true }),
        ).not.toThrow(TypeError);
        expect(() =>
          parseFormatted('text/html', { keepCharsetCase: false }),
        ).not.toThrow(TypeError);
        expect(() => parseFormatted('text/html', {})).not.toThrow(TypeError);
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
        facet: 'emergencycalldata.',
        parameters: new Map([
          ['charset', 'utf-8'],
          ['foo', 'bAr "  azAz'],
          ['kek', 'foo'],
          ['ror', 'lol fof "  '],
          ['bruh', ''],
          ['fufufu', '1'],
        ]),
        subtype: 'emergencycalldata.deviceinfo+xml',
        suffix: '+xml',
        type: 'app.lication',
      });
    });

    /**
     * @see {@link https://raw.githubusercontent.com/web-platform-tests/wpt/refs/heads/master/mimesniff/mime-types/resources/generated-mime-types.json}
     */
    test(`MIME Sniffing Standard generated tests (${String(generatedTestData.length)})`, () => {
      for (const { input, output } of generatedTestData) {
        if (output === null) {
          expect.soft(() => sniffFormatted(input)).toThrow('Expected');
        } else {
          expect.soft(serializeMimeType(sniffFormatted(input))).toEqual(output);
          expect
            .soft(sniffFormatted(input))
            .toStrictEqual(sniffFormatted(output));
        }
      }
    });

    describe(`MIME Sniffing Standard hand-crafted tests (${String(handCraftedTestData.length)})`, () => {
      test.for(handCraftedTestData)(
        'should correctly process $input',
        ({ input, output }) => {
          if (output === null) {
            expect(() => sniffFormatted(input)).toThrow('Expected');
          } else {
            expect(serializeMimeType(sniffFormatted(input))).toBe(output);
            expect(sniffFormatted(input)).toStrictEqual(sniffFormatted(output));
          }
        },
      );
    });
  });

  describe('edge cases', () => {
    test('throws when input is not string', () => {
      expect(() => sniffFormatted(null as never)).toThrow(TypeError);
      expect(() => sniffFormatted(undefined as never)).toThrow(
        'Expected input to be string, got undefined instead',
      );
      expect(() => sniffFormatted(123 as never)).toThrow(TypeError);
      expect(() => sniffFormatted(true as never)).toThrow(TypeError);
      expect(() => sniffFormatted({} as never)).toThrow(TypeError);
      expect(() => sniffFormatted([] as never)).toThrow(TypeError);
    });

    test('throws when options is not object or not a null/undefined', () => {
      expect(() => sniffFormatted('text/html', null as never)).not.toThrow(
        TypeError,
      );
      expect(() => sniffFormatted('text/html', undefined as never)).not.toThrow(
        TypeError,
      );
      expect(() => sniffFormatted('text/html', {} as never)).not.toThrow(
        TypeError,
      );
      expect(() => parse('text/html', 'foobar' as never)).toThrow(TypeError);
      expect(() => parse('text/html', 'foobar' as never)).toThrow(
        'Expected options to be object, got string instead',
      );
    });

    test('throws when serializeMimeType receives invalid record', () => {
      expect(() => serializeMimeType({} as never)).toThrow(TypeError);
      expect(() => serializeMimeType({} as never)).toThrow(
        'Expected record to have own property "type"',
      );
      expect(() =>
        serializeMimeType({ type: 'text', subtype: 1 } as never),
      ).toThrow(TypeError);
      expect(() =>
        serializeMimeType({ type: 'text', subtype: 1 } as never),
      ).toThrow('Expected record.subtype to be string, got number instead');
      expect(() =>
        serializeMimeType({
          type: 'text',
          subtype: 'plain',
          parameters: 'x',
        } as never),
      ).toThrow(TypeError);
    });
  });

  describe('helpers', () => {
    describe('serializeParameters', () => {
      test('returns an empty string when input is undefined', () => {
        expect(serializeParameters(undefined)).toBe('');
      });

      test('returns an empty string when input is an empty object, map, or array', () => {
        expect(serializeParameters({})).toBe('');
        expect(serializeParameters(new Map())).toBe('');
        expect(serializeParameters([])).toBe('');
      });

      test('serializes a single parameter from Map, Object, or Array', () => {
        const expected = ';charset=utf-8';
        expect(serializeParameters(new Map([['charset', 'utf-8']]))).toBe(
          expected,
        );
        expect(serializeParameters({ charset: 'utf-8' })).toBe(expected);
        expect(serializeParameters([['charset', 'utf-8']])).toBe(expected);
      });

      test('serializes multiple parameters and preserves order from Map and Array', () => {
        const params: Array<[string, string]> = [
          ['a', '1'],
          ['b', '2'],
          ['c', '3'],
        ];
        const expected = ';a=1;b=2;c=3';
        expect(serializeParameters(new Map(params))).toBe(expected);
        expect(serializeParameters(params)).toBe(expected);
      });

      test('quotes values that are not valid HTTP tokens (contain spaces, quotes, etc.)', () => {
        expect(serializeParameters({ filename: 'my file.txt' })).toBe(
          ';filename="my file.txt"',
        );
        expect(serializeParameters({ x: 'a"b' })).toBe(';x="a\\"b"');
        expect(serializeParameters({ y: 'a\\b' })).toBe(';y="a\\\\b"');
        expect(serializeParameters({ z: 'a;"b' })).toBe(';z="a;\\"b"');
      });

      test('handles multiple parameters with the same name via array values', () => {
        expect(serializeParameters({ foo: ['bar', 'baz'] })).toBe(
          ';foo=bar;foo=baz',
        );
        expect(serializeParameters(new Map([['foo', ['bar', 'baz']]]))).toBe(
          ';foo=bar;foo=baz',
        );
        expect(serializeParameters([['foo', ['bar', 'baz']]])).toBe(
          ';foo=bar;foo=baz',
        );
      });

      test('handles multiple parameters with the same name via repeated entries in Array or Map', () => {
        const params: Array<[string, string]> = [
          ['foo', 'bar'],
          ['foo', 'baz'],
        ];
        const expected = ';foo=bar;foo=baz';
        expect(serializeParameters(params)).toBe(expected);
        // Map doesn't support duplicate keys, but serializeParameters takes any Iterable of [string, string|string[]]
        expect(serializeParameters(params[Symbol.iterator]())).toBe(expected);
      });

      test('handles empty string values', () => {
        // Empty string is not a valid HTTP token (requires at least one char), so it should be quoted
        expect(serializeParameters({ a: '' })).toBe(';a=""');
      });

      test('throws when parameter_entry is not a tuple', () => {
        expect(() => serializeParameters('x' as never)).toThrow(
          new TypeError(
            'Expected parameter_entry to be a tuple [string,to be string or array], got "x" instead',
          ),
        );
      });

      test('throws when parameter_value is invalid', () => {
        expect(() => serializeParameters([['a', 1]] as never)).toThrow(
          new TypeError(
            'Expected parameter_entry to be a tuple [string,to be string or array], got ["a",1] instead',
          ),
        );
        expect(() => serializeParameters([['a', ['b', 2]]] as never)).toThrow(
          'Expected parameter_value[1] to be string, got number instead',
        );
      });
    });

    describe('isHttpToken', () => {
      test('should return true for valid HTTP tokens', () => {
        expect(isHttpToken('valid-token')).toBe(true);
      });

      test('should return false for invalid HTTP tokens', () => {
        expect(isHttpToken('invalid/token')).toBe(false);
      });

      test('should throw an error for non-string input', () => {
        expect(() => isHttpToken(123 as never)).toThrow(
          new TypeError('Expected input to be string, got number instead'),
        );
      });
    });
  });
});
