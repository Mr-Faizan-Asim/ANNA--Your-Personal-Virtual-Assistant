// App.js

import React from 'react';
import { GoogleOAuthProvider } from '@react-oauth/google';
import GoogleCalendarIntegration from './Components/GoogleCalendarIntegration/GoogleCalendarIntegration'; // Import your Google integration component

const CLIENT_ID = "";

function App() {
  return (
    <GoogleOAuthProvider clientId={CLIENT_ID}>
      <div className="App">
        <GoogleCalendarIntegration />
      </div>
    </GoogleOAuthProvider>
  );
}

export default App;
