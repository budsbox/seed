import { execSync } from 'node:child_process';
import { EOL } from 'node:os';
import { join, relative } from 'node:path';
import { cwd } from 'node:process';

import { match, queryExtensions } from '@budsbox/linting/match';

import { getSupportInfo } from 'prettier';

const prettier = 'prettier --write';

const eslintedQuery = {
  lang: 'all',
  jsx: true,
};

const eslintedExts = queryExtensions(eslintedQuery);
const excludeFromDefaultPrettier = new Set([
  ...eslintedExts,
  'json', // because of package.json, see below
]);

const defaultPrettierExts = Array.from(
  new Set( // deduplicate
    (await getSupportInfo()).languages
      .flatMap(({ extensions }) => extensions ?? [])
      .map((ext) => ext.replace('.', '')), // remove leading dot
  ),
).filter((ext) => !excludeFromDefaultPrettier.has(ext));

const workspaces = execSync('yarn workspaces list --json')
  .toString()
  .split(EOL)
  .filter(Boolean)
  .map((json) => JSON.parse(json))
  .filter(({ location }) => location !== '.');

export default {
  'package.json': [
    () => 'yarn constraints',
    () => 'yarn install --immutable --immutable-cache',
    'sort-package-json',
    prettier,
  ],

  // eslint workspaces
  ...workspaces.reduce(
    (acc, { location, name }) => ({
      ...acc,
      [match({ ...eslintedQuery, dirs: [`${location}/**`] })[0]]: [
        (filenames) =>
          `yarn workspace ${name} p:eslint:staged ${filenames
            .map((filename) => relative(join(cwd(), location), filename))
            .join(' ')}`,
        prettier,
      ],
    }),
    {},
  ),

  // eslint root workspace
  ...match({
    ...eslintedQuery,
    dirs: [
      `./!(${workspaces.map(({ location }) => location).join('|')})/**`,
      '.',
    ],
  }).reduce(
    (acc, glob) => ({ [glob]: ['yarn p:eslint:staged', prettier] }),
    {},
  ),

  [`*.{${defaultPrettierExts.join()}},!(package).json`]: prettier,
};
