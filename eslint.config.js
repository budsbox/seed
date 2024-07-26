import { globalIgnores, presets } from '@budsbox/linting/eslint';

const config = [{ ignores: [...globalIgnores, '*/'] }, ...presets.node()];

export default config;
