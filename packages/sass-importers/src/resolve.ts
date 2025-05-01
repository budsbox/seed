import { ResolverFactory, CachedInputFileSystem } from 'enhanced-resolve';
import { env } from 'node:process';
import fs from 'node:fs';
import { isNotNil, isString } from '@budsbox/iso-utils/type-guards';

const isYarnPnp = 'PROJECT_CWD' in env;

const options: Parameters<(typeof ResolverFactory)['createResolver']>[0] = {
  fileSystem: new CachedInputFileSystem(fs, 4000),
  enforceExtension: true,
  modules: isYarnPnp ? [] : ['node_modules'],
};

const sassResolver = ResolverFactory.createResolver({
  ...options,
  extensions: ['.scss', '.sass'],
  conditionNames: ['sass', 'style', 'default'],
  mainFields: ['sass', 'style'],
  mainFiles: ['index', '_index'],
});

export async function resolveSass(
  from: string,
  to: string,
): Promise<string | null> {
  return new Promise((resolve, reject) => {
    sassResolver.resolve({}, from, to, {}, (err, result) => {
      if (isNotNil(err)) return void reject(err);

      resolve(isString(result) ? result : null);
    });
  });
}
