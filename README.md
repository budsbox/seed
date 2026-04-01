# @budsbox

This is [my](https://github.com/trikadin) open-source monorepo for front-end, Node.js, and other JavaScript environments, where I develop various useful and interesting things.

- **Main language**: [TypeScript](https://www.typescriptlang.org/);
- **Package manager**: [yarn](https://yarnpkg.com/);
- **Preferred UI framework**: [React](https://react.dev/).

## Project Structure

This is a monorepo managed with Yarn workspaces. The main workspaces include:

- `builder`: Tools for building libraries and updating TypeScript references. Quite a mess tbh :)
- `constraints`: Yarn constraints for enforcing repository rules
- `lib/*`: Core library packages
- `lint/*`: Linting configurations and presets
- `tsconfigs`: Centralized TypeScript configurations
- `ui/*`: UI components, hooks, and other UI-related packages

### Dependency Management

The Budsbox repository uses Yarn v4.x with [Plug'n'Play (PnP)](https://yarnpkg.com/features/pnp) mode as the primary package manager. Yarn workspaces organise multiple packages within a single repository, enabling shared dependencies, local package linking during development, and centralised version management through a single `yarn.lock` file. The PnP approach eliminates traditional `node_modules` directories, providing faster installation times, guaranteed dependency resolution, and strict dependency checking.

Constraints are implemented to automatically enforce dependency management rules across the monorepo. These constraints ensure consistent version ranges, proper peer dependency handling, and prevent common dependency conflicts.

- **Automatic dependency version synchronization** across workspaces prevents version conflicts through Yarn constraints
- **Fast dependency resolution** through Yarn PnP mode that eliminates node_modules for better performance
- **Centralized version management** with root workspace serving as source of truth for common dependencies
- **Seamless workspace interdependencies** using "workspace:^" syntax for local package linking
- **Consistent peer dependency handling** ensures proper mirroring as dev dependencies and prevents conflicts
- **Third-party dependency patching** allows custom fixes without waiting for upstream updates
- **Private package protection** prevents inappropriate peer dependency declarations in private packages
- **Streamlined dependency management** with custom scripts that automate common operations and apply scope prefixing.

### `tsconfig.json`s

This project uses a centralized, tiered TypeScript configuration system managed from the `./tsconfigs` workspace. Base configurations leverage `${configDir}` for portability, with platform-specific (Node.js, Browser, Isomorphic) and purpose-specific (Lib, App, Test) configs extending a core `tsconfig.base.json`.

Individual packages employ a "solution-style" `tsconfig.json` that delegates compilation to environment-specific references like `tsconfig.lib.json`, `tsconfig.test.json`, and `tsconfig.tools.json`. These project references are automatically synchronized via the `yarn relink` script, ensuring the build graph remains consistent with the workspace structure without manual intervention.

## Workspace

A typical workspace (aka package) split into subdirectories:

- `./*` — for all sorts of configuration files, like `tsconfig.json`, `eslint.config.json`, `vite.config.js`, etc.
- `./src` — for sources
- `./dist` — for all the output of any build processes
- `./test` — for tests
- `.ignored` — for all the workspace-related files to avoid checkout into git

## Contributing

See [CONTRIBUTING.md](./CONTRIBUTING.md).

## Additional Development Information

### Code Style and Linting

1. **ESLint Configuration**
    - The project uses ESLint with a custom flat configuration
    - ESLint configurations are in the `lint/eslint` workspace
    - Different presets are available for different types of packages and tasks (`lib`, `node-lib`, `tools`)
    - Some lints are automatically applied via [lint-staged](https://github.com/lint-staged/lint-staged) on commit.

2. **Formatting**
    - Prettier is used for code formatting
    - Run `yarn format` to format all files in a workspace
    - Format is automatically applied via [lint-staged](https://github.com/lint-staged/lint-staged) on commit

3. **TypeScript Configuration**
    - See [`tsconfig.json`s](#tsconfigjsons) section above for details on the tiered configuration system and automated reference management.

### Yarn Workspace Shorthand Commands

The project provides several helper scripts for working with workspaces:

- `yarn p:wsa`: Add a local dependency to the current workspace, e.g. `yarn p:wsa lib-es` equals to `yarn add @budsbox/lib-es`
- `yarn p:wsad`: Add a dev dependency to the current workspace
- `yarn p:wsr`: Remove a dependency from the current workspace

### Constraints

The project uses [Yarn constraints](https://yarnpkg.com/features/constraints) to enforce repository rules:

- Run `yarn c` shorthand to check constraints
- Run `yarn cf` to fix constraint violations

### Pre-commit Hooks

The project uses Husky and lint-staged for pre-commit hooks:

- ESLint runs on staged files
- Prettier formats staged files
- Package.json files are sorted
- Yarn constraints are checked

### See also

Some principles I follow while developing this project:

- [Zen of Python](https://peps.python.org/pep-0020/#the-zen-of-python)
- [SSOT](https://en.wikipedia.org/wiki/Single_source_of_truth)

## License

[MIT](./LICENSE)
