import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import "regenerator-runtime/runtime";
import {supabase} from './supabaseClient';
import { SessionContextProvider } from '@supabase/auth-helpers-react';


const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <SessionContextProvider supabaseClient={supabase}>
      <App />
    </SessionContextProvider>
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an a