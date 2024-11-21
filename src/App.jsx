// App.js

import React from 'react';
import { GoogleOAuthProvider } from '@react-oauth/google';
import BotComponent from './Components/BotComponent/BotComponent';

const CLIENT_ID = "1003847576572-81o93k5rndnlq8ljcr56vqhv8k639c9h.apps.googleusercontent.com";

function App() {
  return (
    <GoogleOAuthProvider clientId={CLIENT_ID}>
      <div>
        <BotComponent/>
      </div>
    </GoogleOAuthProvider>
  );
}

export default App;
