import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { useSupabaseClient, useSession } from "@supabase/auth-helpers-react";
import "./BotComponent.css";
import "./GoogleCalendarIntegration.css";
import Waveform from "../WaveForm/Waveform.jsx";

function TempWork() {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [listening, setListening] = useState(false);
  const [step, setStep] = useState(0);
  const [eventName, setEventName] = useState("");
  const [eventDescription, setEventDescription] = useState("");
  const [start, setStart] = useState(new Date());
  const [end, setEnd] = useState(new Date());
  const [userResponse, setUserResponse] = useState("");

  const controllerRef = useRef(null);
  const recognitionRef = useRef(null);
  const voicesRef = useRef([]);
  const session = useSession();
  const supabase = useSupabaseClient();

  // Load Voices and Speech Recognition
  useEffect(() => {
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
    recognition.lang = "en-US";

    recognition.onresult = (event) => {
      const userMessage = event.results[event.results.length - 1][0].transcript;
      addMessage(userMessage, "user");
      recognition.stop();
      handleVoiceCommand(userMessage);
    };

    recognition.onerror = (event) => {
      console.error("Speech recognition error:", event.error);
      setListening(false);
    };

    recognition.onend = () => setListening(false);

    recognitionRef.current = recognition;
  }, []);

  const addMessage = (text, sender) => {
    setMessages((prev) => [...prev, { text, sender, timestamp: new Date() }]);
  };

  const speak = (text, lang = "en-US") => {
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    const voice = voicesRef.current.find((v) => v.lang === lang);
    if (voice) {
      utterance.voice = voice;
    }
    utterance.lang = lang;
    utterance.rate = 1;
    utterance.pitch = 1;
    window.speechSynthesis.speak(utterance);
  };

  const handleVoiceCommand = (input) => {
    const lowerInput = input.toLowerCase();

    if (lowerInput.includes("sign in")) {
      googleSignIn();
      speak("Signing you in to Google Calendar.", "en-US");
    } else if (lowerInput.includes("create event")) {
      speak("What is the name of the event?", "en-US");
      setStep(0);
    } else if (lowerInput.includes("event description")) {
      speak("Please provide a description for your event.", "en-US");
      setStep(1);
    } else if (lowerInput.includes("event start time")) {
      speak(
        "When does the event start? Please say the date and time.",
        "en-US"
      );
      setStep(2);
    } else if (lowerInput.includes("event end time")) {
      speak(
        "When does the event end? Please say the date and time.",
        "en-US"
      );
      setStep(3);
    } else if (lowerInput.includes("create calendar event")) {
      createCalendarEvent();
    } else {
      speak("I'm sorry, I didn't understand that. Can you repeat?", "en-US");
    }
  };

  // Google Calendar Functions
  const googleSignIn = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { scopes: "https://www.googleapis.com/auth/calendar" },
    });
    if (error) {
      alert("Error signing in to Google Calendar.");
      console.error(error);
    }
  };

  const createCalendarEvent = async () => {
    const event = {
      summary: eventName,
      description: eventDescription,
      start: {
        dateTime: start.toISOString(),
        timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      },
      end: {
        dateTime: end.toISOString(),
        timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      },
    };

    try {
      const response = await fetch(
        "https://www.googleapis.com/calendar/v3/calendars/primary/events",
        {
          method: "POST",
          headers: {
            Authorization: "Bearer " + session.provider_token,
          },
          body: JSON.stringify(event),
        }
      );

      const data = await response.json();
      speak("Your event has been created successfully.", "en-US");
      alert("Event created: " + data.summary);
    } catch (error) {
      console.error("Error creating event:", error);
      speak("I couldn't create the event. Please try again.", "en-US");
    }
  };

  const handleStartListening = () => {
    window.speechSynthesis.cancel();
    setListening(true);
    recognitionRef.current.start();
  };

  const handleStopListening = () => {
    setListening(false);
    recognitionRef.current.stop();
  };

  return (
    <div className="bot-component google-calendar-integration">
      <div className="dynamic-text">
        <div className="anna-repeater">
          <h1 className="anna-title">ANNA</h1>
        </div>
      </div>

      <div className="chat-box">
        {messages.map((message, index) => (
          <div
            key={index}
            className={
              message.sender === "user" ? "user-message" : "bot-message"
            }
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

export default TempWork;
