import React, { useState, useEffect, useRef } from "react";
import VoiceInterface from "../VoiceInterface/VoiceInterface";
import "./BotComponent.css";

const API_KEY = "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";

const BotComponent = () => {
  const [messages, setMessages] = useState([
    { text: "Hello, I am Anna. How can I assist you today?", sender: "bot" },
  ]);
  const [userInput, setUserInput] = useState("");
  const [listening, setListening] = useState(false);
  const recognitionRef = useRef(null);
  const isSpeakingRef = useRef(false);
  const [voiceMode, setVoiceMode] = useState(false);

  useEffect(() => {
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
    const command = input.toLowerCase().trim();

    // Handle "Open Website [url]" commands
    if (command.startsWith("open website")) {
      const query = command.replace("open website", "").trim();
      if (query) {
        let url = query;
        if (!url.startsWith("http://") && !url.startsWith("https://")) {
          url = `https://www.google.com/search?q=${url}`;
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
      const botMessageText = data.choices[0]?.message?.content || "I'm sorry, I didn't understand that.";
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
    utterance.lang = "en-US";

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
      handleVoiceInput(userInput);
      setUserInput("");
    }
  };

  return (
    <div className="bot-container">
      {!voiceMode ? (
        <>
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
                placeholder="Type a question or command..."
                onKeyDown={(e) => e.key === "Enter" && handleInputSubmit()}
              />
              <button className="send-button" onClick={handleInputSubmit}>
                ➤
              </button>
              <button className="send-button" onClick={toggleVoiceMode}>
                🎤
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
