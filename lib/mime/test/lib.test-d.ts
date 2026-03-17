import { expectTypeOf, describe, test } from 'vitest';
import type { MimeTypeRecord, OutputType } from '#types';

describe('OutputType', () => {
  describe('string inputs', () => {
    test('is string when input is generic string', () => {
      expectTypeOf<OutputType<string>>().toEqualTypeOf<string>();
    });

    test('is string when input is a literal MIME type', () => {
      expectTypeOf<OutputType<'text/plain'>>().toEqualTypeOf<string>();
    });
  });

  describe('string container inputs (MimeTypeStringContainer)', () => {
    test('is string by default', () => {
      expectTypeOf<OutputType<{ mimeType: string }>>().toEqualTypeOf<string>();
    });

    test('is string when serialize is true', () => {
      expectTypeOf<
        OutputType<{ mimeType: string; serialize: true }>
      >().toEqualTypeOf<string>();
    });

    test('is MimeTypeRecord when serialize is false', () => {
      expectTypeOf<
        OutputType<{ mimeType: string; serialize: false }>
      >().toEqualTypeOf<MimeTypeRecord<'keep-first'>>();
    });

    test('honors multiParameter option when serialize is false', () => {
      expectTypeOf<
        OutputType<{
          mimeType: string;
          serialize: false;
          multiParameter: 'list';
        }>
      >().toEqualTypeOf<MimeTypeRecord<'list'>>();
    });
  });

  describe('serializable object inputs (MimeTypeSerializableInput)', () => {
    test('is MimeTypeRecord by default', () => {
      expectTypeOf<
        OutputType<{ type: string; subtype: string }>
      >().toEqualTypeOf<MimeTypeRecord<'keep-first'>>();
    });

    test('is string when serialize is true', () => {
      expectTypeOf<
        OutputType<{ type: string; subtype: string; serialize: true }>
      >().toEqualTypeOf<string>();
    });

    test('is MimeTypeRecord when serialize is false', () => {
      expectTypeOf<
        OutputType<{ type: string; subtype: string; serialize: false }>
      >().toEqualTypeOf<MimeTypeRecord<'keep-first'>>();
    });

    test('honors multiParameter option', () => {
      expectTypeOf<
        OutputType<{
          type: string;
          subtype: string;
          multiParameter: 'keep-last';
        }>
      >().toEqualTypeOf<MimeTypeRecord<'keep-last'>>();
    });
  });
});
