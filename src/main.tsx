import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Safety check for global fetch assignment which can crash in some sandboxed environments
(function() {
  const originalFetch = window.fetch;
  if (originalFetch) {
    try {
      // @ts-ignore
      if (Object.getOwnPropertyDescriptor(window, 'fetch')?.writable === false) {
          console.log('Note: window.fetch is read-only. Protecting against unauthorized replacement.');
      }
    } catch (e) {}
  }
})();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
