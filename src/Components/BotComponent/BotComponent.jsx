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
  const [temp, settemp] = useState(false);
  const recognitionRef = useRef(null);
  const isSpeakingRef = useRef(false);
  const [voiceMode, setVoiceMode] = useState(false);
  const [voices, setVoices] = useState([]);
  const navigate = useNavigate(); // For navigation
  const [selectedLanguage, setSelectedLanguage] = useState("en-US");
  const languageOptions = [
  { code: "en-US", name: "English (US)" },
  { code: "it-IT", name: "Italian" },
  { code: "de-DE", name: "German" },
  { code: "ru-RU", name: "Russian" },
  { code: "zh-CN", name: "Chinese (Simplified)" }, // Chinese Simplified
  { code: "zh-TW", name: "Chinese (Traditional)" }, // Chinese Traditional
  { code: "ar-SA", name: "Arabic" }, // Arabic (Saudi Arabia)a
  { code: "es-ES", name: "Spanish (Spain)" }, // Spanish (Spain)
  { code: "es-MX", name: "Spanish (Mexico)" }, // Spanish (Mexico)
];


  useEffect(() => {
    
    // Load available voices
    const loadVoices = () => {
      const availableVoices = window.speechSynthesis.getVoices();
      setVoices(availableVoices);
    };

    if (typeof window !== "undefined" && window.speechSynthesis) {
      window.speechSynthesis.onvoiceschanged = loadVoices;
      loadVoices();
    }

    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      console.error("Speech Recognition API not supported in this browser.");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = selectedLanguage;
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
      if (listening && recognitionRef.current) {
        recognitionRef.current.start(); // Restart recognition only if listening
        
      }
    };

    if(!temp){
      recognitionRef.current = recognition;
      settemp(true);
    }

  }, [listening, selectedLanguage]);

  const handleVoiceInput = async (input) => {
    const command = input.toLowerCase().trim();
  
    // Handle "Open Website [url]" commands
    if (command.startsWith("open website")) {
      const query = command.replace("open website", "").trim();
      if (query) {
        let url = query;
        if (!url.startsWith("http://") && !url.startsWith("https://")) {
          url = `https://www.google.com/search?q=${encodeURIComponent(url)}`;
        }
        window.open(url, "_blank");
        const botMessage = { text: `Opening ${url}`, sender: "bot" };
        setMessages((prev) => [...prev, botMessage]);
        speak(botMessage.text);
      } else {
        const errorMessage = "Please specify a valid website after 'Open Website'.";
        const botMessage = { text: errorMessage, sender: "bot" };
        setMessages((prev) => [...prev, botMessage]);
        speak(errorMessage);
      }
      return;
    }
  
    // Handle "What's the date" or "What's the time" commands
    if (command.includes("date") || command.includes("time") || command.includes("today")) {
      const now = new Date();
      const currentDateTime = `The current date and time is: ${now.toLocaleString()}`;
      const botMessage = { text: currentDateTime, sender: "bot" };
      setMessages((prev) => [...prev, botMessage]);
      speak(currentDateTime);
      return;
    }
  
    // GPT Response
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

      // Replace "OpenAI" and "ChatGPT" with "Anna"
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
    if (!window.speechSynthesis) {
      console.error("SpeechSynthesis API not supported in this browser.");
      return;
    }
  
    window.speechSynthesis.cancel();
    isSpeakingRef.current = true;
  
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = selectedLanguage;
  
    // Prioritize female voices for the selected language
    const femaleVoices = voices.filter(
      (voice) =>
        voice.lang === selectedLanguage &&
        (voice.name.toLowerCase().includes("female") ||
          voice.name.toLowerCase().includes("woman") ||
          voice.name.toLowerCase().includes("soprano"))
    );
  
    // Select the first available female voice or fallback to any female voice
    const selectedVoice =
      femaleVoices.length > 0
        ? femaleVoices[0]
        : voices.find((voice) =>
            voice.name.toLowerCase().includes("female")
          );
  
    if (selectedVoice) {
      utterance.voice = selectedVoice;
      console.log(`Using voice: ${selectedVoice.name} (${selectedVoice.lang})`);
    } else {
      console.warn(`No female voice found. Defaulting to the first available voice.`);
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
  
  
  const stopListening = () => {
    if (listening && recognitionRef.current) {
      recognitionRef.current.onend = null; // Prevent automatic restart
      recognitionRef.current.stop(); // Stop speech recognition
      setListening(false); // Update listening state
      console.log("Stopped listening.");
    }
  };
  
  const startListening = () => {
    if (!listening && recognitionRef.current) {
      recognitionRef.current.lang = selectedLanguage; // Set the language
      recognitionRef.current.onend = () => {
        if (listening) {
          recognitionRef.current.start(); // Restart recognition only if listening
        }
      };
      recognitionRef.current.start(); // Start speech recognition
      setListening(true); // Update listening state
      console.log("Started listening.");
    }
  };
  
  const toggleListening = () => {
    if (listening) {
      stopListening(); // Stop listening
    } else {
      startListening(); // Start listening
    }
  };
  

  const toggleVoiceMode = () => {
    setVoiceMode((prev) => !prev);
    stopListening();
  };

  const handleInputSubmit = () => {
    if (userInput.trim()) {
      handleVoiceInput(userInput);
      setUserInput("");
    }
  };

  const handleLanguageChange = (e) => {
    setSelectedLanguage(e.target.value);
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
                placeholder="Type a question or command..."
                onKeyDown={(e) => e.key === "Enter" && handleInputSubmit()}
              />
              <button className="send-button" onClick={handleInputSubmit}>
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
