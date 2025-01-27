import React from 'react';
import { useNavigate } from 'react-router-dom';
import './SpeakButton.css';

const SpeakButton = () => {
    const navigate = useNavigate();
    const handleSpeak = () => {
        const text = "Hello, I am Anna. How can I assist you today?"; // The text to be spoken
        const synth = window.speechSynthesis; // Accessing the SpeechSynthesis API
        const utterance = new SpeechSynthesisUtterance(text); // Creating a speech utterance

        // Load available voices
        const voices = synth.getVoices();

        // Select a woman's voice (preferably in English)
        const femaleVoice =
            voices.find(voice => voice.lang.startsWith('en') && voice.gender === 'female') || // Look for a female English voice
            voices.find(voice => voice.lang.startsWith('en')) || // Fallback to any English voice
            voices[0]; // Fallback to the first available voice

        if (femaleVoice) {
            utterance.voice = femaleVoice; // Set the chosen voice
        }

        // Speak the text
        synth.cancel(); // Cancel any ongoing speech before starting
        synth.speak(utterance); // Speak the given utterance
        navigate('/anna');
    };

    return (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
            
            
            <button
                onClick={handleSpeak}
                style={{
                    padding: '10px 20px',
                    fontSize: '16px',
                    backgroundColor: '#007BFF',
                    color: 'white',
                    border: 'none',
                    borderRadius: '5px',
                    cursor: 'pointer',
                }}
            >
                Welocme Sir
            </button>
        </div>
    );
};

export default SpeakButton;
