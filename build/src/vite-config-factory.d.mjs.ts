import type { ConfigEnv, UserConfig } from 'vite';

export interface ViteConfigFactoryOptions {
  readonly projectName: string;
  readonly viteEnv: Readonly<ConfigEnv>;
}

export type ViteConfigFactory = (
  options: ViteConfigFactoryOptions,
) => UserConfig;

export const createViteConfig: ViteConfigFactory;
