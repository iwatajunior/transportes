// src/index.js
import React from 'react';
import ReactDOM from 'react-dom';
import './index.css'; // Para estilos globais ou Tailwind
import App from './App';

// Suppress noisy ResizeObserver warnings in development only
if (process.env.NODE_ENV === 'development') {
  const SUPPRESS_RE = /ResizeObserver loop (limit exceeded|completed with undelivered notifications)/i;
  const origError = console.error.bind(console);
  console.error = (...args) => {
    if (typeof args[0] === 'string' && SUPPRESS_RE.test(args[0])) return;
    origError(...args);
  };
  const origWarn = console.warn.bind(console);
  console.warn = (...args) => {
    if (typeof args[0] === 'string' && SUPPRESS_RE.test(args[0])) return;
    origWarn(...args);
  };
}

ReactDOM.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
  document.getElementById('root')
);
