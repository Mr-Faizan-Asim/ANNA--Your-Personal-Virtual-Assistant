import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom"; 
import VoiceInterface from "../VoiceInterface/VoiceInterface";
import Tts from 'react-native-tts';
import Voice from 'react-native-voice';
import "./BotComponent.css";

const API_KEY = "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"; // Replace with your actual API key

const BotComponent = () => {
  const [messages, setMessages] = useState([
    { text: "Hello, I am Anna. How can I assist you today?", sender: "bot" },
  ]);
  const [userInput, setUserInput] = useState("");
  const [listening, setListening] = useState(false);
  const [voiceMode, setVoiceMode] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState("en-US");
  const navigate = useNavigate(); // For navigation

  const languageOptions = [
    { code: "en-US", name: "English (US)" },
    { code: "it-IT", name: "Italian" },
    { code: "de-DE", name: "German" },
    { code: "ru-RU", name: "Russian" },
    { code: "zh-CN", name: "Chinese (Simplified)" }, 
    { code: "zh-TW", name: "Chinese (Traditional)" }, 
    { code: "ar-SA", name: "Arabic" },
    { code: "es-ES", name: "Spanish (Spain)" },
    { code: "es-MX", name: "Spanish (Mexico)" },
  ];

  useEffect(() => {
    // Initialize TTS with the selected language
    Tts.setDefaultLanguage(selectedLanguage);
    Tts.setDefaultVoice('com.apple.speech.synthesis.voice.Alex'); // You can set a specific voice if needed

    // Initialize Voice recognition
    Voice.onSpeechStart = () => setListening(true);
    Voice.onSpeechEnd = () => setListening(false);
    Voice.onSpeechResults = handleVoiceInput;

    return () => {
      Voice.destroy().then(Voice.removeAllListeners);
    };
  }, [selectedLanguage]);

  const handleVoiceInput = (e) => {
    const transcript = e.value[0];
    handleVoiceCommand(transcript);
  };

  const handleVoiceCommand = async (input) => {
    const command = input.toLowerCase().trim();
    // Handle commands as before...
    // You can add any voice-based commands here (e.g., open website, time, etc.)
    await handleSendMessage(input);
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

  const speak = (text) => {
    Tts.speak(text);
  };

  const toggleListening = () => {
    if (listening) {
      Voice.stop();
    } else {
      Voice.start();
    }
  };

  const toggleVoiceMode = () => {
    setVoiceMode((prev) => !prev);
  };

  const handleLanguageChange = (e) => {
    setSelectedLanguage(e.target.value);
    Tts.setDefaultLanguage(e.target.value);
    const languageName = languageOptions.find((lang) => lang.code === e.target.value)?.name;
    const botMessage = {
      text: `Language switched to ${languageName}.`,
      sender: "bot",
    };
    setMessages((prev) => [...prev, botMessage]);
    speak(botMessage.text);
  };

  const navigateToMail = () => {
    navigate("/annamail");
  };

  return (
    <div className="bot-container">
      {!voiceMode ? (
        <>
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
                onKeyDown={(e) => e.key === "Enter" && handleSendMessage(userInput)}
              />
              <button className="send-button" onClick={() => handleSendMessage(userInput)}>
                ➤
              </button>
              <button className="send-button" onClick={toggleVoiceMode}>
                <img src="/mic.png" alt="Voice Icon" className="send-icon" />
              </button>
              <button className="mail-button" onClick={navigateToMail}>
                📧
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
};

export default BotComponent;
