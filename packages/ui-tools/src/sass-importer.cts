import {
  type Importer,
  createJsonImporter,
  createVirtualImporter,
  joinImporters,
} from '@budsbox/sass-importers';

export { Importer };

export interface ImporterOptions {
  readonly colorsConfigPath: string;
}

/**
 * Creates an importer that allows to use ui-tools in SASS
 * @param options options for importer
 * @param options.colorsConfigPath path to JSON config for colors
 * @returns importer
 */
export function createImporter(options: ImporterOptions): Importer {
  const schema = 'budsbox:';
  const jsonImporter = createJsonImporter();
  const prefix = (name: string): string => `ui-tools/configs/${name}-config`;
  const pathMap = new Map<string, keyof ImporterOptions>([
    [prefix('colors'), 'colorsConfigPath'],
  ]);
  return joinImporters(
    ...[...pathMap].map(([url, optionsKey]) =>
      createVirtualImporter(
        url,
        (_, prev) => jsonImporter(options[optionsKey], prev),
        schema,
      ),
    ),
  );
}
