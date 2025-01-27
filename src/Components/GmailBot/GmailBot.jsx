import React, { useState, useEffect } from "react";
import { useSupabaseClient, useSession } from "@supabase/auth-helpers-react";
import "./GmailBot.css";

const GmailBot = () => {
  const [emails, setEmails] = useState([]);
  const [processedEmailIds, setProcessedEmailIds] = useState(new Set());
  const [currentEmailIndex, setCurrentEmailIndex] = useState(0);
  const [loading, setLoading] = useState(false); // Default: False until fetching starts
  const session = useSession();
  const supabase = useSupabaseClient();

  useEffect(() => {
    if (session) {
      fetchEmails();
    }
  }, [session]);

  const stopSpeech = () => {
    window.speechSynthesis.cancel();
  };

  const speakEmailContent = (email) => {
    if (!email) return;

    stopSpeech();

    const utterance = new SpeechSynthesisUtterance(
      `Email from: ${email.from}. Subject: ${email.subject}. Content: ${email.snippet}.`
    );
    utterance.lang = "en-US";
    window.speechSynthesis.speak(utterance);
  };

  const googleSignIn = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        scopes:
          "https://www.googleapis.com/auth/gmail.readonly https://www.googleapis.com/auth/gmail.send",
      },
    });
    if (error) {
      alert("Error logging in to Google provider with Supabase");
      console.error(error);
    }
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setEmails([]);
    setProcessedEmailIds(new Set());
    setCurrentEmailIndex(0);
    stopSpeech();
  };

  const fetchEmails = async () => {
    setLoading(true);
    try {
      const response = await fetch(
        `https://www.googleapis.com/gmail/v1/users/me/messages?q=is:unread&maxResults=10`,
        {
          headers: {
            Authorization: `Bearer ${session.provider_token}`,
          },
        }
      );

      const data = await response.json();
      if (data.messages) {
        const emailPromises = data.messages
          .filter((message) => !processedEmailIds.has(message.id))
          .map((message) =>
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
          return { subject, from, snippet, id: emailData.id };
        });
        const newEmails = await Promise.all(formattedEmails);
        setEmails(newEmails);

        setProcessedEmailIds((prev) => {
          const updatedSet = new Set(prev);
          newEmails.forEach((email) => updatedSet.add(email.id));
          return updatedSet;
        });
      } else {
        setEmails([]);
      }
    } catch (error) {
      console.error("Error fetching emails", error);
    }
    setLoading(false);
  };

  const generateBotResponse = (snippet) => {
    if (snippet.toLowerCase().includes("chef")) {
      return {
        subject: "Your Personal Chef in Rome",
        body: `
          Although I did not know English well (like most Italians), I made myself understood and appreciated, as you can see from the reviews and I will tell you more I was also included on Tripadvisor among the Best "World" Gastronomic Experiences and I am the fourth in the world.

* ATTENTION: CONTACT ME FIRST ! Especially for special requests.

Seeking the most authentic Roman cuisine?

Want to surprise your significant other or celebrate a special occasion?!

Whether you’d like to help side-by-side prepare the meal with me, your personal chef, or you’d like to walk through the door to find a fully prepared dinner waiting for you, I will be happy to accommodate your request. No matter how small or unequipped the kitchen is at your place!

The experience requires no effort on your part. From shopping to prep to cleaning up afterwards, I’ll take care of everything and will make sure this will be one of the most memorable food experiences during your Roman Holiday.

Savour a traditional 4-course Roman meal prepared by your personal chef. Start the feast with an antipasto, followed by a classic pasta course, and then traditional Roman meat course. End the evening on a sweet note with a traditional crowd pleaser, tiramisù.

The whole meal can be accompanied by an excellent bottle of Italian wine upon request.

Yes ! Vegetarians
Yes ! Vegans
Yes ! Celiacs
        `,
      };
    } else if (snippet.toLowerCase().includes("tourist")) {
      return {
        subject: "Bespoke Tourist Experiences in Rome",
        body: `
          I organize bespoke tourist experiences in Rome, designed to offer a unique and personal connection to the Eternal City. My activities include Personal Shopping, Photo Shooting, Video Shooting, Chef at Home services, and immersive Food Tours. Each experience is carefully curated to reflect Rome’s vibrant culture, rich history, and exquisite culinary traditions.

For fashion lovers, my Personal Shopper service takes guests through Rome's best boutiques, hidden artisan shops, and luxury stores, offering a tailored shopping experience. For those who want to capture their Roman adventure, my Photo and Video Shooting services ensure professional-quality memories set against the city’s iconic landmarks.

Food enthusiasts can enjoy my Chef at Home service, where I prepare traditional Roman dishes directly at the comfort of their accommodation, sharing cooking techniques and stories about the recipes. Alternatively, my Food Tours lead guests on a delicious journey through Rome’s best markets, trattorias, and hidden culinary gems.

These experiences are not just about sightseeing; they are about connecting with Rome’s authentic soul. My mission is to ensure that each guest feels like a local, enjoying the city’s treasures in a relaxed, engaging, and unforgettable way.
        `,
      };
    }
    return { subject: "Thank You", body: `"Hey, this is Carlo! I'll make sure to get back to you as soon as I can. Thanks for your Message` };
  };

  const encodeToBase64 = (str) => {
    return btoa(unescape(encodeURIComponent(str)));
  };

  const sendBotReply = async () => {
    const currentEmail = emails[currentEmailIndex];
    if (!currentEmail) return;

    const { subject, body } = generateBotResponse(currentEmail.snippet);

    try {
      const rawMessage = encodeToBase64(
        `To: ${currentEmail.from}\nSubject: ${subject}\n\n${body}`
      );
      await fetch(
        `https://www.googleapis.com/gmail/v1/users/me/messages/send`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${session.provider_token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ raw: rawMessage }),
        }
      );
      alert("Anna's reply sent successfully!");
    } catch (error) {
      console.error("Error sending Anna's reply", error);
    }
  };

  const moveToNextEmail = () => {
    if (currentEmailIndex < emails.length - 1) {
      setCurrentEmailIndex((prev) => prev + 1);
    } else {
      console.log("No more emails to display.");
    }
  };

  useEffect(() => {
    speakEmailContent(emails[currentEmailIndex]);
  }, [currentEmailIndex, emails]);

  const currentEmail = emails[currentEmailIndex];

  if (!session) {
    // Display Sign-In Page if User is Not Logged In
    return (
      <div className="gmail-container">
        <div className="sign-in-container">
          <h1 className="gmail-title">Anna's Gmail Assistant</h1>
          <button onClick={googleSignIn} className="gmail-button login-button">
            Sign in with Google
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="gmail-container">
      {loading ? (
        <div className="loading-container">
          <div className="animated-waves">
            <div className="wave wave1"></div>
            <div className="wave wave2"></div>
            <div className="wave wave3"></div>
          </div>
          <p>Loading Emails...</p>
        </div>
      ) : (
        <div className="gmail-content">
          <h1 className="gmail-title">Anna's Gmail Assistant</h1>
          <div className="gmail-actions">
            <button onClick={signOut} className="gmail-button signout-button">
              Sign Out
            </button>
            <button onClick={fetchEmails} className="gmail-button fetch-button">
              Fetch Emails
            </button>
          </div>
          {emails.length > 0 ? (
            <div className="email-display">
              <div className="email-details">
                <h2 className="email-title">Current Email:</h2>
                <p>
                  <strong>From:</strong> {currentEmail?.from}
                </p>
                <p>
                  <strong>Subject:</strong> {currentEmail?.subject}
                </p>
                <p>
                  <strong>Content:</strong> {currentEmail?.snippet}
                </p>
              </div>
              <div className="email-actions">
                <button
                  className="gmail-button reply-button"
                  onClick={sendBotReply}
                >
                  Send Reply
                </button>
                <button
                  className="gmail-button next-button"
                  onClick={moveToNextEmail}
                >
                  Next Email
                </button>
              </div>
            </div>
          ) : (
            <p className="no-emails-message">No recent emails found.</p>
          )}
        </div>
      )}
    </div>
  );
};

export default GmailBot;
