// import type { PackageJson, TsConfigJson } from 'type-fest';
//
// import { readFile, glob } from 'node:fs/promises';
// import { dirname, basename } from 'node:path';
//
// import { isNil } from '@budsbox/iso-utils/type-guards';
// import { lookupFile } from '@budsbox/node-utils/fs';
// import { getTsConfig } from '@budsbox/node-utils/tsconfig';
//
// export interface ConfigRecord<T> {
//   readonly path: string;
//   readonly dir: string;
//   readonly filename: string;
//   readonly config: T;
// }
//
// export const lookupConfigs = async ({
//   initDir,
// }: {
//   readonly initDir: string;
//   readonly tsconfigFilename: string;
// }): Promise<{
//   packageJson: ConfigRecord<PackageJson>
//   tsconfigs: ConfigRecord<TsConfigJson>[]
// }> => {
//   const packageJsonPath = await lookupFile({
//     startDir: initDir,
//     filename: 'package.json',
//   });
//
//   if (packageJsonPath == null) {
//     throw new Error('Failed to find package.json');
//   }
//
//   const packageJson = JSON.parse(
//     await readFile(packageJsonPath, 'utf8'),
//   ) as PackageJson;
//
//   const packageDir = dirname(packageJsonPath);
//
//   const tsconfigPromises = [];
//
//   for await (const path of glob('./tsconfig.*.json', {cwd: packageDir})) {
//     tsconfigPromises.push((async()=> ({
//       path,
//       dir: dirname(path),
//       filename: basename(path),
//       config: await getTsConfig(path),
//     }))());
//   }
//
//   const tsconfigs = await Promise.all(tsconfigPromises);
//
//   return {
//     packageJson: {
//       path: packageJsonPath,
//       dir: packageDir,
//       name: basename(packageJsonPath),
//       config: packageJson
//     },
//     tsconfigs
//   };
// };
