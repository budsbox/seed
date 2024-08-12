import reactLogo from './assets/react.svg';
import viteLogo from './assets/vite.svg';

import { className } from '@budsbox/iso-utils/string';
import { type FC, useState } from 'react';

import classes from './App.module.scss';

const App: FC = () => {
  const [flag, setFlag] = useState(false);

  return (
    <>
      <div>
        <a href="https://vitejs.dev" target="_blank" rel="noreferrer">
          <img
            src={viteLogo}
            className={className(classes.logo, { [classes.shiny]: flag })}
            alt="Vite logo"
          />
        </a>

        <a href="https://react.dev" target="_blank" rel="noreferrer">
          <img
            src={reactLogo}
            className={className(classes.logo, classes.react, {
              [classes.shiny]: flag,
            })}
            alt="React logo"
          />
        </a>
      </div>

      <h1>Vite + React</h1>

      <div className={classes.card}>
        <button type="button" onClick={() => void setFlag(!flag)}>
          Toggle me
        </button>

        <p>
          Edit <code>src/App.tsx</code> and save to test HMR
        </p>
      </div>

      <p className={classes.readTheDocs}>
        Click on the Vite and React logos to learn more
      </p>
    </>
  );
};

export default App;
