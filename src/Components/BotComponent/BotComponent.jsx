import React, { useState } from "react";
import axios from "axios";
import "./BotComponent.css"; // Add your styling here

function BotComponent() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSendMessage = async () => {
    if (!input.trim()) return;

    const userMessage = { text: input, sender: "user", timestamp: new Date() };
    setMessages((prevMessages) => [...prevMessages, userMessage]);
    setInput("");

    setLoading(true);
    try {
      const response = await axios({
        url: "https://api.openai.com/v1/chat/completions", // OpenAI GPT-4 API Endpoint
        method: "post",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer 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`, // Replace with your actual GPT Premium Key
        },
        data: {
          model: "gpt-4", // GPT-4 model for better responses
          messages: [{ role: "user", content: input }],
        },
      });

      const botResponse = {
        text: response.data.choices[0].message.content, // Extracting GPT's response
        sender: "bot",
        timestamp: new Date(),
      };

      console.log(response.data.choices[0].message.content); // Debugging GPT output
      setMessages((prevMessages) => [...prevMessages, botResponse]);
    } catch (error) {
      console.error("Error fetching data:", error);

      const errorMessage = {
        text: "Sorry, I couldn't retrieve the answer. Please try again.",
        sender: "bot",
        timestamp: new Date(),
      };
      setMessages((prevMessages) => [...prevMessages, errorMessage]);
    }
    setLoading(false);
  };

  return (
    <div className="bot-component">
      <div className="chat-box">
        {messages.map((message, index) => (
          <div
            key={index}
            className={`message ${
              message.sender === "user" ? "user-message" : "bot-message"
            }`}
          >
            <div className="message-text">{message.text}</div>
            <div className="message-timestamp">
              {message.timestamp.toLocaleTimeString()}
            </div>
          </div>
        ))}
      </div>
      <div className="input-section">
        <input
          type="text"
          placeholder="Type your question here..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          className="input-field"
        />
        <button onClick={handleSendMessage} disabled={loading} className="send-button">
          {loading ? "Loading..." : "Send"}
        </button>
      </div>
    </div>
  );
}

export default BotComponent;
