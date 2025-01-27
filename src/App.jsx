import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { GoogleOAuthProvider } from '@react-oauth/google';
import Home from './Components/Home/Home';

const CLIENT_ID = "1003847576572-81o93k5rndnlq8ljcr56vqhv8k639c9h.apps.googleusercontent.com";

function App() {
  return (
    <GoogleOAuthProvider clientId={CLIENT_ID}>
      <Router>
        
      <Home/>
          <Routes>
            
            {/*
            <Navbar />
            <Route path="/anna" element={<BotComponent />} /> 
            <Route path="/calendar" element={<GoogleCalendarIntegration />} /> 
            <Route path="/annamail" element={<GmailBot />} />
            <Route path="/" element={<SpeakButton/>} />
            */}
          </Routes>
      </Router>
    </GoogleOAuthProvider>
  );
}

export default App;
