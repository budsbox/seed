import type { Merge2Model } from '#types';

import { createStrictContext } from '@budsbox/lib-react';

export const { Merge2Provider, useMerge2Context } = createStrictContext<
  'Merge2',
  Merge2Model
>('Merge2');
