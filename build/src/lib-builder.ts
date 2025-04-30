import {
  basename,
  dirname,
  extname,
  resolve as resolvePath,
  join,
} from 'node:path';
import { convertTsConfig } from 'tsconfig-to-swcconfig';

import { isNil } from '@budsbox/iso-utils/type-guards';
import { lookupFile } from '@budsbox/node-utils/fs';
import { getTsConfig } from '@budsbox/node-utils/tsconfig';
import { writeFile } from 'node:fs/promises';
import { execa } from 'execa';

// import { buildTypescript } from './typescript.js';

export type TargetModule = 'esm' | 'commonjs' | 'dual';

export interface BuildOptions {
  readonly tsconfigFile: string | undefined;
  readonly initDir: string;
  readonly noEmitDeclarations?: boolean;
  readonly buildsMap?: Map<string, Promise<void>>;
  readonly targetModule: TargetModule;
}

const moduleMap = {
  esm: ['esm'],
  commonjs: ['commonjs'],
  dual: ['esm', 'commonjs'],
} as const satisfies Record<TargetModule, TargetModule[]>;

export async function build({
  initDir,
  tsconfigFile = 'tsconfig.json',
  // noEmitDeclarations = false,
  buildsMap = new Map(),
  targetModule,
}: BuildOptions): Promise<void> {
  const packageJsonPath = await lookupFile({
    startDir: initDir,
    filename: 'package.json',
  });

  if (packageJsonPath == null) {
    throw new Error('Failed to find package.json');
  }

  const packageDir = dirname(packageJsonPath);

  const tsconfigPath = await lookupFile({
    startDir: initDir,
    filename: tsconfigFile,
    stopDir: packageDir,
  });

  if (isNil(tsconfigPath)) {
    throw new Error(`Failed to find tsconfig file "${tsconfigFile}"`);
  }

  if (buildsMap.has(tsconfigPath)) {
    return buildsMap.get(tsconfigPath);
  }

  const buildDeferred = createDeferred();

  buildsMap.set(tsconfigPath, buildDeferred.promise);

  try {
    const tsconfigDir = dirname(tsconfigPath);

    const builds: Array<Promise<void>> = [];

    const parsedTsConfig = await getTsConfig(tsconfigPath);

    console.log('tsconfig path', tsconfigPath);
    console.log('tsconfig', parsedTsConfig);
    console.dir(convertTsConfig(parsedTsConfig.compilerOptions ?? {}), {
      depth: 5,
    });
    console.log(targetModule);
    const { references = [] } = parsedTsConfig;

    if (references.length > 0) {
      builds.push(
        ...references.map(({ path }) => {
          const ext = extname(path);
          const dir = ext !== '' ? dirname(path) : path;
          const filename = ext === '.json' ? basename(path) : undefined;
          return build({
            initDir: resolvePath(tsconfigDir, dir),
            tsconfigFile: filename,
            noEmitDeclarations: true,
            buildsMap,
            targetModule,
          });
        }),
      );
    }

    await Promise.all(builds);

    await writeFile(
      join(tsconfigDir, '.swcrc'),
      JSON.stringify(
        convertTsConfig(parsedTsConfig.compilerOptions ?? {}),

        null,
        2,
      ),
    );

    await execa({ stdio: 'inherit', cwd: tsconfigDir })`yarn p:swc --files `;
  } catch (e) {
    buildDeferred.reject(e);
    throw e;
  }
}

function createDeferred<T = void>(): {
  promise: Promise<T>;
  resolve: (value: T) => void;
  reject: (reason: unknown) => void;
} {
  let resolve: (value: T) => void, reject: (reason: unknown) => void;

  const promise = new Promise<T>((res, rej) => {
    resolve = res;
    reject = rej;
  });

  // @ts-expect-error TS2454 — new Promise(executor) calls an executor immediately but TS doesn't know
  return { promise, resolve, reject };
}
