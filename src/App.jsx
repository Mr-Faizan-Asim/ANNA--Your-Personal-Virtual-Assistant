import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { GoogleOAuthProvider } from '@react-oauth/google';
import GoogleCalendarIntegration from './Components/GoogleCalendarIntegration/GoogleCalendarIntegration'; // Import your Google Calendar integration component
import GmailBot from './Components/GmailBot/GmailBot'; // Import your Gmail bot component
import BotComponent from './Components/BotComponent/BotComponent'; // Import your Bot component
import AlarmComponent from './Components/Alarm/AlarmComponent';
import Navbar from './Components/Navbar/Navbar';
import SpeakButton from './Components/SpeakButton';

const CLIENT_ID = "";

function App() {
  return (
    <GoogleOAuthProvider clientId={CLIENT_ID}>
      <Router>
      
        <Navbar />
          <Routes>
            <Route path="/anna" element={<BotComponent />} /> {/* Show BotComponent at / */}
            <Route path="/calendar" element={<GoogleCalendarIntegration />} /> {/* Show GoogleCalendarIntegration at /calendar */}
            <Route path="/annamail" element={<GmailBot />} />
            <Route path="/" element={<SpeakButton/>} /> {/* Show GmailBot at /annamail */}
          </Routes>
      </Router>
    </GoogleOAuthProvider>
  );
}

export default App;
