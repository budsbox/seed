# Budsbox Development Guidelines

This document provides essential information for developers working on the Budsbox project.

## Build/Configuration Instructions

### Environment Setup

1. **Node.js Version Management**
    - The project uses [nvm](https://github.com/nvm-sh/nvm) for Node.js version management
    - Run `nvm use` to switch to the correct Node.js version defined in `.nvmrc`

2. **Package Management**
    - The project uses Yarn v4.x as the package manager
    - Run `corepack enable` to make `yarn` available
    - Run `yarn` to install dependencies

### Dependency Management in Budsbox Repository

The Budsbox repository uses Yarn v4.x with Plug'n'Play (PnP) mode as the primary package manager for this monorepo structure. Yarn workspaces organise multiple packages within a single repository, enabling shared dependencies, local package linking during development, and centralised version management through a single yarn.lock file. The PnP approach eliminates traditional node_modules directories, providing faster installation times, guaranteed dependency resolution, and strict dependency checking.

Constraints are implemented to automatically enforce dependency management rules across the monorepo. These constraints ensure consistent version ranges, proper peer dependency handling, and prevent common dependency conflicts.

- **Automatic dependency version synchronization** across workspaces prevents version conflicts through Yarn constraints
- **Fast dependency resolution** through Yarn PnP mode that eliminates node_modules for better performance
- **Centralized version management** with root workspace serving as source of truth for common dependencies
- **Seamless workspace interdependencies** using "workspace:^" syntax for local package linking
- **Consistent peer dependency handling** ensures proper mirroring as dev dependencies and prevents conflicts
- **Third-party dependency patching** allows custom fixes without waiting for upstream updates
- **Private package protection** prevents inappropriate peer dependency declarations in private packages
- **Automated TypeScript reference updates** through `yarn relink` script after workspace changes
- **Streamlined dependency management** with custom scripts that automate common operations and apply scope prefixing

### Project Structure

This is a monorepo managed with Yarn workspaces. The main workspaces include:

- `builder`: Tools for building libraries and updating TypeScript references
- `constraints`: Yarn constraints for enforcing repository rules
- `lib/*`: Core library packages
- `lint/*`: Linting configurations and presets
- `packages/*`: Various utility packages and components
- `ui/*`: UI components, hooks, and other UI-related packages

### Deprecated Workspaces

DO NOT use and/or add them as dependency when creating any new workspace.

- `@budsbox/build` — superseded by `@budsbox/builder` (in progress)
- `@budsbox/linting` — superseded by `@budsbox/eslint` and it's plugins
- `@budsbox/iso-utils` — superseded by `@budsbox/lib-es`
- `@budsbox/node-utils` — superseded by `@budsbox/lib-node`

### Building the Project

1. **TypeScript Builds**
    - For TypeScript packages: `yarn p:ts:build`
    - For watching changes: `yarn p:ts:watch`

2. **SCSS Types Generation**
    - Run `yarn scss-types` to generate TypeScript types for SCSS files
    - Run `yarn watch-scss-types` to automatically regenerate types on changes

3. **Updating TypeScript References**
    - After adding or removing packages, run `yarn relink` in the root directory to update TypeScript references

## Additional Development Information

### Code Style and Linting

1. **ESLint Configuration**
    - The project uses ESLint with a custom flat configuration
    - ESLint configurations are in the `lint/eslint` workspace
    - Different presets are available for different types of packages (lib, node-lib, tools)

2. **Formatting**
    - Prettier is used for code formatting
    - Run `yarn format` to format all files
    - Format is automatically applied via lint-staged on commit

3. **TypeScript Configuration**
    - TypeScript configurations are in the `tsconfigs` workspace
    - Different configurations are available for different types of packages

### Yarn Workspace Commands

The project provides several helper scripts for working with workspaces:

- `yarn ws <workspace> <command>`: Run a command in a specific workspace
- `yarn p:wsa`: Add a dependency to the current workspace
- `yarn p:wsad`: Add a dev dependency to the current workspace
- `yarn p:wsr`: Remove a dependency from the current workspace

### Constraints

The project uses Yarn constraints to enforce repository rules:

- Run `yarn c` to check constraints
- Run `yarn cf` to fix constraint violations

### Pre-commit Hooks

The project uses Husky and lint-staged for pre-commit hooks:

- ESLint runs on staged files
- Prettier formats staged files
- Package.json files are sorted
- Yarn constraints are checked
