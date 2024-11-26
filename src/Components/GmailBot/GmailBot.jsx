import React, { useState, useEffect } from "react";
import { useSupabaseClient, useSession } from "@supabase/auth-helpers-react";

const GmailBot = () => {
  const [emails, setEmails] = useState([]);
  const [currentEmailIndex, setCurrentEmailIndex] = useState(0);
  const [botResponse, setBotResponse] = useState("");
  const [userAction, setUserAction] = useState(null); // Tracks if bot or user responds
  const session = useSession();
  const supabase = useSupabaseClient();

  useEffect(() => {
    if (session) {
      fetchEmails();
    }
  }, [session]);

  // Google Sign In Function
  const googleSignIn = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        scopes: "https://www.googleapis.com/auth/gmail.readonly",
      },
    });
    if (error) {
      alert("Error logging in to Google provider with Supabase");
      console.error(error);
    }
  };

  // Sign Out Function
  const signOut = async () => {
    await supabase.auth.signOut();
    setEmails([]);
    setCurrentEmailIndex(0);
    setBotResponse("");
    setUserAction(null);
  };

  // Fetch recent emails (last 3 hours)
  const fetchEmails = async () => {
    try {
      const threeHoursAgo = Math.floor(Date.now() / 1000) - 3 * 60 * 60; // Timestamp for 3 hours ago
      const response = await fetch(
        `https://www.googleapis.com/gmail/v1/users/me/messages?q=after:${threeHoursAgo}&maxResults=10`,
        {
          headers: {
            Authorization: `Bearer ${session.provider_token}`,
          },
        }
      );

      const data = await response.json();
      if (data.messages) {
        const emailPromises = data.messages.map((message) =>
          fetch(
            `https://www.googleapis.com/gmail/v1/users/me/messages/${message.id}`,
            {
              headers: {
                Authorization: `Bearer ${session.provider_token}`,
              },
            }
          )
        );
        const emailResults = await Promise.all(emailPromises);
        const formattedEmails = emailResults.map(async (emailRes) => {
          const emailData = await emailRes.json();
          const headers = emailData.payload.headers;
          const subject = headers.find((header) => header.name === "Subject")?.value;
          const from = headers.find((header) => header.name === "From")?.value;
          const snippet = emailData.snippet;
          return { subject, from, snippet };
        });
        setEmails(await Promise.all(formattedEmails));
      } else {
        setEmails([]);
      }
    } catch (error) {
      console.error("Error fetching emails", error);
    }
  };

  // Generate bot's response
  const generateBotResponse = () => {
    const currentEmail = emails[currentEmailIndex];
    if (!currentEmail) return;

    if (currentEmail.snippet.toLowerCase().includes("chef")) {
      return `
        Although I did not know English well (like most Italians), I made myself understood and appreciated, as you can see from the reviews...
      `;
    } else if (currentEmail.snippet.toLowerCase().includes("tourist")) {
      return `
        I organize bespoke tourist experiences in Rome, designed to offer a unique and personal connection to the Eternal City...
      `;
    } else {
      return "This email doesn't match the required criteria.";
    }
  };

  // Handle bot or manual reply decision
  const handleReplyDecision = (decision) => {
    setUserAction(decision);
    if (decision === "bot") {
      setBotResponse(generateBotResponse());
    }
  };

  // Move to the next email
  const handleNextEmail = () => {
    if (currentEmailIndex < emails.length - 1) {
      setCurrentEmailIndex(currentEmailIndex + 1);
      setBotResponse("");
      setUserAction(null);
    }
  };

  const currentEmail = emails[currentEmailIndex];

  return (
    <div style={{ padding: "20px", fontFamily: "Arial, sans-serif" }}>
      <h1>Gmail Bot with Supabase</h1>
      {!session ? (
        <button
          onClick={googleSignIn}
          style={{ padding: "10px 20px", marginTop: "20px" }}
        >
          Sign in with Google
        </button>
      ) : (
        <>
          <button
            onClick={signOut}
            style={{ padding: "10px 20px", marginTop: "20px" }}
          >
            Sign Out
          </button>
          <button
            onClick={fetchEmails}
            style={{ padding: "10px 20px", margin: "20px 0" }}
          >
            Fetch Recent Emails
          </button>
          {emails.length > 0 ? (
            <>
              <div>
                <h2>Current Email:</h2>
                <p><strong>From:</strong> {currentEmail?.from}</p>
                <p><strong>Subject:</strong> {currentEmail?.subject}</p>
                <p><strong>Content:</strong> {currentEmail?.snippet}</p>
              </div>
              {!userAction ? (
                <div>
                  <p>Should the bot respond to this email?</p>
                  <button
                    onClick={() => handleReplyDecision("bot")}
                    style={{ padding: "10px 20px", margin: "10px 10px 0 0" }}
                  >
                    Let Bot Reply
                  </button>
                  <button
                    onClick={() => handleReplyDecision("manual")}
                    style={{ padding: "10px 20px", margin: "10px 0" }}
                  >
                    I'll Reply Manually
                  </button>
                </div>
              ) : userAction === "bot" ? (
                <div>
                  <h2>Bot's Response:</h2>
                  <p>{botResponse}</p>
                </div>
              ) : (
                <p>You chose to reply manually.</p>
              )}
              <button
                onClick={handleNextEmail}
                style={{ padding: "10px 20px", marginTop: "10px" }}
              >
                Next Email
              </button>
            </>
          ) : (
            <p>No recent emails found.</p>
          )}
        </>
      )}
    </div>
  );
};

export default GmailBot;
