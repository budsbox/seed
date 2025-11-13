import { create, removeParameter, serialize, setParameter, update } from '#lib';
import { describe, expect, test } from 'vitest';

describe.concurrent('MIME Type Library', () => {
  describe('create', () => {
    describe('positive cases', () => {
      test('should create MimeTypeRecord from string MIME type', () => {
        const result = create('text/html; charset=utf-8');
        expect(result).toStrictEqual({
          essence: 'text/html',
          type: 'text',
          subtype: 'html',
          subtypeTokens: { tree: null, name: 'html', suffix: null },
          parameters: new Map([['charset', 'utf-8']]),
        });
      });

      test('should create MimeTypeRecord from simple MIME type without parameters', () => {
        const result = create('application/json');
        expect(result).toStrictEqual({
          essence: 'application/json',
          type: 'application',
          subtype: 'json',
          subtypeTokens: { tree: null, name: 'json', suffix: null },
          parameters: new Map(),
        });
      });

      test('should return same MimeTypeRecord if input is already a MimeTypeRecord', () => {
        const input = create('text/plain');
        const result = create(input);
        expect(result).toBe(input);
      });

      test('should handle MIME types with multiple parameters', () => {
        const result = create(
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
        const result = create('TEXT/HTML');
        expect(result).toStrictEqual({
          essence: 'text/html',
          type: 'text',
          subtype: 'html',
          subtypeTokens: { tree: null, name: 'html', suffix: null },
          parameters: new Map(),
        });
      });

      test('should handle MIME types with quoted parameter values', () => {
        const result = create('text/plain; name="file.txt"');
        expect(result.parameters.get('name')).toBe('file.txt');
      });

      test('should handle MIME types with quoted parameter values (with a quote in it)', () => {
        const result = create('text/plain; foo="bar \\" baz"');
        expect(result.parameters.get('foo')).toBe('bar " baz');
      });
    });

    describe('negative cases', () => {
      test('should throw SyntaxError for invalid MIME type string', () => {
        expect(() => create('invalid')).toThrow();
      });

      test('should throw SyntaxError for malformed MIME type', () => {
        expect(() => create('text/')).toThrow();
      });

      test('should throw SyntaxError for MIME type with invalid characters', () => {
        expect(() => create('text<html')).toThrow();
      });
    });
  });

  describe('update', () => {
    describe('essence', () => {
      describe('positive cases', () => {
        test('should update essence of existing MIME type', () => {
          const original = create('text/html; charset=utf-8');
          const result = update(original, 'application/json');
          expect(result).toStrictEqual({
            essence: 'application/json',
            type: 'application',
            subtype: 'json',
            subtypeTokens: { tree: null, name: 'json', suffix: null },
            parameters: new Map([['charset', 'utf-8']]),
          });
        });

        test('should update essence from string input', () => {
          const result = update('text/html', 'application/xml');
          expect(result).toStrictEqual({
            essence: 'application/xml',
            type: 'application',
            subtype: 'xml',
            subtypeTokens: { tree: null, name: 'xml', suffix: null },
            parameters: new Map(),
          });
        });

        test('should preserve existing parameters when updating essence', () => {
          const original = create('text/html; charset=utf-8; boundary=abc123');
          const result = update(original, 'image/png');
          expect(result.parameters.get('charset')).toBe('utf-8');
          expect(result.parameters.get('boundary')).toBe('abc123');
        });
      });

      describe('negative cases', () => {
        test('should throw SyntaxError for invalid essence', () => {
          expect(() => update('text/html', 'invalid')).toThrow(
            'Failed to parse essence',
          );
        });

        test('should throw SyntaxError for empty type in essence', () => {
          expect(() => update('text/html', '/json')).toThrow(
            'Failed to parse essence',
          );
        });

        test('should throw SyntaxError for empty subtype in essence', () => {
          expect(() => update('text/html', 'application/')).toThrow(
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
          expect(result.parameters.get('charset')).toBe('utf-8');
          expect(result.parameters.get('boundary')).toBe('abc');
        });

        test('should update parameters from Map', () => {
          const params = new Map([['charset', 'utf-8']]);
          const result = update(create('text/html'), 'parameters', params);
          expect(result.parameters.get('charset')).toBe('utf-8');
        });

        test('should update parameters from array of entries', () => {
          const original = create('text/html');
          const params = [
            ['charset', 'utf-8'],
            ['boundary', '123'],
          ] as const;
          const result = update(original, 'parameters', params);
          expect(result.parameters).toStrictEqual(new Map(params));
        });

        test('should replace existing parameters', () => {
          const original = create('text/html; charset=iso-8859-1');
          const result = update(original, 'parameters', 'charset=utf-8');
          expect(result.parameters.get('charset')).toBe('utf-8');
        });

        test('should handle empty parameter string', () => {
          const original = create('text/html; charset=utf-8');
          const result = update(original, 'parameters', '');
          expect(result.parameters.size).toBe(0);
        });
      });

      describe('negative cases', () => {
        test('should throw SyntaxError for invalid parameter string', () => {
          expect(() =>
            update('text/html', 'parameters', 'invalid@@@'),
          ).toThrow();
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
          const original = create('text/html');
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
          expect(result).toStrictEqual({
            essence: 'image/html',
            type: 'image',
            subtype: 'html',
            subtypeTokens: { tree: null, name: 'html', suffix: null },
            parameters: new Map([['charset', 'utf-8']]),
          });
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
          const original = create('text/html');
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
          const original = create('text/html; charset=utf-8');
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
            'application/json',
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

  describe('removeParameter', () => {
    describe('positive cases', () => {
      test('should remove existing parameter', () => {
        const original = create('text/html; charset=utf-8; boundary=abc');
        const result = removeParameter(original, 'charset');
        expect(result.parameters).toStrictEqual(new Map([['boundary', 'abc']]));
      });

      test('should return same record when removing non-existent parameter', () => {
        const original = create('text/html; charset=utf-8');
        const result = removeParameter(original, 'nonexistent');
        expect(result).toBe(original);
      });

      test('should remove parameter from string input', () => {
        const result = removeParameter(
          'text/html; charset=utf-8; boundary=abc',
          'charset',
        );
        expect(result.parameters.has('charset')).toBe(false);
        expect(result.parameters.get('boundary')).toBe('abc');
      });

      test('should handle case-insensitive parameter removal', () => {
        const original = create('text/html; CHARSET=utf-8');
        const result = removeParameter(original, 'charset');
        expect(result.parameters.has('charset')).toBe(false);
      });

      test('should remove parameter from MIME type with single parameter', () => {
        const original = create('text/html; charset=utf-8');
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

  describe('setParameter', () => {
    describe('set new parameter', () => {
      test('should set new string parameter', () => {
        const original = create('text/html');
        const result = setParameter(original, 'charset', 'utf-8');
        expect(result.parameters).toStrictEqual(
          new Map([['charset', 'utf-8']]),
        );
      });

      test('should set numeric parameter as string', () => {
        const original = create('text/html');
        const result = setParameter(original, 'quality', 0.8);
        expect(result.parameters.get('quality')).toBe('0.8');
      });

      test('should set parameter on string input', () => {
        const result = setParameter('text/html', 'charset', 'utf-8');
        expect(result.parameters.get('charset')).toBe('utf-8');
      });

      test('should set parameter without removing existing parameters', () => {
        const original = create('text/html; boundary=abc');
        const result = setParameter(original, 'charset', 'utf-8');
        expect(result).toStrictEqual({
          essence: 'text/html',
          type: 'text',
          subtype: 'html',
          subtypeTokens: { tree: null, name: 'html', suffix: null },
          parameters: new Map([
            ['charset', 'utf-8'],
            ['boundary', 'abc'],
          ]),
        });
      });
    });

    describe('update existing parameter', () => {
      test('should update existing parameter value', () => {
        const original = create('text/html; charset=iso-8859-1');
        const result = setParameter(original, 'charset', 'utf-8');
        expect(result.parameters.get('charset')).toBe('utf-8');
      });

      test('should preserve other parameters when updating', () => {
        const original = create('text/html; charset=iso-8859-1; boundary=abc');
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
        const original = create('text/html; charset=utf-8');
        const result = setParameter(original, 'charset', null);
        expect(result.parameters.has('charset')).toBe(false);
      });

      test('should remove parameter when value is undefined', () => {
        const original = create('text/html; charset=utf-8');
        const result = setParameter(original, 'charset', undefined);
        expect(result.parameters.has('charset')).toBe(false);
      });

      test('should remove parameter when value is empty string', () => {
        const original = create('text/html; charset=utf-8');
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

  describe('serialize', () => {
    describe('positive cases', () => {
      test('should serialize MimeTypeRecord without parameters', () => {
        const record = create('text/html');
        const result = serialize(record);
        expect(result).toBe('text/html');
      });

      test('should serialize MimeTypeRecord with single parameter', () => {
        const record = create('text/html; charset=utf-8');
        const result = serialize(record);
        expect(result).toBe('text/html;charset=utf-8');
      });

      test('should serialize MimeTypeRecord with multiple parameters', () => {
        const record = create('text/html; charset=utf-8; boundary=abc123');
        const result = serialize(record);
        expect(result).toBe('text/html;charset=utf-8;boundary=abc123');
      });

      test('should serialize multipart/form-data with boundary', () => {
        const record = create('multipart/form-data; boundary=----WebKit');
        const result = serialize(record);
        expect(result).toBe('multipart/form-data;boundary=----WebKit');
      });

      test('should serialize MIME type with quoted parameter value', () => {
        const record = create(
          'text/plain; filename="my \\"quoted\\" file.txt"',
        );
        const result = serialize(record);
        expect(result).toBe('text/plain;filename="my \\"quoted\\" file.txt"');
      });

      test('should serialize MIME type with subtype tree and suffix', () => {
        const record = create('application/vnd.example+xml');
        const result = serialize(record);
        expect(result).toBe('application/vnd.example+xml');
      });

      test('should normalize MIME type (lowercase)', () => {
        const record = create('TEXT/HTML; CHARSET=UTF-8');
        const result = serialize(record);
        expect(result).toBe('text/html;charset=utf-8');
      });
    });

    describe('negative cases', () => {
      test('should throw error for invalid MIME type string', () => {
        expect(() => serialize('invalid')).toThrow();
      });

      test('should throw error for malformed MIME type', () => {
        expect(() => serialize('text/')).toThrow();
      });
    });
  });

  describe('Integration Tests', () => {
    test('should chain multiple operations', () => {
      let result = create('text/html');
      result = setParameter(result, 'charset', 'utf-8');
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
    });

    test('should handle complex MIME type normalization', () => {
      const result = serialize(
        update(
          create('TEXT/HTML; CHARSET=UTF-8; boundary=----WebKit'),
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
      expect(result.parameters.get('filename')).toBe('file (1).txt');
    });

    test('should handle repeated calls to create on same record', () => {
      const first = create('text/html');
      const second = create(first);
      const third = create(second);

      expect(first).toBe(second);
      expect(second).toBe(third);
    });

    test('should handle parameter with numeric value 0', () => {
      const result = setParameter('text/html', 'quality', 0);
      expect(result.parameters.get('quality')).toBe('0');
    });

    test('should handle updating to same value', () => {
      const original = create('text/html; charset=utf-8');
      const result = update(original, 'type', 'text');
      expect(result.type).toBe('text');
    });
  });
});
