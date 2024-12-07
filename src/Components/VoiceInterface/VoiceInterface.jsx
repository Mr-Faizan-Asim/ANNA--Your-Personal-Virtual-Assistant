import React, { useState } from "react";
import "./VoiceInterface.css";

const VoiceInterface = ({ listening, toggleListening, toggleVoiceMode }) => {
  const [active, setActive] = useState(false); // Tracks if mic is active

  const handleMicToggle = () => {
    setActive((prev) => !prev);
    listening = !listening;
    toggleListening(); // Toggles the mic
  };

  return (
    <div className="voice-interface-container">
      {/* Header */}
      <div className="voice-interface-header">
        <p>{active ? "Listening..." : "Tap the mic to start listening"}</p>
      </div>

      {/* Dynamic Waves */}
      <div className={`sound-wave-container ${active ? "active" : ""}`}>
        <svg
          className="sound-waves"
          viewBox="0 0 1440 320"
          preserveAspectRatio="none"
        >
          {[...Array(20)].map((_, index) => {
            const baseAmplitude = active ? 40 : 20; // Higher amplitude when active
            const amplitude = baseAmplitude + (index % 5) * 5;
            const mirroredAmplitude =
              index % 2 === 0 ? amplitude : -amplitude; // Mirrored symmetry
            const colors = [
              "rgba(255, 102, 161, 0.8)",
              "rgba(58, 210, 255, 0.8)",
              "rgba(255, 255, 255, 0.6)",
              "rgba(140, 20, 255, 0.7)",
              "rgba(0, 128, 255, 0.7)",
            ]; // Custom colors

            return (
              <React.Fragment key={index}>
                {/* First wave path */}
                <path
                  d={`M0,160 
                     Q360,${320 - mirroredAmplitude} 
                     720,160 
                     T1440,${150 + mirroredAmplitude}`}
                  className={`wave wave1-${index} ${active ? "active" : ""}`}
                  style={{
                    stroke: colors[index % colors.length],
                    animationDuration: active ? "2s" : "5s", // Faster animation when active
                    animationDelay: `${index * 0.15}s`,
                  }}
                />
                {/* Second wave path */}
                <path
                  d={`M0,160 
                     Q360,${10 - mirroredAmplitude} 
                     Q360,160 
                     T1440,${160 + mirroredAmplitude}
                     Q1440,${160 + mirroredAmplitude} 
                    `}
                  className={`wave wave2-${index} ${active ? "active" : ""}`}
                  style={{
                    stroke: colors[(index + 1) % colors.length], // Offset color
                    animationDuration: active ? "2s" : "5s", // Faster animation when active
                    animationDelay: `${index * 0.2}s`,
                  }}
                />
              </React.Fragment>
            );
          })}
        </svg>
      </div>

      {/* Footer */}
      <div className="voice-interface-footer">
        <button className="mic-button" onClick={handleMicToggle}>
          🎤
        </button>
        <button className="cancel-button" onClick={toggleVoiceMode}>
          ❌
        </button>
      </div>
    </div>
  );
};

export default VoiceInterface;
