import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';

import './index.css';
import reportWebVitals from './reportWebVitals';

import App from './App';

import AxiosTodoClient, { localTokenStorage } from './client/AxiosTodoClient';

const todoClient = new AxiosTodoClient({
  tokenStorage: localTokenStorage('__reactTodo:token'),
  timeout: 2000,
});

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);
root.render(
  <React.StrictMode>
    <BrowserRouter>
      <App todoClient={todoClient} />
    </BrowserRouter>
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
