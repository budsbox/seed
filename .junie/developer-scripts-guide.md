# Budsbox Developer Scripts Guide

**Quick reference for essential development scripts in the Budsbox monorepo**

## Essential Daily Commands

### Code Quality & Formatting

- **`yarn format`** - Format all code and package.json files
- **`yarn format-manifests`** - Sort and format package.json files only
- **`yarn p:prettier`** - Format files in current workspace
- **`yarn p:format-manifest`** - Format package.json in current workspace

### Constraint Management

- **`yarn c`** - Check monorepo constraints (short alias)
- **`yarn cf`** - Fix constraint violations automatically (short alias)

### Linting & Code Quality

- **`yarn p:eslint`** - Run ESLint on current workspace
- **`yarn p:eslint:fix`** - Run ESLint and auto-fix issues
- **`yarn p:lint`** - Alias for p:eslint (reserved for future use)

## Workspace Management

### Dependency Management

These commands work from any workspace and automatically add the `@budsbox/` prefix:

- **`yarn p:wsa <package-name>`** - Add dependency to current workspace
- **`yarn p:wsad <package-name>`** - Add dev dependency to current workspace
- **`yarn p:wsap <package-name>`** - Add peer dependency to current workspace
- **`yarn p:wsr <package-name>`** - Remove dependency from current workspace

### Workspace Operations

- **`yarn ws <workspace> <command>`** - Run command in specific workspace (short alias)

## Development Workflow

### TypeScript References

- **`yarn relink`** - Update TypeScript references across monorepo (run after adding/removing packages)

### Build & Development

- **`yarn p:ts:build`** - Build TypeScript in current workspace
- **`yarn p:ts:watch`** - Watch and rebuild TypeScript changes

## Future/Reserved Commands

- **`yarn playground`** - Reserved for future playground workspace
- **`yarn preview`** - Reserved for future Vite preview workflow

## Automated Scripts

These run automatically as part of the development workflow:

- **`yarn lint-staged`** - Runs during git commits via pre-commit hooks

## Examples

```bash
# Format all code
yarn format

# Add a dependency to current workspace
yarn p:wsa lib-types

# Check and fix constraints
yarn c
yarn cf

# Work with specific workspace
yarn ws @budsbox/lib-es p:ts:build

# Update TypeScript references after changes
yarn relink
```

## Tips

- Most `p:*` scripts work within the current workspace directory
- Use `yarn c` regularly to catch constraint violations early
- Run `yarn relink` after adding or removing workspace dependencies
- The `p:ws*` commands save typing by auto-prefixing `@budsbox/`
