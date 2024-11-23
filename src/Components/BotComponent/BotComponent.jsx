import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom"; // For navigation
import axios from "axios";
import "./BotComponent.css";

function BotComponent() {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [speakingText, setSpeakingText] = useState("");
  const [detectedLanguage, setDetectedLanguage] = useState("en-US");
  const [voices, setVoices] = useState([]);
  const recognitionRef = useRef(null);
  const navigate = useNavigate(); // Navigation hook

  // Initialize speech recognition and voice options
  useEffect(() => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      console.error("Speech Recognition API not supported in this browser.");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = false;
    recognition.lang = detectedLanguage;

    // Handle speech input
    recognition.onresult = (event) => {
      const userMessage = event.results[event.results.length - 1][0].transcript;
      console.log("User message:", userMessage);

      // Add the user's message to the chat
      setMessages((prevMessages) => [
        ...prevMessages,
        { text: userMessage, sender: "user" },
      ]);

      // Check if the user said "add event"
      if (userMessage.toLowerCase().includes("add event")) {
        navigate("/event"); // Redirect to /event
      } else {
        fetchBotResponse(userMessage);
      }
    };

    recognition.onerror = (error) =>
      console.error("Speech recognition error:", error);

    recognitionRef.current = recognition;
    recognition.start();

    return () => recognition.stop();
  }, [detectedLanguage, navigate]);

  // Fetch bot response
  const fetchBotResponse = async (input) => {
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
            Authorization: `Bearer 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`, // Replace with your actual GPT Premium // Replace with your actual GPT Premium key
          },
        }
      );

      const botMessage =
        response.data.choices[0].message.content ||
        "Sorry, I couldn't process that.";
      setMessages((prevMessages) => [
        ...prevMessages,
        { text: botMessage, sender: "bot" },
      ]);

      speakText(botMessage);
    } catch (error) {
      console.error("Error fetching bot response:", error);
      setMessages((prevMessages) => [
        ...prevMessages,
        { text: "I'm facing some issues. Please try again later.", sender: "bot" },
      ]);
    } finally {
      setLoading(false);
    }
  };

  // Speak text using a female voice
  const speakText = (text) => {
    if (!window.speechSynthesis) {
      console.error("Speech Synthesis API not supported in this browser.");
      return;
    }

    const utterance = new SpeechSynthesisUtterance(text);

    // Set language and attempt to use a female voice
    utterance.lang = detectedLanguage;
    const femaleVoices = voices.filter((voice) =>
      voice.name.toLowerCase().includes("female")
    );
    if (femaleVoices.length > 0) {
      utterance.voice = femaleVoices[0];
    }

    setSpeakingText(text);
    utterance.onend = () => setSpeakingText("");
    window.speechSynthesis.speak(utterance);
  };

  // Load voices for the Speech Synthesis API
  useEffect(() => {
    const loadVoices = () => {
      const availableVoices = window.speechSynthesis.getVoices();
      setVoices(availableVoices);
    };

    window.speechSynthesis.onvoiceschanged = loadVoices;
    loadVoices();
  }, []);

  return (
    <div className="bot-container">
      <div className="bot-header">
        <h1>ANNA</h1>
        <p>Listening in {detectedLanguage}</p>
      </div>

      {speakingText && <div className="speaking-text">{speakingText}</div>}
      {loading && <p className="loading">Bot is thinking...</p>}
    </div>
  );
}

export default BotComponent;
