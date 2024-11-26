import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import "./BotComponent.css";
import Waveform from "../WaveForm/Waveform.jsx";

function BotComponent() {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [listening, setListening] = useState(false);
  const [language, setLanguage] = useState("en-US"); // Default language

  const controllerRef = useRef(null);
  const recognitionRef = useRef(null);

  useEffect(() => {
    const initializeRecognition = () => {
      const SpeechRecognition =
        window.SpeechRecognition || window.webkitSpeechRecognition;

      if (!SpeechRecognition) {
        console.error("Speech Recognition API not supported in this browser.");
        return;
      }

      const recognition = new SpeechRecognition();
      recognition.continuous = true; // Allow continuous listening
      recognition.interimResults = false;
      recognition.lang = language;

      recognition.onresult = (event) => {
        const userMessage = event.results[event.results.length - 1][0].transcript;
        const userMessageObj = {
          text: userMessage,
          sender: "user",
          timestamp: new Date(),
        };
        setMessages((prevMessages) => [...prevMessages, userMessageObj]);

        recognition.stop(); // Stop recognition temporarily to process response
        fetchBotResponse(userMessage); // Fetch response from the bot
      };

      recognition.onerror = (event) => {
        console.error("Speech recognition error:", event.error);
        setListening(false);
      };

      recognition.onend = () => {
        // Do not restart automatically unless explicitly started by the user
        setListening(false);
      };

      recognitionRef.current = recognition;
    };

    initializeRecognition();
  }, [language]);

  const speak = (text, lang = "en-US") => {
    try {
      window.speechSynthesis.cancel(); // Stop ongoing speech
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = lang;
      utterance.rate = 1;
      utterance.pitch = 1;
      utterance.onerror = (e) => console.error("Speech synthesis error:", e);
      window.speechSynthesis.speak(utterance);
    } catch (error) {
      console.error("Speech synthesis failed:", error);
    }
  };

  const fetchBotResponse = async (input) => {
    if (controllerRef.current) {
      controllerRef.current.abort();
    }

    controllerRef.current = new AbortController();
    const signal = controllerRef.current.signal;

    setLoading(true);

    try {
      const response = await axios.post(
        "https://api.openai.com/v1/chat/completions",
        {
          model: "gpt-4",
          messages: [{ role: "user", content: input }],
        },
        {
          headers: {
            Authorization: `Bearer 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`, // Replace with your actual GPT Premium // Use a secure method for handling API keys
          },
          signal,
        }
      );

      const botMessage = response.data.choices[0].message.content;
      const botMessageObj = {
        text: botMessage,
        sender: "bot",
        timestamp: new Date(),
      };
      setMessages((prevMessages) => [...prevMessages, botMessageObj]);

      speak(botMessage, language);
    } catch (error) {
      console.error("Error fetching bot response:", error);
      const errorMessage = {
        text: "Sorry, I couldn't retrieve the answer. Please try again.",
        sender: "bot",
        timestamp: new Date(),
      };
      setMessages((prevMessages) => [...prevMessages, errorMessage]);
      speak(errorMessage.text, language);
    } finally {
      setLoading(false);
      // Do not restart listening automatically
    }
  };

  const handleStartListening = () => {
    if (!recognitionRef.current) return;

    // Cancel any ongoing speech synthesis
    window.speechSynthesis.cancel();

    // Start speech recognition
    try {
      setListening(true);
      recognitionRef.current.lang = language;
      recognitionRef.current.start();
    } catch (error) {
      console.error("Error starting speech recognition:", error);
    }
  };

  const handleStopListening = () => {
    if (!recognitionRef.current) return;
    setListening(false);
    recognitionRef.current.stop();
  };

  return (
    <div className="bot-component">
      <div className="language-selector">
        <div className="dynamic-text">
          <div className="anna-repeater">
            <h1 className="anna-title">ANNA</h1>
          </div>
        </div>
        <div>
          <h3 className="typing-effect">Select Language</h3>
          <select
            className="language-dropdown"
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
            <option value="it-IT">Italian</option>
          </select>
        </div>
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

      {listening && <Waveform />}

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

      {loading && <div className="loading">Bot is thinking...</div>}
    </div>
  );
}

export default BotComponent;
