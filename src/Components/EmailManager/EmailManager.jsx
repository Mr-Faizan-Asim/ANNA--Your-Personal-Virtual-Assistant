import React, { useState, useEffect } from 'react';
import { useSupabaseClient, useSession } from '@supabase/auth-helpers-react';
import './EmailManager.css';

const EmailManager = () => {
  const [step, setStep] = useState(0);  // Tracks the current step
  const [userResponse, setUserResponse] = useState('');
  const [emails, setEmails] = useState([]);
  const session = useSession();
  const supabase = useSupabaseClient();

  // Google Sign In Function (with Gmail Scopes)
  const googleSignIn = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        scopes: 'https://www.googleapis.com/auth/gmail.readonly', // Gmail read-only access
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

  // Fetch Emails using Gmail API
  const fetchEmails = async () => {
    try {
      const response = await fetch('https://www.googleapis.com/gmail/v1/users/me/messages', {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${session.provider_token}`,
        },
      });
      const data = await response.json();
      if (data.messages) {
        // Fetch email details for each message
        const emailDetails = await Promise.all(
          data.messages.map(async (message) => {
            const messageDetails = await fetch(
              `https://www.googleapis.com/gmail/v1/users/me/messages/${message.id}`,
              {
                method: 'GET',
                headers: {
                  Authorization: `Bearer ${session.provider_token}`,
                },
              }
            );
            return await messageDetails.json();
          })
        );
        setEmails(emailDetails);
      } else {
        alert('No emails found!');
      }
    } catch (error) {
      console.error('Error fetching emails:', error);
      alert('Error fetching emails.');
    }
  };

  // Chat UI Flow
  const renderChat = () => {
    switch (step) {
      case 0:
        return (
          <div>
            <p>Welcome! Would you like to access your emails?</p>
            <button onClick={() => { fetchEmails(); setStep(step + 1); }}>Yes, show my emails</button>
            <button onClick={signOut}>Sign Out</button>
          </div>
        );
      case 1:
        return (
          <div>
            <p>Your recent emails:</p>
            {emails.length > 0 ? (
              <ul>
                {emails.map((email, index) => (
                  <li key={index}>
                    <p><strong>From:</strong> {email.payload.headers.find(h => h.name === 'From').value}</p>
                    <p><strong>Subject:</strong> {email.payload.headers.find(h => h.name === 'Subject').value}</p>
                    <p><strong>Snippet:</strong> {email.snippet}</p>
                  </li>
                ))}
              </ul>
            ) : (
              <p>No emails to display.</p>
            )}
            <button onClick={signOut}>Sign Out</button>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="google-email-integration">
      {session ? (
        <>
          <h2>Welcome, {session.user.email}</h2>
          {renderChat()}
        </>
      ) : (
        <button className="sign-in-btn" onClick={googleSignIn}>
          Sign In with Google
        </button>
      )}
    </div>
  );
};

export default EmailManager;
