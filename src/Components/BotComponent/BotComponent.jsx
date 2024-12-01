import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { supabase } from "../../supabaseClient";
import "./BotComponent.css";
import VoiceInterface from "../VoiceInterface/VoiceInterface";

const API_KEY = "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";

function BotComponent() {
  const [messages, setMessages] = useState([
    { text: "Hello, I am Anna. How can I assist you today?", sender: "bot" },
  ]);
  const [userInput, setUserInput] = useState("");
  const [listening, setListening] = useState(false);
  const recognitionRef = useRef(null);
  const isSpeakingRef = useRef(false);
  const [voices, setVoices] = useState([]);
  const [voiceMode, setVoiceMode] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const populateVoices = () => {
      const availableVoices = window.speechSynthesis.getVoices();
      if (availableVoices.length > 0) {
        setVoices(availableVoices);
      } else {
        setTimeout(populateVoices, 100);
      }
    };

    populateVoices();

    if (window.speechSynthesis.onvoiceschanged !== undefined) {
      window.speechSynthesis.onvoiceschanged = populateVoices;
    }

    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      console.error("Speech Recognition API not supported in this browser.");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = "en-US";
    recognition.continuous = true;
    recognition.interimResults = false;

    recognition.onresult = (event) => {
      const transcript = event.results[event.results.length - 1][0].transcript;
      handleVoiceInput(transcript);
    };

    recognition.onerror = (event) => {
      console.error("Speech recognition error:", event.error);
    };

    recognition.onend = () => {
      if (listening && !isSpeakingRef.current) {
        recognition.start();
      }
    };

    recognitionRef.current = recognition;
  }, [listening]);

  const handleVoiceInput = async (input) => {
    if (isSpeakingRef.current) return;
    if (input.toLowerCase().includes("date")) {
      const currentDate = new Date().toLocaleDateString("en-US", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      });
      const botMessage = { text: `Today is ${currentDate}.`, sender: "bot" };
      setMessages((prev) => [...prev, botMessage]);
      speak(botMessage.text);
      return;
    }

    if (input.toLowerCase().includes("time")) {
      const currentTime = new Date().toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
      });
      const botMessage = { text: `The current time is ${currentTime}.`, sender: "bot" };
      setMessages((prev) => [...prev, botMessage]);
      speak(botMessage.text);
      return;
    }

    await handleSendMessage(input, true);
  };

  const handleSendMessage = async (input, isVoice = false) => {
    const userMessage = { text: input, sender: "user" };
    setMessages((prev) => [...prev, userMessage]);

    try {
      const response = await axios.post(
        "https://api.openai.com/v1/chat/completions",
        {
          model: "gpt-4",
          messages: [
            ...messages.map((msg) => ({
              role: msg.sender === "user" ? "user" : "assistant",
              content: msg.text,
            })),
            { role: "user", content: input },
          ],
        },
        {
          headers: {
            Authorization: `Bearer ${API_KEY}`,
          },
        }
      );

      const botMessageText = response.data.choices[0].message.content;
      const botMessage = { text: botMessageText, sender: "bot" };
      setMessages((prev) => [...prev, botMessage]);

      if (isVoice) {
        speak(botMessageText);
      }
    } catch (error) {
      console.error("Error during API call:", error);
      const errorMessage = "Sorry, something went wrong. Please try again.";
      const botMessage = { text: errorMessage, sender: "bot" };
      setMessages((prev) => [...prev, botMessage]);
      if (isVoice) {
        speak(errorMessage);
      }
    }
  };

  const speak = (text) => {
    if (!window.speechSynthesis) {
      console.error("SpeechSynthesis API not supported in this browser.");
      return;
    }

    window.speechSynthesis.cancel();
    isSpeakingRef.current = true;

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "it-IT";

    const selectedVoice =
      voices.find((voice) => voice.lang === "it-IT" && voice.name.includes("Female")) ||
      voices.find((voice) => voice.lang === "it-IT") ||
      voices[0];

    if (selectedVoice) {
      utterance.voice = selectedVoice;
    }

    utterance.onerror = (e) => {
      console.error("Speech synthesis error:", e.error);
    };

    utterance.onend = () => {
      isSpeakingRef.current = false;
      if (listening) startListening();
    };

    window.speechSynthesis.speak(utterance);
  };

  const startListening = () => {
    if (listening || isSpeakingRef.current) {
      window.speechSynthesis.cancel();
      isSpeakingRef.current = false;
    }

    setListening(true);
    recognitionRef.current.start();
  };

  const stopListening = () => {
    if (listening) {
      setListening(false);
      recognitionRef.current.stop();
    }
  };

  const toggleListening = () => {
    if (listening) {
      stopListening();
    } else {
      startListening();
    }
  };

  const toggleVoiceMode = () => {
    setVoiceMode((prev) => !prev);
    stopListening();
  };

  const handleInputSubmit = () => {
    if (userInput.trim()) {
      handleSendMessage(userInput);
      setUserInput("");
    }
  };

  return (
    <div className="bot-container">
      {!voiceMode ? (

      
        <>
<div className="circle-container">
            <div className="foggy-circle">
              <div className="fog-layer"></div>
              <div className="fog-layer second"></div>
            </div>
          </div>
          <div className="chat-container">
            {messages.map((message, index) => (
              <div
                key={index}
                className={`chat-message ${
                  message.sender === "user" ? "user-message" : "bot-message"
                }`}
              >
                {message.text}
              </div>
            ))}
          </div>
          <div className="footer">
            <div className="input-container">
              <input
                type="text"
                value={userInput}
                onChange={(e) => setUserInput(e.target.value)}
                placeholder="Type a quick question..."
                onKeyDown={(e) => e.key === "Enter" && handleInputSubmit()}
              />
              <button className="send-button" onClick={handleInputSubmit}>
                ➤
              </button>
              <button className="mic-button" onClick={toggleVoiceMode}>
                🎙️ Voice
              </button>
              <button className="mic-button" onClick={() => navigate("/annamail")}>
                AnnaMail
              </button>
            </div>
          </div>
        </>
      ) : (
        <VoiceInterface
        listening={listening}
        toggleListening={toggleListening}
        toggleVoiceMode={toggleVoiceMode}
      />
      )}
    </div>
  );
}

export default BotComponent;
