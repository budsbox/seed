export function createImporter(): (
  url: string,
  prev: string,
) => {
  file: string;
  contents: string;
};
