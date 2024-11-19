import React, { useState, useEffect } from "react";
import { GoogleLogin } from "@react-oauth/google";
import "./GoogleCalendarIntegration.css";

// Define your API key, client ID, and scopes
const CLIENT_ID =
  "1003847576572-81o93k5rndnlq8ljcr56vqhv8k639c9h.apps.googleusercontent.com";
const API_KEY = "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";
const SCOPES = "https://www.googleapis.com/auth/calendar.events";

const GoogleCalendarIntegration = () => {
  const [isSignedIn, setIsSignedIn] = useState(false);
  const [authToken, setAuthToken] = useState(null);

  // Initialize the Google API client
  useEffect(() => {
    const initializeGoogleClient = async () => {
      // Load Google Identity Services and API client
      await window.google.accounts.id.initialize({
        client_id: CLIENT_ID,
        callback: (response) => {
          if (response.credential) {
            setAuthToken(response.credential);
            setIsSignedIn(true);
          }
        },
      });

      // Load the Google Calendar API client
      window.gapi.load("client:auth2", () => {
        window.gapi.client
          .init({
            apiKey: API_KEY,
            clientId: CLIENT_ID,
            scope: SCOPES,
          })
          .then(() => {
            console.log("Google API client initialized successfully.");
          })
          .catch((error) => {
            console.error("Error initializing Google API client:", error);
          });
      });
    };

    // Call the initialization function
    if (window.google && window.gapi) {
      initializeGoogleClient();
    }
  }, []);

  // Handle sign-in success
  const handleSignInSuccess = (response) => {
    console.log("Sign-in successful:", response);
    setAuthToken(response.credential);
    setIsSignedIn(true);
  };

  // Handle sign-out
  const handleSignOut = () => {
    setAuthToken(null);
    setIsSignedIn(false);
    window.google.accounts.id.disableAutoSelect();
    console.log("User signed out.");
  };

  const handleAddEvent = () => {
    console.log("Adding event..."); // Debugging line to ensure function is being called

    const event = {
      summary: "New Meeting", // Event Title
      description: "Discuss project updates", // Event Description
      start: {
        dateTime: "2024-12-06T08:00:00", // Updated start date and time
        timeZone: "Asia/Karachi", // Set the time zone
      },
      end: {
        dateTime: "2024-12-06T09:00:00", // End time is one hour after the start
        timeZone: "Asia/Karachi", // Set the time zone
      },
    };

    // Check if the Google API client is loaded and initialized
    if (!window.gapi || !window.gapi.client) {
      console.error("Google API client is not loaded.");
      alert("Google API client is not loaded.");
      return;
    }

    // Check if the user is signed in
    if (!authToken || !isSignedIn) {
      console.error("User is not signed in.");
      alert("Please sign in first.");
      return;
    }

    // Adding event to Google Calendar
    window.gapi.client
      .calendar.events.insert({
        calendarId: "primary",
        resource: event,
      })
      .then((response) => {
        console.log("Event added:", response);
        alert("Event added to Google Calendar!");
      })
      .catch((error) => {
        console.error("Error adding event:", error);
        alert("Failed to add event.");
      });
  };

  return (
    <div className="calendar-container">
      <h1>Google Calendar Integration</h1>
      {!isSignedIn ? (
        <GoogleLogin
          onSuccess={handleSignInSuccess}
          onError={(error) => console.error("Login failed:", error)}
        />
      ) : (
        <>
          <button onClick={handleSignOut} className="sign-out-button">
            Sign Out
          </button>
          <button onClick={handleAddEvent} className="add-event-button">
            Add Event to Calendar
          </button>
        </>
      )}
    </div>
  );
};

export default GoogleCalendarIntegration;
