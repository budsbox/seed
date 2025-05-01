import { env } from 'node:process';

import { isString } from '@budsbox/iso-utils/type-guards';

export const isYarn = isString(env.PROJECT_CWD);
