import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';

import { sure } from '@budsbox/lib-es/logical';

import { Playground } from './Playground';

sure(
  document.getElementById('root'),
  (root) =>
    void createRoot(root).render(
      <StrictMode>
        <Playground />
      </StrictMode>,
    ),
);
