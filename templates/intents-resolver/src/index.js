import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import GlueWeb from "@glue42/web";
import Glue from "@glue42/desktop";
import GlueIntentsResolver from "@glue42/intents-resolver-api";
import { GlueProvider } from '@glue42/react-hooks';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <GlueProvider settings={{
    web: {
      config: { libraries: [GlueIntentsResolver], appManager: "full", intents: { enableIntentsResolverUI: false } },
      factory: GlueWeb
    },
    desktop: {
      config: { libraries: [GlueIntentsResolver], appManager: "full", intents: { enableIntentsResolverUI: false } },
      factory: Glue
    }
  }}>
    <App />
  </GlueProvider>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
