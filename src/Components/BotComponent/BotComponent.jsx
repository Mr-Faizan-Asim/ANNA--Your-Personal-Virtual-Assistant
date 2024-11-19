import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import "./BotComponent.css";
import Waveform from "../WaveForm/Waveform.jsx";

function BotComponent() {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [listening, setListening] = useState(false);

  const controllerRef = useRef(null);
  const recognitionRef = useRef(null);
  const voicesRef = useRef([]);

  useEffect(() => {
    // Fetch available voices for speech synthesis
    const loadVoices = () => {
      voicesRef.current = window.speechSynthesis.getVoices();
    };

    loadVoices();
    if (window.speechSynthesis.onvoiceschanged !== undefined) {
      window.speechSynthesis.onvoiceschanged = loadVoices;
    }

    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      console.error("Speech Recognition API not supported in this browser.");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = false;
    recognition.lang = "en-US"; // Default to English for speech recognition

    recognition.onresult = (event) => {
      const userMessage = event.results[event.results.length - 1][0].transcript;
      addMessage(userMessage, "user");
      recognition.stop();
      fetchBotResponse(userMessage);
    };

    recognition.onerror = (event) => {
      console.error("Speech recognition error:", event.error);
      setListening(false);
    };

    recognition.onend = () => setListening(false);

    recognitionRef.current = recognition;
  }, []);

  const addMessage = (text, sender) => {
    setMessages((prev) => [
      ...prev,
      { text, sender, timestamp: new Date() },
    ]);
  };

  const speak = (text, lang = "en-US") => {
    window.speechSynthesis.cancel(); // Stop any ongoing speech
    const utterance = new SpeechSynthesisUtterance(text);

    // Attempt to match voice language
    const voice = voicesRef.current.find((v) => v.lang === lang);
    if (voice) {
      utterance.voice = voice;
    } else {
      console.warn(`No voice found for language: ${lang}. Using default.`);
    }

    utterance.lang = lang;
    utterance.rate = 1;
    utterance.pitch = 1;

    window.speechSynthesis.speak(utterance);
  };

  const fetchBotResponse = async (input) => {
    if (controllerRef.current) {
      controllerRef.current.abort();
    }

    controllerRef.current = new AbortController();
    const signal = controllerRef.current.signal;

    setLoading(true);

    // Check if the user is asking about Anna
    const lowerCaseInput = input.toLowerCase();
    if (lowerCaseInput.includes("who is anna") || lowerCaseInput.includes("tell me about anna")) {
      const annaResponse = "Hi, I am Anna! I was created by Muhammad Faizan Asim to help and interact with people. My purpose is to assist and engage in meaningful conversations!";
      addMessage(annaResponse, "bot");
      speak(annaResponse, "en-US");
      setLoading(false);
      return;
    }

    try {
      const response = await axios.post(
        "https://api.openai.com/v1/chat/completions",
        {
          model: "gpt-4",
          messages: [{ role: "user", content: input }],
        },
        {
          headers: {
            Authorization: `Bearer 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`, // Replace with your actual GPT Premium // Replace with your actual GPT Premium key
          },
          signal,
        }
      );

      const botMessage = response.data.choices[0].message.content;
      const botLanguage = detectLanguage(botMessage) || "en-US"; // Fallback to English if detection fails
      addMessage(botMessage, "bot");
      speak(botMessage, botLanguage);
    } catch (error) {
      console.error("Error fetching bot response:", error);
      const errorMessage = "Sorry, I couldn't retrieve the answer. Please try again.";
      addMessage(errorMessage, "bot");
      speak(errorMessage, "en-US");
    } finally {
      setLoading(false);
    }
};




const detectLanguage = (text) => {
  // Simplistic detection logic; Replace with a library or API for better accuracy
  if (/[\u0600-\u06FF]/.test(text)) return "ur-PK"; // Urdu
  if (/[\u0041-\u005A\u0061-\u007A]/.test(text)) return "it-IT"; // Italian (Latin alphabet check)
  if (/[\u0041-\u005A\u0061-\u007A]/.test(text)) return "de-DE"; // German (Latin alphabet check)
  if (/[\u0A00-\u0A7F]/.test(text)) return "pa-IN"; // Punjabi (Gurmukhi script)
  if (/[\u0600-\u06FF]/.test(text)) return "ar-SA"; // Arabic
  if (/[\u4E00-\u9FFF]/.test(text)) return "zh-CN"; // Chinese
  if (/[\u0900-\u097F]/.test(text)) return "hi-IN"; // Hindi
  if (/[\u3040-\u30FF\u31F0-\u31FF]/.test(text)) return "ja-JP"; // Japanese
  if (/[\u0400-\u04FF]/.test(text)) return "ru-RU"; // Russian
  // Add more languages if needed
  return "en-US"; // Default to English
};


  const handleStartListening = () => {
    window.speechSynthesis.cancel(); // Stop ongoing speech
    setListening(true);
    recognitionRef.current.start();
  };

  const handleStopListening = () => {
    setListening(false);
    recognitionRef.current.stop();
  };

  return (
    <div className="bot-component">
      <div className="dynamic-text">
        <div className="anna-repeater">
          <h1 className="anna-title">ANNA</h1>
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
