import { defaultIgnores, presets } from '@budsbox/linting/eslint';

export default [{ ignores: [...defaultIgnores] }, ...presets.node()];
