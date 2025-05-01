import type { CanonicalizeContext, Importer, PromiseOr } from 'sass';
import path from 'node:path';

export class JsonImporter implements Importer<'async'> {
  async canonicalize(
    url: string,
    context: CanonicalizeContext,
  ): Promise<URL | null> {}
}
