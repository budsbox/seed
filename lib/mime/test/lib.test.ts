import { describe, expect, test } from 'vitest';
import {
  getParameter,
  normalize,
  normalizeInput,
  parse,
  removeParameter,
  serialize,
  setParameter,
  update,
} from '#lib';

import { ROMap } from '@budsbox/lib-es/map';

describe.concurrent('MIME type library', () => {
  describe.concurrent('parse', () => {
    test('should parse a basic MIME type string', () => {
      const result = parse('text/html');
      expect(result).toStrictEqual({
        type: 'text',
        subtype: 'html',
        essence: 'text/html',
        parameters: new ROMap(),
      });
    });

    test('should parse a MIME type with parameters', () => {
      const result = parse('application/json; charset=utf-8; q=0.8');
      expect(result).toStrictEqual({
        type: 'application',
        subtype: 'json',
        essence: 'application/json',
        parameters: new ROMap([
          ['charset', 'utf-8'],
          ['q', '0.8'],
        ]),
      });
    });

    test('should throw SyntaxError for invalid MIME type', () => {
      expect(() => parse('invalid')).toThrow(SyntaxError);
      expect(() => parse('text/')).toThrow(SyntaxError);
    });
  });

  describe.concurrent('update', () => {
    test('should update type and return a string when input is string', () => {
      const result = update('text/javascript', 'type', 'application');
      expect(result).toBe('application/javascript');
    });

    test('should update type and return a new MimeTypeRecord when input is object', () => {
      const result = update(
        { type: 'text', subtype: 'javascript' },
        'type',
        'application',
      );
      expect(result).toStrictEqual({
        type: 'application',
        subtype: 'javascript',
        essence: 'application/javascript',
        parameters: new ROMap(),
      });
    });

    test('should update type and return a string when serialize option is true', () => {
      const result = update(
        { type: 'text', subtype: 'javascript', serialize: true },
        'type',
        'application',
      );
      expect(result).toBe('application/javascript');
    });

    test('should update type and return a new MimeTypeRecord when serialize option is false', () => {
      const result = update(
        { mimeType: 'text/javascript', serialize: false },
        'type',
        'application',
      );
      expect(result).toStrictEqual({
        type: 'application',
        subtype: 'javascript',
        essence: 'application/javascript',
        parameters: new ROMap(),
      });
    });

    test('should update subtype and return a string when input is string', () => {
      const result = update('text/html', 'subtype', 'plain');
      expect(result).toBe('text/plain');
    });

    test('should update parameters via shorthand', () => {
      const result = update('application/json', { charset: 'utf-8' });
      expect(result).toBe('application/json;charset=utf-8');
    });

    test('should replace all parameters when updating "parameters" key', () => {
      const result = update('text/html; a=1; b=2', 'parameters', 'c=3');
      expect(result).toBe('text/html;c=3');
    });

    test('should update essence and reflect in type/subtype', () => {
      const result = update('image/png; foo=bar', 'essence', 'application/pdf');
      expect(result).toBe('application/pdf;foo=bar');
    });

    test('should handle empty parameters update', () => {
      const result = update('text/html; charset=utf-8', []);
      expect(result).toBe('text/html');
    });

    test('should throw when updating with invalid value', () => {
      expect(() => update('text/html', 'subtype', 'invalid/subtype')).toThrow(
        SyntaxError,
      );
    });
  });

  describe.concurrent('getParameter', () => {
    test('should retrieve an existing parameter', () => {
      expect(getParameter('text/html; charset=UTF-8', 'charset')).toBe('utf-8');
    });

    test('should return null for missing parameter by default', () => {
      expect(getParameter('text/html', 'charset')).toBe(null);
    });

    test('should throw RangeError if throwIfMissing is true', () => {
      expect(() => getParameter('text/html', 'charset', true)).toThrow(
        RangeError,
      );
    });

    test('should respect keepCharsetCase option', () => {
      const input = {
        mimeType: 'text/html; charset=UTF-8',
        keepCharsetCase: true,
      };
      expect(getParameter(input, 'charset')).toBe('UTF-8');
    });
  });

  describe.concurrent('setParameter', () => {
    test('should add a new parameter', () => {
      expect(setParameter('text/html', 'charset', 'utf-8')).toBe(
        'text/html;charset=utf-8',
      );
    });

    test('should update an existing parameter', () => {
      expect(
        setParameter('text/html; charset=iso-8859-1', 'charset', 'utf-8'),
      ).toBe('text/html;charset=utf-8');
    });

    test('should remove parameter if value is empty string or null', () => {
      expect(setParameter('text/html; charset=utf-8', 'charset', '')).toBe(
        'text/html',
      );
      expect(setParameter('text/html; charset=utf-8', 'charset', null)).toBe(
        'text/html',
      );
    });

    test('should lowercase charset value by default', () => {
      expect(setParameter('text/html', 'charset', 'UTF-8')).toBe(
        'text/html;charset=utf-8',
      );
    });
  });

  describe.concurrent('removeParameter', () => {
    test('should remove an existing parameter', () => {
      expect(removeParameter('text/html; charset=utf-8', 'charset')).toBe(
        'text/html',
      );
    });

    test('should return unchanged if parameter does not exist', () => {
      expect(removeParameter('text/html', 'charset')).toBe('text/html');
    });
  });

  describe.concurrent('serialize', () => {
    test('should return string as-is', () => {
      const input = 'text/html; charset=UTF-8';
      expect(serialize(input)).toBe(input);
    });

    test('should serialize a record-like object without parsing (e.g. no lowercasing and so on)', () => {
      const input = { type: 'text', subtype: 'HTML' };
      expect(serialize(input)).toBe('text/HTML');
    });
  });

  describe.concurrent('normalize', () => {
    test('should normalize case and spacing', () => {
      expect(normalize('Text/HTML ; Charset=UTF-8')).toBe(
        'text/html;charset=utf-8',
      );
    });

    test('should normalize object input', () => {
      expect(normalize({ type: 'IMAGE', subtype: 'PNG' })).toBe('image/png');
    });
  });

  describe.concurrent('normalizeInput', () => {
    test('should handle string input', () => {
      const input = 'text/html; charset=utf-8';
      const [record, options] = normalizeInput(input);

      expect(record).toStrictEqual({
        type: 'text',
        subtype: 'html',
        essence: 'text/html',
        // this is not read-only, because it wasn't processed by produceOutput
        parameters: new Map([['charset', 'utf-8']]),
      });
      expect(options).toStrictEqual({ keepCharsetCase: false });
    });

    test('should return a MimeTypeRecord instance as is', () => {
      const record = parse('image/png');
      const [resultRecord, options] = normalizeInput(record);

      expect(resultRecord).toBe(record);
      expect(options).toStrictEqual({ keepCharsetCase: false });
    });

    test('should handle object with mimeType string and options', () => {
      const input = {
        mimeType: 'TEXT/HTML; CHARSET=UTF-8',
        keepCharsetCase: true,
      };
      const [record, options] = normalizeInput(input);

      expect(record).toStrictEqual({
        type: 'text',
        subtype: 'html',
        essence: 'text/html',
        parameters: new Map([['charset', 'UTF-8']]),
      });
      expect(options).toStrictEqual({ keepCharsetCase: true });
    });

    test('should handle serializable record-like input', () => {
      const input = {
        type: 'application',
        subtype: 'json',
        parameters: new Map([['q', '0.8']]),
        keepCharsetCase: true,
      };
      const [record, options] = normalizeInput(input);

      expect(record).toStrictEqual({
        type: 'application',
        subtype: 'json',
        essence: 'application/json',
        parameters: new Map([['q', '0.8']]),
      });
      expect(options).toStrictEqual({ keepCharsetCase: true });
    });

    test('should prioritize mimeType over other fields', () => {
      const input = {
        mimeType: 'text/html; charset=utf-8',
        type: 'application',
        subtype: 'json',
        parameters: new Map([['q', '0.8']]),
      };
      const [record] = normalizeInput(input);

      expect(record).toStrictEqual({
        type: 'text',
        subtype: 'html',
        essence: 'text/html',
        parameters: new Map([['charset', 'utf-8']]),
      });
    });

    test('should throw SyntaxError if input is invalid', () => {
      const stringInput = 'invalid-mime-type';
      const objectInput = {
        type: 'invalid/',
        subtype: 'type',
      };

      expect(() => normalizeInput(stringInput)).toThrow(SyntaxError);
      expect(() => normalizeInput(objectInput)).toThrow(SyntaxError);
    });

    test('should apply default options when not provided in object input', () => {
      const input = { mimeType: 'text/plain' };
      const [, options] = normalizeInput(input);

      expect(options).toStrictEqual({ keepCharsetCase: false });
    });

    test('should handle nullish input gracefully (negative case)', () => {
      expect(() => normalizeInput(null as never)).toThrow(TypeError);
      expect(() => normalizeInput(undefined as never)).toThrow(
        'Expected input to be string or object, got undefined instead',
      );
      // @ts-expect-error testing runtime safety
      expect(() => normalizeInput()).toThrow(TypeError);
    });

    test('should throw when input is not string or object', () => {
      // @ts-expect-error testing runtime safety
      expect(() => normalizeInput(123)).toThrow(TypeError);
      expect(() => normalizeInput(true as never)).toThrow(
        'Expected input to be string or object, got boolean instead',
      );
    });

    test('should throw when mimeType is not a string', () => {
      const input = { mimeType: 123 as never };
      expect(() => normalizeInput(input)).toThrow(TypeError);
      expect(() => normalizeInput(input)).toThrow(
        'Expected input to have own property "type"',
      );
    });

    test('should throw when serialize is not boolean', () => {
      const input = { mimeType: 'text/plain', serialize: 'yes' as never };
      expect(() => normalizeInput(input)).toThrow(TypeError);
      expect(() => normalizeInput(input)).toThrow(
        'Expected input.serialize to be boolean, got string instead',
      );
    });

    test('should throw when type/subtype are missing or not strings', () => {
      const missingType = { subtype: 'plain' } as never;
      const badSubtype = { type: 'text', subtype: 123 as never };
      expect(() => normalizeInput(missingType)).toThrow(TypeError);
      expect(() => normalizeInput(missingType)).toThrow(
        'Expected input to have own property "type"',
      );
      expect(() => normalizeInput(badSubtype)).toThrow(TypeError);
      expect(() => normalizeInput(badSubtype)).toThrow(
        'Expected input.subtype to be string, got number instead',
      );
    });

    test('should throw when parameters are not object or iterable', () => {
      const input = {
        type: 'text',
        subtype: 'plain',
        parameters: 123 as never,
      };
      expect(() => normalizeInput(input)).toThrow(TypeError);
      expect(() => normalizeInput(input)).toThrow(
        'Expected source.parameters to be object or to be iterable, got number (123) instead',
      );
    });
  });
});
