import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom"; // Import useNavigate
import { supabase } from "../../supabaseClient";
import "./BotComponent.css";

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
  const [schedulingMeeting, setSchedulingMeeting] = useState(false);
  const [meetingDetails, setMeetingDetails] = useState({
    name: "",
    date: "",
    time: "",
  });
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
      handleSpeechInput(transcript);
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

  const handleSpeechInput = async (input) => {
    if (schedulingMeeting) {
      processMeetingDetails(input);
      return;
    }
    if (input.toLowerCase().includes("schedule a meeting")) {
      setSchedulingMeeting(true);
      speak("Sure! What is the name of the meeting?");
      return;
    }
    if (input.toLowerCase().includes("list my meetings")) {
      await listMeetings();
      return;
    }

    handleSendMessage(input);
  };

  const processMeetingDetails = async (input) => {
    if (!meetingDetails.name) {
      setMeetingDetails((prev) => ({ ...prev, name: input }));
      speak("Got it. When is the meeting? Please provide the date.");
      return;
    }
    if (!meetingDetails.date) {
      setMeetingDetails((prev) => ({ ...prev, date: input }));
      speak("What time is the meeting?");
      return;
    }
    if (!meetingDetails.time) {
      setMeetingDetails((prev) => ({ ...prev, time: input }));
      await saveMeeting();
      setSchedulingMeeting(false);
      setMeetingDetails({ name: "", date: "", time: "" });
    }
  };

  const saveMeeting = async () => {
    const { name, date, time } = meetingDetails;
    const { error } = await supabase
      .from("meetings")
      .insert([{ name, date, time }]);

    if (error) {
      console.error("Error saving meeting:", error);
      speak("I couldn't save the meeting. Please try again.");
    } else {
      speak("Your meeting has been scheduled successfully!");
    }
  };

  const listMeetings = async () => {
    const { data, error } = await supabase
      .from("meetings")
      .select("*")
      .order("date", { ascending: true });

    if (error) {
      console.error("Error fetching meetings:", error);
      speak("I couldn't fetch your meetings. Please try again.");
    } else if (data.length === 0) {
      speak("You don't have any scheduled meetings.");
    } else {
      const meetingList = data
        .map((meeting) => `${meeting.name} on ${meeting.date} at ${meeting.time}`)
        .join(", ");
      speak(`Here are your meetings: ${meetingList}`);
    }
  };

  const handleSendMessage = async (input) => {
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

      stopListening();
      speak(botMessageText);
    } catch (error) {
      console.error("Error during API call:", error);
      const errorMessage = "Sorry, something went wrong. Please try again.";
      const botMessage = { text: errorMessage, sender: "bot" };
      setMessages((prev) => [...prev, botMessage]);
      stopListening();
      speak(errorMessage);
    }
  };

  const speak = (text) => {
    if (!window.speechSynthesis) {
      console.error("SpeechSynthesis API not supported in this browser.");
      return;
    }

    isSpeakingRef.current = true;
    stopListening();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "en-US";

    const selectedVoice =
      voices.find((voice) => voice.name.includes("Google UK English Female")) ||
      voices[0];
    utterance.voice = selectedVoice;

    utterance.onerror = (e) => {
      console.error("Speech synthesis error:", e.error);
    };

    utterance.onend = () => {
      isSpeakingRef.current = false;
      startListening();
    };

    window.speechSynthesis.speak(utterance);
  };

  const startListening = () => {
    if (!listening && !isSpeakingRef.current) {
      setListening(true);
      recognitionRef.current.start();
    }
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

  const handleInputSubmit = () => {
    if (userInput.trim()) {
      handleSendMessage(userInput);
      setUserInput("");
    }
  };

  return (
    <div className="bot-container">
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
        <div className="status-container">
          <span className="status-dot"></span>
          <span className="status">
            {listening ? "Listening..." : "Click the mic to start"}
          </span>
        </div>
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
          <button className="mic-button" onClick={toggleListening}>
            {listening ? "Stop" : "Start"}
          </button>
           {/* Navigation Button */}
        <button className="mic-button" onClick={() => navigate("/annamail")}>
          Go to AnnaMail
        </button>
        </div>
      </div>
    </div>
  );
}

export default BotComponent;
