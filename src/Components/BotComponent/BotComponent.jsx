import React, { useState, useRef } from "react";
import axios from "axios";
import "./BotComponent.css"; // Add your styling for wave animations

function BotComponent() {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [listening, setListening] = useState(false);
  const [language, setLanguage] = useState("en-US"); // Default to English

  const controllerRef = useRef(null);

  // Web Speech API for Speech Recognition
  const SpeechRecognition =
    window.SpeechRecognition || window.webkitSpeechRecognition;
  const recognition = new SpeechRecognition();
  recognition.continuous = false;
  recognition.interimResults = false;
  recognition.lang = language;

  // Web Speech API for Speech Synthesis
  const speak = (text, lang = "en-US") => {
    window.speechSynthesis.cancel(); // Stop any ongoing speech

    const speech = new SpeechSynthesisUtterance(text);
    speech.lang = lang; // Speak in the detected language
    speech.rate = 1;
    speech.pitch = 1;
    window.speechSynthesis.speak(speech);
  };

  const handleStartListening = () => {
    setListening(true);
    recognition.lang = language;

    recognition.onresult = (event) => {
      const userMessage = event.results[0][0].transcript;
      const userMessageObj = {
        text: userMessage,
        sender: "user",
        timestamp: new Date(),
      };
      setMessages((prevMessages) => [...prevMessages, userMessageObj]);

      recognition.stop();
      fetchBotResponse(userMessage); // Fetch bot response
    };

    recognition.onerror = (event) => {
      console.error("Speech recognition error:", event.error);
      setListening(false);
    };

    recognition.onend = () => {
      setListening(false);
    };

    recognition.start();
  };

  const handleStopListening = () => {
    setListening(false);
    recognition.stop();
  };

  const fetchBotResponse = async (input) => {
    if (controllerRef.current) {
      controllerRef.current.abort();
    }

    window.speechSynthesis.cancel();

    controllerRef.current = new AbortController();
    const signal = controllerRef.current.signal;

    setLoading(true);
    try {
      const response = await axios({
        url: "https://api.openai.com/v1/chat/completions", // OpenAI GPT-4 API Endpoint
        method: "post",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer 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`,
        },
        data: {
          model: "gpt-4",
          messages: [{ role: "user", content: input }],
        },
        signal,
      });

      const botMessage = response.data.choices[0].message.content;

      const botMessageObj = {
        text: botMessage,
        sender: "bot",
        timestamp: new Date(),
      };
      setMessages((prevMessages) => [...prevMessages, botMessageObj]);

      // Speak in the user-specified language
      speak(botMessage, language);
    } catch (error) {
      if (axios.isCancel(error)) {
        console.log("Request canceled due to new input");
      } else {
        console.error("Error fetching data:", error);
        const errorMessage = {
          text: "Sorry, I couldn't retrieve the answer. Please try again.",
          sender: "bot",
          timestamp: new Date(),
        };
        setMessages((prevMessages) => [...prevMessages, errorMessage]);
        speak(errorMessage.text, language);
      }
    }
    setLoading(false);
  };

  return (
    <div className="bot-component">
      <div className="language-selector">
        <label>Select Language: </label>
        <select
          value={language}
          onChange={(e) => setLanguage(e.target.value)}
        >
          <option value="en-US">English</option>
          <option value="es-ES">Spanish</option>
          <option value="fr-FR">French</option>
          <option value="de-DE">German</option>
          <option value="hi-IN">Hindi</option>
          <option value="ar-SA">Arabic</option>
          <option value="zh-CN">Chinese</option>
          <option value="it-IT">Italian</option> {/* Added Italian */}
        </select>
      </div>

      <div className="chat-box">
        {messages.map((message, index) => (
          <div
            key={index}
            className={message.sender === "user" ? "user-message" : "bot-message"}
          >
            <div className="message-text">{message.text}</div>
            <div className="message-timestamp">
              {message.timestamp.toLocaleTimeString()}
            </div>
          </div>
        ))}
      </div>

      {/* Wave animation */}
      <div className={`wave-animation ${listening ? "active" : ""}`} />

      {/* Voice control buttons */}
      <div className="voice-controls">
        {!listening ? (
          <button onClick={handleStartListening} className="voice-button">
            🎤 Start Listening
          </button>
        ) : (
          <button onClick={handleStopListening} className="voice-button">
            🛑 Stop Listening
          </button>
        )}
      </div>
    </div>
  );
}

export default BotComponent;
