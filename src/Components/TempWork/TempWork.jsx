import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { useSupabaseClient } from "@supabase/auth-helpers-react";
import { GoogleLogin } from '@react-oauth/google';
import "./BotComponent.css";
import Waveform from "../WaveForm/Waveform.jsx";

function BotComponent() {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [listening, setListening] = useState(false);
  const [language, setLanguage] = useState("en-US");
  const [eventStep, setEventStep] = useState(null);
  const [eventDetails, setEventDetails] = useState({
    name: "",
    description: "",
    start: null,
    end: null,
  });
  const [googleAccessToken, setGoogleAccessToken] = useState(
    localStorage.getItem("googleAccessToken") || null
  ); // Retrieve stored token
  const [userInput, setUserInput] = useState("");

  const supabase = useSupabaseClient();
  const controllerRef = useRef(null);
  const recognitionRef = useRef(null);

  // Google Sign-In Function
  const googleSignIn = async (response) => {
    const { credential } = response;
    if (credential) {
      setGoogleAccessToken(credential);
      localStorage.setItem("googleAccessToken", credential); // Save token locally
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          scopes: "https://www.googleapis.com/auth/calendar",
          redirectTo: window.location.href,
        },
      });

      if (error) {
        alert("Error logging in to Google provider with Supabase");
        console.error(error);
      } else {
        console.log("Google sign-in successful.");
      }
    }
  };

  // Sign Out Function
  const signOut = async () => {
    await supabase.auth.signOut();
    setGoogleAccessToken(null);
    localStorage.removeItem("googleAccessToken"); // Clear token locally
  };

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
    recognition.lang = language;

    recognition.onresult = (event) => {
      const userMessage = event.results[event.results.length - 1][0].transcript;
      processUserInput(userMessage);
    };

    recognition.onerror = (event) => {
      console.error("Speech recognition error:", event.error);
      setListening(false);
    };

    recognition.onend = () => {
      setListening(false);
    };

    recognitionRef.current = recognition;
  }, [language]);

  const speak = (text) => {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = language;
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
      const response = await axios.post(
        "https://api.openai.com/v1/chat/completions",
        {
          model: "gpt-4",
          messages: [{ role: "user", content: input }],
        },
        {
          headers: {
            Authorization: `Bearer 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`, // Replace with your actual GPT Premium // Replace with your actual GPT Premium key
           // Replace with your actual GPT key
          },
          signal,
        }
      );

      const botMessage = response.data.choices[0].message.content;
      const botMessageObj = {
        text: botMessage,
        sender: "bot",
        timestamp: new Date(),
      };
      setMessages((prevMessages) => [...prevMessages, botMessageObj]);
      speak(botMessage);
    } catch (error) {
      console.error("Error fetching bot response:", error);
      const errorMessage = "Sorry, I couldn't retrieve the answer. Please try again.";
      setMessages((prevMessages) => [
        ...prevMessages,
        { text: errorMessage, sender: "bot", timestamp: new Date() },
      ]);
      speak(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleStartListening = () => {
    window.speechSynthesis.cancel();
    setListening(true);
    recognitionRef.current.lang = language;
    recognitionRef.current.start();
  };

  const handleStopListening = () => {
    setListening(false);
    recognitionRef.current.stop();
  };

  const handleTextInputChange = (event) => {
    setUserInput(event.target.value);
  };

  const handleSendText = () => {
    if (userInput.trim()) {
      processUserInput(userInput.trim());
      setUserInput(""); // Clear input field after sending
    }
  };

  const createGoogleCalendarEvent = async () => {
    if (!googleAccessToken) {
      speak("Please log in with Google first.");
      return;
    }
  
    const { name, description, start, end } = eventDetails;
  
    if (!name || !description || !start || !end) {
      speak("Event details are incomplete. Please provide all required information.");
      console.log("Event details are incomplete:", eventDetails);
      return;
    }
  
    const event = {
      summary: name,
      description,
      start: {
        dateTime: start instanceof Date ? start.toISOString() : null,
        timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      },
      end: {
        dateTime: end instanceof Date ? end.toISOString() : null,
        timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      },
    };
  
    if (!event.start.dateTime || !event.end.dateTime) {
      speak("Invalid start or end date format. Please try again.");
      return;
    }
  
    try {
      const response = await fetch(
        "https://www.googleapis.com/calendar/v3/calendars/primary/events",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${googleAccessToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(event),
        }
      );
  
      const data = await response.json();
  
      if (response.ok) {
        const successMessage = `Event "${data.summary}" created successfully!`;
        setMessages((prevMessages) => [
          ...prevMessages,
          { text: successMessage, sender: "bot", timestamp: new Date() },
        ]);
        speak(successMessage);
      } else {
        throw new Error(data.error.message || "Failed to create event.");
      }
    } catch (error) {
      console.error("Error creating event:", error);
      const errorMessage = "Sorry, there was an error creating your event.";
      setMessages((prevMessages) => [
        ...prevMessages,
        { text: errorMessage, sender: "bot", timestamp: new Date() },
      ]);
      speak(errorMessage);
    } finally {
      setEventStep(null); // Reset the event creation process
    }
  };
  

  const processUserInput = (input) => {
    setMessages((prevMessages) => [
      ...prevMessages,
      { text: input, sender: "user", timestamp: new Date() },
    ]);
  
    if (eventStep !== null) {
      switch (eventStep) {
        case 0:
          setEventDetails((prev) => ({ ...prev, name: input }));
          setEventStep(1);
          speak("What is the description of the event?");
          break;
        case 1:
          // Ensure description is treated as plain text, not a date
          setEventDetails((prev) => ({ ...prev, description: input }));
          setEventStep(2);
          speak("When does the event start? Please provide the date and time (e.g., 2024-11-25 10:00).");
          break;
        case 2:
          const startDate = new Date(input);
          if (isNaN(startDate)) {
            speak("Invalid start date format. Try again (e.g., 2024-11-25 10:00).");
          } else {
            setEventDetails((prev) => ({ ...prev, start: startDate }));
            setEventStep(3);
            speak("When does the event end? Please provide the date and time.");
          }
          break;
        case 3:
          const endDate = new Date(input);
          const k = false;
          setTimeout(() => {
            if (eventDetails.name && eventDetails.description && eventDetails.start && eventDetails.end) {
              createGoogleCalendarEvent();
              console.log(eventDetails);
              setEventStep(null); 
              k = true;
            } 
          }, 5000);
          if(k){
            break;
          }
          if (isNaN(endDate)) {
            speak("Invalid end date format. Try again (e.g., 2024-11-25 15:00).");
          } else {
            console.log(endDate);
            setEventDetails((prev) => ({ ...prev, end: endDate }));
            console.log(eventDetails);// Reset step  
          }
          break;
        default:
          speak("Something went wrong. Let's start over.");
          setEventStep(0);
          break;
      }
      return;
    }
  
    if (input.toLowerCase().includes("add event")) {
      setEventStep(0);
      speak("What is the name of the event?");
    } else {
      fetchBotResponse(input);
    }
  };
  

  return (
    <div className="bot-component">
      <div className="messages">
        {messages.map((message, index) => (
          <div
            key={index}
            className={`message ${message.sender === "user" ? "user-message" : "bot-message"}`}
          >
            {message.text}
          </div>
        ))}
        {loading && <div className="loading">Typing...</div>}
      </div>
      <div className="controls">
        {listening ? (
          <button onClick={handleStopListening}>Stop Listening</button>
        ) : (
          <button onClick={handleStartListening}>Start Listening</button>
        )}
        <input
          type="text"
          value={userInput}
          onChange={handleTextInputChange}
          placeholder="Type your message"
        />
        <button onClick={handleSendText}>Send</button>
      </div>
      <div className="sign-in">
        {googleAccessToken ? (
          <button onClick={signOut}>Sign Out</button>
        ) : (
          <GoogleLogin
            onSuccess={googleSignIn}
            onError={() => {
              console.log("Login Failed");
            }}
          />
        )}
      </div>
      <Waveform />
    </div>
  );
}

export default BotComponent;
