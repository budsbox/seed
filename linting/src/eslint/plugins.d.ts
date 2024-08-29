declare module '@eslint/js' {
  import type { ESLint, Linter } from 'eslint';

  const plugin: ESLint.Plugin & {
    configs: Record<'recommended', Linter.FlatConfig>;
  };
  export default plugin;
}

declare module 'eslint-plugin-react' {
  import type { ESLint, Linter } from 'eslint';

  const plugin: ESLint.Plugin & {
    configs: Record<'recommended' | 'jsx-runtime', Linter.FlatConfig>;
  };
  export default plugin;
}

declare module 'eslint-plugin-react-hooks' {
  import type { ESLint, Linter } from 'eslint';

  const plugin: ESLint.Plugin & {
    configs: Record<'recommended', Linter.FlatConfig>;
  };
  export default plugin;
}

declare module 'eslint-plugin-react-refresh' {
  import type { ESLint } from 'eslint';

  const plugin: ESLint.Plugin;
  export default plugin;
}

declare module 'eslint-config-prettier' {
  import type { Linter } from 'eslint';

  const _default: { rules: Linter.RulesRecord };
  export default _default;
}
