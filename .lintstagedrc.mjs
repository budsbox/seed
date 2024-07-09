import { getSupportInfo } from 'prettier';

const prettier = 'prettier --write';
const eslintedExts = ['js', 'jsx', 'cjs', 'mjs', 'ts', 'tsx'];
const excludeFromDefaultPrettier = new Set([
  ...eslintedExts,
  'json', // because of package.json, see below
]);

const defaultPrettierExts = Array.from(
  new Set( // deduplicate
    (await getSupportInfo()).languages
      .flatMap(({ extensions }) => extensions)
      .map((ext) => ext.replace('.', '')), // remove leading dot
  ),
).filter((ext) => !excludeFromDefaultPrettier.has(ext));

export default {
  'package.json': [
    () => 'yarn constraints',
    () => 'yarn install --immutable --immutable-cache',
    'sort-package-json',
    prettier,
  ],
  [`*.{${eslintedExts.join()}}`]: [/*'eslint --quiet', */ prettier], // temporary disable eslint 'cause of problems
  [`*.{${defaultPrettierExts.join()}},!(package).json`]: prettier,
};
