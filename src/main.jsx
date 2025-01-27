import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import "regenerator-runtime/runtime";
import { supabase } from './supabaseClient';
import { SessionContextProvider } from '@supabase/auth-helpers-react';
import * as serviceWorkerRegistration from './serviceWorkerRegistration'; // Import Service Worker

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <SessionContextProvider supabaseClient={supabase}>
      <App />
    </SessionContextProvider>
  </React.StrictMode>
);

// Register service worker
serviceWorkerRegistration.register();
