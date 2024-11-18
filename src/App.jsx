import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import BotComponent from "./Components/BotComponent/BotComponent";
import EmailManager from "./Components/EmailManager/EmailManager";

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<BotComponent />} />
          <Route path="/emails" element={<EmailManager />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
