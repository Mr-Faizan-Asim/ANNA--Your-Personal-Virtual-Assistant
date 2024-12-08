import React from 'react';

const SpeakButton = () => {
    const handleSpeak = () => {
        const text = "Hello Muhammad Faizan Asim";
        const synth = window.speechSynthesis;
        const utterance = new SpeechSynthesisUtterance(text);

        // Select a compatible voice (e.g., Siri on iOS or a fallback)
        const voices = synth.getVoices();
        const selectedVoice = voices.find(voice => voice.lang === 'en-US' && voice.name.includes('Siri')) || voices[0];
        if (selectedVoice) utterance.voice = selectedVoice;

        // Cancel ongoing speech and speak the text
        synth.cancel(); // Ensure no interruptions
        synth.speak(utterance);
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
                Speak
            </button>
        </div>
    );
};

export default SpeakButton;
