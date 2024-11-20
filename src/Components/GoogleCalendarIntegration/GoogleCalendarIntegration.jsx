import React, { useState, useEffect, useRef } from 'react';
import DateTimePicker from 'react-datetime-picker';
import { useSupabaseClient, useSession } from '@supabase/auth-helpers-react';
import './GoogleCalendarIntegration.css';

const GoogleCalendarIntegration = () => {
  const [start, setStart] = useState(new Date());
  const [end, setEnd] = useState(new Date());
  const [eventName, setEventName] = useState('');
  const [eventDescription, setEventDescription] = useState('');
  const [startCalendarOpen, setStartCalendarOpen] = useState(false);
  const [endCalendarOpen, setEndCalendarOpen] = useState(false);

  const session = useSession();
  const supabase = useSupabaseClient();

  // Refs to track the date pickers
  const startPickerRef = useRef(null);
  const endPickerRef = useRef(null);

  // Close date picker on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        startPickerRef.current &&
        !startPickerRef.current.contains(event.target)
      ) {
        setStartCalendarOpen(false);
      }
      if (
        endPickerRef.current &&
        !endPickerRef.current.contains(event.target)
      ) {
        setEndCalendarOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

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

  const signOut = async () => {
    await supabase.auth.signOut();
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

  return (
    <div className="google-calendar-integration">
      {session ? (
        <>
          <h2>Welcome, {session.user.email}</h2>
          <div className="datetime-pickers">
            <div className="datetime-picker" ref={startPickerRef}>
              <label>Start of your event</label>
              <DateTimePicker
                onChange={setStart}
                value={start}
                disableClock={true}
                calendarOpen={startCalendarOpen}
                onCalendarOpen={() => setStartCalendarOpen(true)}
                onCalendarClose={() => setStartCalendarOpen(false)}
                className="date-time-input"
              />
            </div>
            <div className="datetime-picker" ref={endPickerRef}>
              <label>End of your event</label>
              <DateTimePicker
                onChange={setEnd}
                value={end}
                disableClock={true}
                calendarOpen={endCalendarOpen}
                onCalendarOpen={() => setEndCalendarOpen(true)}
                onCalendarClose={() => setEndCalendarOpen(false)}
                className="date-time-input"
              />
            </div>
          </div>
          <label>Event Name</label>
          <input
            type="text"
            value={eventName}
            onChange={(e) => setEventName(e.target.value)}
            placeholder="Enter event name"
            className="input-box"
          />
          <label>Event Description</label>
          <input
            type="text"
            value={eventDescription}
            onChange={(e) => setEventDescription(e.target.value)}
            placeholder="Enter event description"
            className="input-box"
          />
          <div className="button-group">
            <button className="create-event-btn" onClick={createCalendarEvent}>
              Create Calendar Event
            </button>
            <button className="sign-out-btn" onClick={signOut}>
              Sign Out
            </button>
          </div>
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
