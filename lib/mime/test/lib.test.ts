import {
  normalize,
  parse,
  produceOutput,
  getParameter,
  removeParameter,
  serialize,
  setParameter,
  unwrapInput,
  update,
} from '#lib';
import { describe, expect, test } from 'vitest';

describe.concurrent('MIME Type Library', () => {
  describe('parse', () => {
    describe('positive cases', () => {
      test('should create MimeTypeRecord from string MIME type', () => {
        const result = parse('text/html; charset=utf-8');
        expect(result).toStrictEqual({
          essence: 'text/html',
          type: 'text',
          subtype: 'html',
          subtypeTokens: { tree: null, name: 'html', suffix: null },
          parameters: new Map([['charset', 'utf-8']]),
        });
      });

      test('should create MimeTypeRecord from simple MIME type without parameters', () => {
        const result = parse('application/json');
        expect(result).toStrictEqual({
          essence: 'application/json',
          type: 'application',
          subtype: 'json',
          subtypeTokens: { tree: null, name: 'json', suffix: null },
          parameters: new Map(),
        });
      });

      test('should return same MimeTypeRecord if input is already a MimeTypeRecord', () => {
        const input = parse('text/plain');
        const result = parse(input);
        expect(result).toBe(input);
      });

      test('should handle MIME types with multiple parameters', () => {
        const result = parse(
          'multipart/form-data; boundary=----WebKitFormBoundary; charset=utf-8',
        );
        expect(result).toStrictEqual({
          essence: 'multipart/form-data',
          type: 'multipart',
          subtype: 'form-data',
          subtypeTokens: { tree: null, name: 'form-data', suffix: null },
          parameters: new Map([
            ['boundary', '----WebKitFormBoundary'],
            ['charset', 'utf-8'],
          ]),
        });
      });

      test('should handle case-insensitive MIME types', () => {
        const result = parse('TEXT/HTML');
        expect(result).toStrictEqual({
          essence: 'text/html',
          type: 'text',
          subtype: 'html',
          subtypeTokens: { tree: null, name: 'html', suffix: null },
          parameters: new Map(),
        });
      });

      test('should handle MIME types with quoted parameter values', () => {
        const result = parse('text/plain; name="file.txt"');
        expect(result.parameters.get('name')).toBe('file.txt');
      });

      test('should handle MIME types with quoted parameter values (with a quote in it)', () => {
        const result = parse('text/plain; foo="bar \\" baz"');
        expect(result.parameters.get('foo')).toBe('bar " baz');
      });
    });

    describe('negative cases', () => {
      test('should throw SyntaxError for invalid MIME type string', () => {
        expect(() => parse('invalid')).toThrow();
      });

      test('should throw SyntaxError for malformed MIME type', () => {
        expect(() => parse('text/')).toThrow();
      });

      test('should throw SyntaxError for MIME type with invalid characters', () => {
        expect(() => parse('text<html')).toThrow();
      });
    });
  });

  describe('update', () => {
    describe('essence', () => {
      describe('positive cases', () => {
        test('should update essence of existing MIME type', () => {
          const original = parse('text/html; charset=utf-8');
          const result = update(original, 'essence', 'application/json');
          expect(result).toStrictEqual({
            essence: 'application/json',
            type: 'application',
            subtype: 'json',
            subtypeTokens: { tree: null, name: 'json', suffix: null },
            parameters: new Map([['charset', 'utf-8']]),
          });
        });

        test('should update essence from string input', () => {
          const result = update('text/html', 'essence', 'application/xml');
          expect(result).toBe('application/xml');
        });

        test('should preserve existing parameters when updating essence', () => {
          const original = parse('text/html; charset=utf-8; boundary=abc123');
          const result = update(original, 'essence', 'image/png');
          expect(result.parameters.get('charset')).toBe('utf-8');
          expect(result.parameters.get('boundary')).toBe('abc123');
        });
      });

      describe('negative cases', () => {
        test('should throw SyntaxError for invalid essence', () => {
          expect(() => update('text/html', 'essence', 'invalid')).toThrow(
            `Failed to parse essence: expected"/" or restricted-name char ([a-z0-9"!#$&-^_"]i) but end of input found.
 --> <input>:1:8
  |
1 | invalid
  |        ^`,
          );
        });

        test('should throw SyntaxError for empty type in essence', () => {
          expect(() => update('text/html', 'essence', '/json')).toThrow(
            'Failed to parse essence',
          );
        });

        test('should throw SyntaxError for empty subtype in essence', () => {
          expect(() => update('text/html', 'essence', 'application/')).toThrow(
            'Failed to parse essence',
          );
        });
      });
    });

    describe('parameters', () => {
      describe('positive cases', () => {
        test('should update parameters with string input', () => {
          const result = update(
            'text/html',
            'parameters',
            'charset=utf-8; boundary=abc',
          );
          expect(result).toBe('text/html;charset=utf-8;boundary=abc');
        });

        test('should update parameters from Map', () => {
          const params = new Map([['charset', 'utf-8']]);
          const result = update(parse('text/html'), 'parameters', params);
          expect(result.parameters.get('charset')).toBe('utf-8');
        });

        test('should update parameters from array of entries', () => {
          const original = parse('text/html');
          const params = [
            ['charset', 'utf-8'],
            ['boundary', '123'],
          ] as const;
          const result = update(original, 'parameters', params);
          expect(result.parameters).toStrictEqual(new Map(params));
        });

        test('should replace existing parameters', () => {
          const original = parse('text/html; charset=iso-8859-1');
          const result = update(original, 'parameters', 'charset=utf-8');
          expect(result.parameters.get('charset')).toBe('utf-8');
        });

        test('should handle empty parameter string', () => {
          const original = parse('text/html; charset=utf-8');
          const result = update(original, 'parameters', '');
          expect(result.parameters.size).toBe(0);
        });
      });

      describe('negative cases', () => {
        test('should throw SyntaxError for invalid parameter string', () => {
          expect(() => update('text/html', 'parameters', 'invalid@@@')).toThrow(
            'Failed to parse parameters',
          );
        });

        test('should throw SyntaxError for malformed parameter syntax', () => {
          expect(() =>
            update('text/html', 'parameters', 'charset=='),
          ).toThrow();
        });
      });
    });

    describe('type', () => {
      describe('positive cases', () => {
        test('should update type component', () => {
          const original = parse('text/html');
          const result = update(original, 'type', 'application');
          expect(result).toStrictEqual({
            essence: 'application/html',
            type: 'application',
            subtype: 'html',
            subtypeTokens: { tree: null, name: 'html', suffix: null },
            parameters: new Map(),
          });
        });

        test('should update type from string input', () => {
          const result = update('text/html; charset=utf-8', 'type', 'image');
          expect(result).toBe('image/html;charset=utf-8');
        });
      });

      describe('negative cases', () => {
        test('should throw SyntaxError for invalid type', () => {
          expect(() => update('text/html', 'type', 'invalid<>')).toThrow();
        });

        test('should throw SyntaxError for empty type', () => {
          expect(() => update('text/html', 'type', '')).toThrow();
        });
      });
    });

    describe('subtype', () => {
      describe('positive cases', () => {
        test('should update subtype component', () => {
          const original = parse('text/html');
          const result = update(original, 'subtype', 'plain');
          expect(result).toStrictEqual({
            essence: 'text/plain',
            type: 'text',
            subtype: 'plain',
            subtypeTokens: { tree: null, name: 'plain', suffix: null },
            parameters: new Map(),
          });
        });

        test('should preserve parameters when updating subtype', () => {
          const original = parse('text/html; charset=utf-8');
          const result = update(original, 'subtype', 'xml');
          expect(result).toStrictEqual({
            essence: 'text/xml',
            type: 'text',
            subtype: 'xml',
            subtypeTokens: { tree: null, name: 'xml', suffix: null },
            parameters: new Map([['charset', 'utf-8']]),
          });
        });

        test('should handle subtype with tree prefix and suffix', () => {
          const result = update(
            parse('application/json'),
            'subtype',
            'vnd.example+xml',
          );
          expect(result.subtypeTokens.tree).toBe('vnd.');
          expect(result.subtypeTokens.suffix).toBe('+xml');
        });
      });

      describe('negative cases', () => {
        test('should throw SyntaxError for invalid subtype', () => {
          expect(() => update('text/html', 'subtype', 'invalid<>')).toThrow();
        });

        test('should throw SyntaxError for empty subtype', () => {
          expect(() => update('text/html', 'subtype', '')).toThrow();
        });
      });
    });
  });

  describe('getParameter', () => {
    describe('positive cases', () => {
      test('should get existing parameter from record', () => {
        const rec = parse('text/html; charset=utf-8; boundary=abc');
        const charset = getParameter(rec, 'charset');
        const boundary = getParameter(rec, 'boundary');
        expect(charset).toBe('utf-8');
        expect(boundary).toBe('abc');
      });

      test('should get existing parameter from string input', () => {
        const charset = getParameter('text/html; charset=utf-8', 'charset');
        expect(charset).toBe('utf-8');
      });

      test('should be case-insensitive for parameter name', () => {
        const rec = parse('text/plain; FoO=bar');
        expect(getParameter(rec, 'foo')).toBe('bar');
        expect(getParameter(rec, 'FOO')).toBe('bar');
      });

      test('should return null for missing parameter by default', () => {
        const rec = parse('text/html; charset=utf-8');
        const v = getParameter(rec, 'boundary');
        expect(v).toBeNull();
      });

      test('should respect multi-parameter strategy: keep-first (default)', () => {
        const v = getParameter({ mimeType: 'text/html; q=0.5; q=0.8' }, 'q');
        expect(v).toBe('0.5');
      });

      test('should respect multi-parameter strategy: keep-last', () => {
        const v = getParameter(
          { mimeType: 'text/html; q=0.5; q=0.8', multiParameter: 'keep-last' },
          'q',
        );
        expect(v).toBe('0.8');
      });

      test('should respect multi-parameter strategy: list returns array', () => {
        const v = getParameter(
          { mimeType: 'text/html; q=0.5; q=0.8', multiParameter: 'list' },
          'q',
        );
        expect(v).toStrictEqual(['0.5', '0.8']);
      });
    });

    describe('negative cases', () => {
      test('should throw when parameter is missing and throwOnMissing is true', () => {
        expect(() =>
          getParameter('text/html; charset=utf-8', 'boundary', true),
        ).toThrow(
          'Parameter "boundary" is not found in MIME type "text/html;charset=utf-8"',
        );
      });
    });
  });

  describe('setParameter', () => {
    describe('set new parameter', () => {
      test('should set new string parameter', () => {
        const original = parse('text/html');
        const result = setParameter(original, 'charset', 'utf-8');
        expect(result.parameters).toStrictEqual(
          new Map([['charset', 'utf-8']]),
        );
      });

      test('should set numeric parameter as string', () => {
        const original = parse('text/html');
        const result = setParameter(original, 'quality', 0.8);
        expect(result.parameters.get('quality')).toBe('0.8');
      });

      test('should set parameter on string input', () => {
        const result = setParameter('text/html', 'charset', 'utf-8');
        expect(result).toBe('text/html;charset=utf-8');
      });

      test('should set parameter without removing existing parameters', () => {
        const original = parse('text/html; boundary=abc');
        const result = setParameter(original, 'charset', 'utf-8');
        expect(result).toStrictEqual({
          essence: 'text/html',
          type: 'text',
          subtype: 'html',
          subtypeTokens: { tree: null, name: 'html', suffix: null },
          parameters: new Map([
            ['boundary', 'abc'],
            ['charset', 'utf-8'],
          ]),
        });
      });
    });

    describe('update existing parameter', () => {
      test('should update existing parameter value', () => {
        const original = parse('text/html; charset=iso-8859-1');
        const result = setParameter(original, 'charset', 'utf-8');
        expect(result.parameters.get('charset')).toBe('utf-8');
      });

      test('should preserve other parameters when updating', () => {
        const original = parse('text/html; charset=iso-8859-1; boundary=abc');
        const result = setParameter(original, 'charset', 'utf-8');
        expect(result.parameters).toStrictEqual(
          new Map([
            ['charset', 'utf-8'],
            ['boundary', 'abc'],
          ]),
        );
      });
    });

    describe('remove parameter with nil/empty values', () => {
      test('should remove parameter when value is null', () => {
        const original = parse('text/html; charset=utf-8');
        const result = setParameter(original, 'charset', null);
        expect(result.parameters.has('charset')).toBe(false);
      });

      test('should remove parameter when value is undefined', () => {
        const original = parse('text/html; charset=utf-8');
        const result = setParameter(original, 'charset', undefined);
        expect(result.parameters.has('charset')).toBe(false);
      });

      test('should remove parameter when value is empty string', () => {
        const original = parse('text/html; charset=utf-8');
        const result = setParameter(original, 'charset', '');
        expect(result.parameters.has('charset')).toBe(false);
      });
    });

    describe('negative cases', () => {
      test('should throw error for invalid MIME type input', () => {
        expect(() => setParameter('invalid', 'charset', 'utf-8')).toThrow();
      });
    });
  });

  describe('removeParameter', () => {
    describe('positive cases', () => {
      test('should remove existing parameter', () => {
        const original = parse('text/html; charset=utf-8; boundary=abc');
        const result = removeParameter(original, 'charset');
        expect(result.parameters).toStrictEqual(new Map([['boundary', 'abc']]));
      });

      test('should return same record when removing non-existent parameter', () => {
        const original = parse('text/html; charset=utf-8');
        const result = removeParameter(original, 'nonexistent');
        expect(result).toBe(original);
      });

      test('should remove parameter from string input', () => {
        const result = removeParameter(
          'text/html; charset=utf-8; boundary=abc',
          'charset',
        );
        expect(result).toBe('text/html;boundary=abc');
      });

      test('should handle case-insensitive parameter removal', () => {
        const original = parse('text/html; CHARSET=utf-8');
        const result = removeParameter(original, 'charset');
        expect(result.parameters.has('charset')).toBe(false);
      });

      test('should remove parameter from MIME type with single parameter', () => {
        const original = parse('text/html; charset=utf-8');
        const result = removeParameter(original, 'charset');
        expect(result.parameters.size).toBe(0);
        expect(serialize(result)).toBe('text/html');
      });
    });

    describe('negative cases', () => {
      test('should throw error for invalid MIME type input', () => {
        expect(() => removeParameter('invalid', 'param')).toThrow();
      });
    });
  });

  describe('serialize', () => {
    describe('positive cases', () => {
      test('should serialize MimeTypeRecord without parameters', () => {
        const record = parse('text/html');
        const result = serialize(record);
        expect(result).toBe('text/html');
      });

      test('should serialize MimeTypeRecord with multiple parameters', () => {
        const record = parse('text/html; charset=utf-8; boundary=abc123');
        const result = serialize(record);
        expect(result).toBe('text/html;charset=utf-8;boundary=abc123');
      });

      test('should serialize multipart/form-data with boundary', () => {
        const record = parse('multipart/form-data; boundary=----WebKit');
        const result = serialize(record);
        expect(result).toBe('multipart/form-data;boundary=----WebKit');
      });

      test('should serialize MIME type with quoted parameter value', () => {
        const record = parse('text/plain; filename="my \\"quoted\\" file.txt"');
        const result = serialize(record);
        expect(result).toBe('text/plain;filename="my \\"quoted\\" file.txt"');
      });

      test('should serialize MIME type with subtype tree and suffix', () => {
        const record = parse('application/vnd.example+xml');
        const result = serialize(record);
        expect(result).toBe('application/vnd.example+xml');
      });
    });
  });

  describe('normalize', () => {
    describe('positive cases', () => {
      test('should normalize mixed-case MIME type string', () => {
        const result = normalize('TEXT/HTML; Charset=UTF-8');
        expect(result).toBe('text/html;charset=utf-8');
      });
    });

    describe('negative cases', () => {
      test('should throw error for invalid MIME type string', () => {
        expect(() => normalize('invalid')).toThrow('Failed to sniff MIME type');
      });

      test('should throw error for malformed MIME type', () => {
        expect(() => normalize('text/')).toThrow('Failed to sniff MIME type');
      });
    });
  });

  describe('internal utilities', () => {
    describe('unwrapInput', () => {
      describe('input shapes', () => {
        test('should unwrap from raw string without options', () => {
          const [record, options] = unwrapInput('TEXT/HTML; CHARSET=UTF-8');
          expect(options).toBeUndefined();
          expect(record).toStrictEqual({
            essence: 'text/html',
            type: 'text',
            subtype: 'html',
            subtypeTokens: { tree: null, name: 'html', suffix: null },
            parameters: new Map([['charset', 'utf-8']]),
          });
        });

        test('should return the same record instance and no options for MimeTypeRecord input', () => {
          const input = parse('text/plain; charset=UTF-8');
          const [record, options] = unwrapInput(input);
          expect(record).toBe(input);
          expect(options).toBeUndefined();
        });

        test('should separate options from { mimeType } container', () => {
          const [record, options] = unwrapInput({
            mimeType: 'text/html; charset=UTF-8',
          });
          expect(serialize(record)).toBe('text/html;charset=utf-8');
          expect(options).toStrictEqual({});
        });

        test('should keep provided options for { mimeType, ...options }', () => {
          const [record, options] = unwrapInput({
            mimeType: 'text/html; charset=UTF-8',
            serialize: true,
            keepCharsetCase: true,
            multiParameter: 'keep-last',
          });
          expect(serialize(record)).toBe('text/html;charset=UTF-8');
          expect(options).toStrictEqual({
            serialize: true,
            keepCharsetCase: true,
            multiParameter: 'keep-last',
          });
        });

        test('should build record from serializable object and return its options', () => {
          const [record, options] = unwrapInput({
            type: 'text',
            subtype: 'html',
            serialize: false,
            multiParameter: 'keep-first',
          } as const);
          expect(serialize(record)).toBe('text/html');
          expect(options).toStrictEqual({
            serialize: false,
            multiParameter: 'keep-first',
          });
        });

        test('should honor serialize option presence in returned options for serializable object', () => {
          const [record, options] = unwrapInput({
            type: 'application',
            subtype: 'json',
            serialize: true,
          } as const);
          expect(serialize(record)).toBe('application/json');
          expect(options).toStrictEqual({ serialize: true });
        });
      });
    });

    describe('produceOutput', () => {
      describe('output type resolution', () => {
        test('should produce string for raw string input', () => {
          const rec = parse('text/html; charset=utf-8');
          const out = produceOutput('text/plain', rec);
          expect(out).toBe('text/html;charset=utf-8');
        });

        test('should produce string for { mimeType } input container', () => {
          const rec = parse('image/png');
          const out = produceOutput({ mimeType: 'text/plain' }, rec);
          expect(out).toBe('image/png');
        });

        test('should produce record for { mimeType, serialize: false }', () => {
          const rec = parse('application/xml');
          const out = produceOutput(
            { mimeType: 'text/plain', serialize: false },
            rec,
          );
          expect(out).toBe(rec);
          expect(parse(out)).toBe(out);
        });

        test('should produce record for serializable object input (no serialize flag)', () => {
          const rec = parse('text/css');
          const out = produceOutput({ type: 'text', subtype: 'html' }, rec);
          expect(out).toBe(rec);
          expect(parse(out)).toBe(out);
        });

        test('should produce string for serializable object with serialize: true', () => {
          const rec = parse('multipart/form-data; boundary=abc');
          const out = produceOutput(
            { type: 'text', subtype: 'html', serialize: true },
            rec,
          );
          expect(out).toBe('multipart/form-data;boundary=abc');
        });

        test('should produce record for MimeTypeRecord input', () => {
          const input = parse('text/plain');
          // create a fresh object to ensure it gets registered by produceOutput
          const updated = {
            ...input,
            parameters: new Map(input.parameters),
          } as typeof input;
          const out = produceOutput(input, updated);
          expect(out).not.toBe(input);
          expect(parse(out)).toBe(out);
          expect(serialize(out)).toBe('text/plain');
        });
      });
    });
  });

  describe('Integration Tests', () => {
    test('should chain multiple operations', () => {
      let result = parse('text/html');
      result = setParameter(result, 'charset', 'UTF-8');
      result = setParameter(result, 'boundary', 'boundary123');
      result = update(result, 'type', 'application');

      expect(result).toStrictEqual({
        essence: 'application/html',
        type: 'application',
        subtype: 'html',
        subtypeTokens: { tree: null, name: 'html', suffix: null },
        parameters: new Map([
          ['charset', 'utf-8'],
          ['boundary', 'boundary123'],
        ]),
      });
      expect(serialize(result)).toBe(
        'application/html;charset=utf-8;boundary=boundary123',
      );
    });

    test('should handle complex MIME type operations', () => {
      const result = serialize(
        update(
          parse('TEXT/HTML; CHARSET=UTF-8; boundary=----WebKit'),
          'subtype',
          'xml',
        ),
      );

      expect(result).toBe('text/xml;charset=utf-8;boundary=----WebKit');
    });
  });

  describe('Edge Cases', () => {
    test('should handle MIME type with special characters in parameter values', () => {
      const result = setParameter('text/html', 'filename', 'file (1).txt');
      expect(result).toBe('text/html;filename="file (1).txt"');
    });

    test('should handle repeated calls to create on same record', () => {
      const first = parse('text/html');
      const second = parse(first);
      const third = parse(second);

      expect(first).toBe(second);
      expect(second).toBe(third);
    });

    test('should handle updating to same value', () => {
      const original = parse('text/html; charset=utf-8');
      const result = update(original, 'type', 'text');
      expect(result.type).toBe('text');
    });
  });
});
