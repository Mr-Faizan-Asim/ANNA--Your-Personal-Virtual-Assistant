import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import VoiceInterface from "../VoiceInterface/VoiceInterface";
import "./BotComponent.css";

const API_KEY = "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"; // Replace with your actual API key

const BotComponent = () => {
  const [messages, setMessages] = useState([
    { text: "Hello, I am Anna. How can I assist you today?", sender: "bot" },
  ]);
  const [userInput, setUserInput] = useState("");
  const [listening, setListening] = useState(false);
  const recognitionRef = useRef(null);
  const isSpeakingRef = useRef(false);
  const [voiceMode, setVoiceMode] = useState(false);
  const [voices, setVoices] = useState([]);
  const navigate = useNavigate(); // For navigation
  const [selectedLanguage, setSelectedLanguage] = useState("en-US");

  const languageOptions = [
    { code: "en-US", name: "English (US)" },
    { code: "it-IT", name: "Italian" },
    // Additional language options
  ];

  useEffect(() => {
    // Load voices with a delay for iOS compatibility
    const loadVoices = () => {
      const synth = window.speechSynthesis;
      const retryInterval = setInterval(() => {
        const availableVoices = synth.getVoices();
        if (availableVoices.length > 0) {
          setVoices(availableVoices);
          clearInterval(retryInterval);
        }
      }, 100);
    };

    if (typeof window !== "undefined" && window.speechSynthesis) {
      window.speechSynthesis.onvoiceschanged = loadVoices;
      loadVoices();
    }
  }, []);

  const speak = (text) => {
    if (!text) return;

    const synth = window.speechSynthesis;
    const utterance = new SpeechSynthesisUtterance(text);

    // Select the appropriate voice for iOS
    const femaleVoice =
      voices.find((voice) => voice.lang === selectedLanguage && voice.name.includes("Siri")) ||
      voices.find((voice) => voice.lang.startsWith("en") && voice.gender === "female") ||
      voices.find((voice) => voice.lang.startsWith("en")) ||
      voices[0]; // Fallback to any voice

    if (femaleVoice) {
      utterance.voice = femaleVoice;
    }

    // Cancel any ongoing speech and speak the new utterance
    if (synth.speaking) synth.cancel();
    synth.speak(utterance);
  };

  const handleSendMessage = async (input) => {
    const userMessage = { text: input, sender: "user" };
    setMessages((prev) => [...prev, userMessage]);

    try {
      const response = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${API_KEY}`,
        },
        body: JSON.stringify({
          model: "gpt-4",
          messages: [
            ...messages.map((msg) => ({
              role: msg.sender === "user" ? "user" : "assistant",
              content: msg.text,
            })),
            { role: "user", content: input },
          ],
        }),
      });

      const data = await response.json();
      let botMessageText =
        data.choices[0]?.message?.content || "I'm sorry, I didn't understand that.";

      botMessageText = botMessageText.replace(/openai/gi, "Anna").replace(/chatgpt/gi, "Anna");

      const botMessage = { text: botMessageText, sender: "bot" };
      setMessages((prev) => [...prev, botMessage]);
      speak(botMessage.text);
    } catch (error) {
      console.error("Error fetching GPT response:", error);
      const errorMessage = "Sorry, I couldn't process your request. Please try again.";
      const botMessage = { text: errorMessage, sender: "bot" };
      setMessages((prev) => [...prev, botMessage]);
      speak(errorMessage);
    }
  };

  const handleInputSubmit = () => {
    if (userInput.trim()) {
      handleSendMessage(userInput);
      setUserInput("");
    }
  };

  const handleLanguageChange = (e) => {
    setSelectedLanguage(e.target.value);
    const languageName = languageOptions.find((lang) => lang.code === e.target.value)?.name;
    const botMessage = { text: `Language switched to ${languageName}.`, sender: "bot" };
    setMessages((prev) => [...prev, botMessage]);
    speak(botMessage.text);
  };

  const navigateToMail = () => {
    navigate("/annamail");
  };

  return (
    <div className="bot-container">
      <div className="chat-container">
        <div className="language-selector">
          <select id="language-select" value={selectedLanguage} onChange={handleLanguageChange}>
            {languageOptions.map((option) => (
              <option key={option.code} value={option.code}>
                {option.name}
              </option>
            ))}
          </select>
        </div>
        {messages.map((message, index) => (
          <div
            key={index}
            className={`chat-message ${message.sender === "user" ? "user-message" : "bot-message"}`}
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
            placeholder="Type a question or command..."
            onKeyDown={(e) => e.key === "Enter" && handleInputSubmit()}
          />
          <button className="send-button" onClick={handleInputSubmit}>
            ➤
          </button>
          <button className="mail-button" onClick={navigateToMail}>
            📧
          </button>
        </div>
      </div>
    </div>
  );
};

export default BotComponent;
