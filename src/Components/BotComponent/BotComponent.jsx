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
    // Load chat history from local storage
    const storedMessages = JSON.parse(localStorage.getItem("chatHistory")) || [];
    const filteredMessages = storedMessages.filter(
      (message) => new Date(message.timestamp) >= new Date(Date.now() - 10 * 24 * 60 * 60 * 1000)
    );
    setMessages(filteredMessages);

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
      addMessage(userMessageObj);

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
  }, [language]);

  const speak = (text, lang = "en-US") => {
    window.speechSynthesis.cancel(); // Stop ongoing speech

    const utterance = new SpeechSynthesisUtterance(text);
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
  
    try {
      // Prepare conversation history
      const history = messages.map((msg) => ({
        role: msg.sender === "user" ? "user" : "assistant",
        content: msg.text,
      }));
  
      // Add the latest user message to the history
      history.push({ role: "user", content: input });
  
      // Limit history to the last 5 messages for context
      const maxHistoryLength = 5; // You can adjust this if needed
      const trimmedHistory = history.slice(-maxHistoryLength);
  
      // API request
      const response = await axios.post(
        "https://api.openai.com/v1/chat/completions",
        {
          model: "gpt-4",
          messages: trimmedHistory,
        },
        {
          headers: {
            Authorization: `Bearer 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`, // Replace with your actual API key
          },
          signal,
        }
      );
  
      let botMessage = response.data.choices[0].message.content;
  
      // Replace specific terms (customization)
      botMessage = botMessage
        .replace(/OpenAI/g, "Muhammad Faizan Asim")
        .replace(/ChatGPT/g, "ANNA")
        .replace(/virtual assistant/g, "ANNA")
        .replace(/AI assistant/g, "ANNA");
  
      const botMessageObj = {
        text: botMessage.trim(),
        sender: "bot",
        timestamp: new Date(),
      };
  
      addMessage(botMessageObj);
      speak(botMessage, language); // Speak the personalized message
    } catch (error) {
      console.error("Error fetching bot response:", error);
  
      const errorMessage = {
        text: "Sorry, I couldn't retrieve the answer. Please try again.",
        sender: "bot",
        timestamp: new Date(),
      };
  
      addMessage(errorMessage);
      speak(errorMessage.text, language);
    } finally {
      setLoading(false);
    }
  };
  
  

  const addMessage = (message) => {
    // Add new message and save to local storage
    setMessages((prevMessages) => {
      const updatedMessages = [...prevMessages, message];
      localStorage.setItem("chatHistory", JSON.stringify(updatedMessages));
      return updatedMessages;
    });
  };

  const handleStartListening = () => {
    // Cancel any ongoing speech synthesis
    window.speechSynthesis.cancel();

    // Start speech recognition
    setListening(true);
    recognitionRef.current.lang = language;
    recognitionRef.current.start();
  };

  const handleStopListening = () => {
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

      <div className="chat-box">
        {messages.map((message, index) => (
          <div
            key={index}
            className={message.sender === "user" ? "user-message" : "bot-message"}
          >
            <div className="message-text">{message.text}</div>
            <div className="message-timestamp">
              {new Date(message.timestamp).toLocaleTimeString()}
            </div>
          </div>
        ))}
      </div>

      {listening && <Waveform />}

      
    </div>
  );
}

export default BotComponent;
