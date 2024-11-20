import React, { useState, useEffect } from 'react';
import { useSupabaseClient, useSession } from '@supabase/auth-helpers-react';
import './GoogleCalendarIntegration.css';

const GoogleCalendarIntegration = () => {
  const [step, setStep] = useState(0);  // Tracks the current step
  const [eventName, setEventName] = useState('');
  const [eventDescription, setEventDescription] = useState('');
  const [start, setStart] = useState(new Date());
  const [end, setEnd] = useState(new Date());
  const [userResponse, setUserResponse] = useState('');
  const session = useSession();
  const supabase = useSupabaseClient();

  // Google Sign In Function
  const googleSignIn = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        scopes: 'https://www.googleapis.com/auth/calendar',
      },
    });
    if (error) {
      alert('Error logging in to Google provider with Supabase');
      console.error(error);
    }
  };

  // Sign Out Function
  const signOut = async () => {
    await supabase.auth.signOut();
  };

  // Move to next step and collect input
  const handleNextStep = () => {
    if (step === 0) {
      setEventName(userResponse);
    } else if (step === 1) {
      setEventDescription(userResponse);
    } else if (step === 2) {
      setStart(new Date(userResponse)); // Assuming user inputs a valid date string
    } else if (step === 3) {
      setEnd(new Date(userResponse)); // Assuming user inputs a valid date string
    }
    setUserResponse('');
    setStep(step + 1);
  };

  // Create the event in Google Calendar
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
      const response = await fetch('https://www.googleapis.com/calendar/v3/calendars/primary/events', {
        method: 'POST',
        headers: {
          Authorization: 'Bearer ' + session.provider_token,
        },
        body: JSON.stringify(event),
      });

      const data = await response.json();
      alert('Event created successfully: ' + data.summary);
    } catch (error) {
      console.error('Error creating event:', error);
      alert('Error creating event.');
    }
  };

  // Chat UI Flow
  const renderChat = () => {
    switch (step) {
      case 0:
        return (
          <div>
            <p>What is the name of the event?</p>
            <input
              type="text"
              value={userResponse}
              onChange={(e) => setUserResponse(e.target.value)}
              placeholder="Enter event name"
            />
            <button onClick={handleNextStep}>Next</button>
          </div>
        );
      case 1:
        return (
          <div>
            <p>Great! Now, please provide a description for your event.</p>
            <input
              type="text"
              value={userResponse}
              onChange={(e) => setUserResponse(e.target.value)}
              placeholder="Enter event description"
            />
            <button onClick={handleNextStep}>Next</button>
          </div>
        );
      case 2:
        return (
          <div>
            <p>When does the event start? Please enter the date and time (e.g., 2024-11-20T09:00).</p>
            <input
              type="datetime-local"
              value={userResponse}
              onChange={(e) => setUserResponse(e.target.value)}
            />
            <button onClick={handleNextStep}>Next</button>
          </div>
        );
      case 3:
        return (
          <div>
            <p>When does the event end? Please enter the date and time (e.g., 2024-11-20T10:00).</p>
            <input
              type="datetime-local"
              value={userResponse}
              onChange={(e) => setUserResponse(e.target.value)}
            />
            <button onClick={handleNextStep}>Next</button>
          </div>
        );
      case 4:
        return (
          <div>
            <p>Thank you! Let's create your event.</p>
            <button onClick={createCalendarEvent}>Create Event</button>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="google-calendar-integration">
      {session ? (
        <>
          <h2>Welcome, {session.user.email}</h2>
          {renderChat()}
          <button className="sign-out-btn" onClick={signOut}>
            Sign Out
          </button>
        </>
      ) : (
        <button className="sign-in-btn" onClick={googleSignIn}>
          Sign In with Google
        </button>
      )}
    </div>
  );
};

export default GoogleCalendarIntegration;
