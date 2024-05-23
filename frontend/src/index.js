import React from 'react';
import { createRoot } from 'react-dom/client';
import { Provider } from 'react-redux';
import store from './models';
import App from './App';
import { BrowserRouter as Router } from 'react-router-dom';
import './index.common.less';

const container = document.getElementById('root');
const root = createRoot(container);

root.render(
  <Router>
    <Provider store={store}>
      <App />
    </Provider>
  </Router>
);
