// App.js

import React from 'react';
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";  
import { GoogleOAuthProvider } from '@react-oauth/google';
import BotComponent from './Components/BotComponent/BotComponent';
import GoogleCalendarIntegration from './Components/GoogleCalendarIntegration/GoogleCalendarIntegration';

const CLIENT_ID = "1003847576572-81o93k5rndnlq8ljcr56vqhv8k639c9h.apps.googleusercontent.com";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<BotComponent />} />
        <Route path="/event" element={<GoogleOAuthProvider clientId={CLIENT_ID}> <GoogleCalendarIntegration/></GoogleOAuthProvider>} />
      </Routes>
    </Router>
    
  );
}

export default App;
