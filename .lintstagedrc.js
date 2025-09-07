import { getSupportInfo } from 'prettier';

import { dedupe, diff } from '@budsbox/lib-es/array';
import { serializePackageName as serializePackageName } from '@budsbox/lib-es/string';
import { globFromExtensions, queryJsExtensions } from '@budsbox/lib-extensions';
import { getWorkspaceByFilepath } from '@budsbox/lib-yarn';

const prettierCmd = 'prettier --write';

const jsExtensions = queryJsExtensions({ jsx: true });
const prettierExts = diff(
  dedupe(
    (await getSupportInfo()).languages.flatMap(
      ({ extensions }) => extensions ?? [],
    ),
  ).map((ext) => ext.replace('.', '')), // remove a leading dot
  jsExtensions,
  ['json'],
);

export default {
  'package.json': [
    () => 'yarn install --immutable --immutable-cache',
    'sort-package-json',
    prettierCmd,
  ],

  [globFromExtensions(jsExtensions)]: [
    /**
     *
     * @param {readonly string[]} filenames
     * @return {string}
     */
    (filenames) => {
      const wsGlob = dedupe(filenames.map(getWorkspaceByFilepath))
        .map((ws) => serializePackageName(ws.manifest.name, true))
        .filter(({ length }) => length > 0)
        .join(',');
      const wsForeachPrefix = `yarn workspaces foreach --recursive --topological --parallel --include '{${wsGlob}}'`;

      return `${wsForeachPrefix} run p:ts:build`;
    },
    'yarn p:eslint:staged',
    prettierCmd,
  ],

  [`{${globFromExtensions(prettierExts)},!(package).json}`]: prettierCmd,
};
