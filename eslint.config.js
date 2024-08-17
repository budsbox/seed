import { globalIgnores, presets } from '@budsbox/linting/eslint';

const config = [{ ignores: [...globalIgnores, '*/'] }, ...presets.tools()];

export default config;
