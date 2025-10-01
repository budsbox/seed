import type { Merge2UiContext } from './types';

import { createStrictContext } from '@budsbox/lib-react';

export const { Merge2UiProvider, useMerge2UiContext } = createStrictContext<
  'Merge2Ui',
  Merge2UiContext
>('Merge2Ui');
