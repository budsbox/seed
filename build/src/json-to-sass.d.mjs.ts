type Importer = (
  url: string,
  prev: string,
) => {
  file: string;
  contents: string;
} | null;

export function createImporter(): Importer;

export function createVirtualImporter(name: string, data: object): Importer;
