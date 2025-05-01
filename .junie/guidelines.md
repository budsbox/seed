# Budsbox Development Guidelines

This document provides essential information for developers working on the Budsbox project.

## Build/Configuration Instructions

### Environment Setup

1. **Node.js Version Management**
   - The project uses [nvm](https://github.com/nvm-sh/nvm) for Node.js version management
   - Run `nvm use` to switch to the correct Node.js version defined in `.nvmrc`

2. **Package Management**
   - The project uses Yarn v4.8.1 as the package manager
   - Run `yarn` to install dependencies

### Project Structure

This is a monorepo managed with Yarn workspaces. The main workspaces include:

- `build`: Build utilities and configurations
- `builder`: Tools for building libraries and updating TypeScript references
- `constraints`: Yarn constraints for enforcing repository rules
- `lib/*`: Core library packages
- `lint/*`: Linting configurations and presets
- `packages/*`: Various utility packages and components

### Building the Project

1. **Building Libraries**
   - Use the `budsbox-build-lib` command to build libraries
   - Example: `cd packages/my-package && yarn p:lib:build`

2. **TypeScript Builds**
   - For TypeScript packages: `yarn p:ts:build`
   - For dual ESM/CommonJS output: `yarn p:ts:prepack:dual`
   - For watching changes: `yarn p:ts:watch`

3. **SCSS Types Generation**
   - Run `yarn scss-types` to generate TypeScript types for SCSS files
   - Run `yarn watch-scss-types` to automatically regenerate types on changes

4. **Updating TypeScript References**
   - After adding or removing packages, run `yarn relink` to update TypeScript references

## Testing Information

### Testing Approach

The project doesn't use a formal testing framework like Jest or Mocha. Instead, it uses simple test scripts to verify functionality.

### Creating and Running Tests

1. **Creating a Test**
   - Create a test file with a `.mjs` or `.cjs` extension depending on the module format
   - Write your test logic using standard JavaScript/TypeScript
   - Use `console.log` for output and manual verification

2. **Example Test**

Here's a simple test example that verifies a package can be imported correctly:

```javascript
// test-iso-utils.mjs
import { isNil } from '@budsbox/iso-utils';

// Test the isNil function
console.log('Testing isNil function:');
console.log('isNil(null):', isNil(null)); // Should be true
console.log('isNil(undefined):', isNil(undefined)); // Should be true
console.log('isNil(0):', isNil(0)); // Should be false
console.log('isNil(""):', isNil('')); // Should be false
```

3. **Running Tests**
   - Run the test with Node.js: `node test-iso-utils.mjs`
   - Verify the output manually

### Test File Locations

- Place test files in the same directory as the code being tested
- For workspace-specific tests, place them in the workspace root
- For project-wide tests, place them in the repository root

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
- `yarn p:scope-prefix`: Add the @budsbox/ prefix to package names
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
