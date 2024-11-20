import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import { createClient } from '@supabase/supabase-js';
import { SessionContextProvider } from '@supabase/auth-helpers-react';

const supabase = createClient(
  "https://ghvppxlkgmgbxvcecpvy.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdodnBweGxrZ21nYnh2Y2VjcHZ5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzIwOTY5ODEsImV4cCI6MjA0NzY3Mjk4MX0.YFyZasBMI60y_ol1uuofTESlibxUsfXCxV_U3SWVwsc"
);

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