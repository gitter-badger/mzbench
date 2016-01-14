import 'babel-core/polyfill';
import React from 'react';
import MZBenchApp from './components/MZBenchApp.react';
import './utils/MZBenchRouter';

React.render(
  <MZBenchApp />,
  document.getElementById('mzbench-container')
);
