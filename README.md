# Budsbox

Это [мой](https://github.com/trikadin) личный open source монорепозиторий для front-end, NodeJS и других JavaScript environments, в котором я разрабатываю всякие полезные и интересные мне штуки.

-   **Основной язык**: TypeScript,
-   **Пакетный менеджер**: [yarn](https://yarnpkg.com/);
-   **Предпочитаемый UI фреймворк**: [React](https://react.dev/).

### Project Structure

This is a monorepo managed with Yarn workspaces. The main workspaces include:

-   `builder`: Tools for building libraries and updating TypeScript references
-   `constraints`: Yarn constraints for enforcing repository rules
-   `lib/*`: Core library packages
-   `lint/*`: Linting configurations and presets
-   `ui/*`: UI components, hooks, and other UI-related packages

### Dependency Management in Budsbox Repository

The Budsbox repository uses Yarn v4.x with [Plug'n'Play (PnP)](https://yarnpkg.com/features/pnp) mode as the primary package manager for this monorepo structure. Yarn workspaces organise multiple packages within a single repository, enabling shared dependencies, local package linking during development, and centralised version management through a single `yarn.lock` file. The PnP approach eliminates traditional `node_modules` directories, providing faster installation times, guaranteed dependency resolution, and strict dependency checking.

Constraints are implemented to automatically enforce dependency management rules across the monorepo. These constraints ensure consistent version ranges, proper peer dependency handling, and prevent common dependency conflicts.

-   **Automatic dependency version synchronization** across workspaces prevents version conflicts through Yarn constraints
-   **Fast dependency resolution** through Yarn PnP mode that eliminates node_modules for better performance
-   **Centralized version management** with root workspace serving as source of truth for common dependencies
-   **Seamless workspace interdependencies** using "workspace:^" syntax for local package linking
-   **Consistent peer dependency handling** ensures proper mirroring as dev dependencies and prevents conflicts
-   **Third-party dependency patching** allows custom fixes without waiting for upstream updates
-   **Private package protection** prevents inappropriate peer dependency declarations in private packages
-   **Automated TypeScript reference updates** through `yarn relink` script after workspace changes
-   **Streamlined dependency management** with custom scripts that automate common operations and apply scope prefixing.

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
    - TypeScript configurations are in the `tsconfigs` workspace
    - Different configurations are available for different types of packages and tasks.

### Yarn Workspace Shorthand Commands

The project provides several helper scripts for working with workspaces:

-   `yarn p:wsa`: Add a local dependency to the current workspace, e.g. `yarn p:wsa lib-es` equals to `yarn add @budsbox/lib-es`
-   `yarn p:wsad`: Add a dev dependency to the current workspace
-   `yarn p:wsr`: Remove a dependency from the current workspace

### Constraints

The project uses [Yarn constraints](https://yarnpkg.com/features/constraints) to enforce repository rules:

-   Run `yarn c` shorthand to check constraints
-   Run `yarn cf` to fix constraint violations

### Pre-commit Hooks

The project uses Husky and lint-staged for pre-commit hooks:

-   ESLint runs on staged files
-   Prettier formats staged files
-   Package.json files are sorted
-   Yarn constraints are checked

### See also

Некоторые принципы, которыми я руководствуюсь при развитии этого проекта:

-   [Zen of Python](https://peps.python.org/pep-0020/#the-zen-of-python)
-   [SSOT](https://en.wikipedia.org/wiki/Single_source_of_truth)

## License

[MIT](./LICENSE)
