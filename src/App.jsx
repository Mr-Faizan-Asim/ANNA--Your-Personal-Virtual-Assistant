import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { GoogleOAuthProvider } from '@react-oauth/google';
import GoogleCalendarIntegration from './Components/GoogleCalendarIntegration/GoogleCalendarIntegration'; // Import your Google Calendar integration component
import GmailBot from './Components/GmailBot/GmailBot'; // Import your Gmail bot component
import BotComponent from './Components/BotComponent/BotComponent'; // Import your Bot component
import AlarmComponent from './Components/Alarm/AlarmComponent';

const CLIENT_ID = "1003847576572-81o93k5rndnlq8ljcr56vqhv8k639c9h.apps.googleusercontent.com";

function App() {
  return (
    <GoogleOAuthProvider clientId={CLIENT_ID}>
      <Router>
        <div className="App">
          <Routes>
            <Route path="/" element={<BotComponent />} /> {/* Show BotComponent at / */}
            <Route path="/calendar" element={<GoogleCalendarIntegration />} /> {/* Show GoogleCalendarIntegration at /calendar */}
            <Route path="/annamail" element={<GmailBot />} />
            <Route path="/alarm" element={<AlarmComponent/>} /> {/* Show GmailBot at /annamail */}
          </Routes>
        </div>
      </Router>
    </GoogleOAuthProvider>
  );
}

export default App;
