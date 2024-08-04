import { globalIgnores, presets } from '@budsbox/linting/eslint';

export default [{ ignores: [...globalIgnores] }, ...presets.node()];
