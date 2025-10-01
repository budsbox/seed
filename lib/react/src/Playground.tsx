import type { FC } from 'react';

import { dataAttrs, styleFactory } from './index';

/**
 * Represents a functional React component for a library playground.
 *
 * @returns A JSX element displaying the text "Playground".
 */
export const Playground: FC = () => {
  return (
    <div
      style={styleFactory(
        (width: number) => ({ border: `${width.toFixed(2)}px solid black` }),
        { width: '100px', height: 100 },
      )(3)}
      {...dataAttrs({ fooBar: 'bar', baz: 1, lol: true, lol2: false })}
    >
      Playground
    </div>
  );
};
