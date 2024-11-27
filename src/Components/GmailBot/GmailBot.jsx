import React, { useState, useEffect } from "react";
import { useSupabaseClient, useSession } from "@supabase/auth-helpers-react";
import { he } from "date-fns/locale";

const GmailBot = () => {
  const [emails, setEmails] = useState([]);
  const [processedEmailIds, setProcessedEmailIds] = useState(new Set());
  const [currentEmailIndex, setCurrentEmailIndex] = useState(0);
  const session = useSession();
  const supabase = useSupabaseClient();

  useEffect(() => {
    if (session) {
      fetchEmails();
    }
  }, [session]);

  // Stop any ongoing speech before starting new speech
  const stopSpeech = () => {
    window.speechSynthesis.cancel();
  };

  // Speak the sender and content of the current email
  const speakEmailContent = (email) => {
    if (!email) return;

    stopSpeech();

    const utterance = new SpeechSynthesisUtterance(
      `Email from: ${email.from}. Subject: ${email.subject}. Content: ${email.snippet}.`
    );
    utterance.lang = "en-US";
    window.speechSynthesis.speak(utterance);
  };

  // Google sign-in function
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

  // Sign-out function
  const signOut = async () => {
    await supabase.auth.signOut();
    setEmails([]);
    setProcessedEmailIds(new Set());
    setCurrentEmailIndex(0);
    stopSpeech();
  };

  // Fetch unread emails from Gmail API
  const fetchEmails = async () => {
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
        Yes ! Celiacs
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
    return { subject: "No Relevant Response", body: "This email doesn't match the required criteria." };
  };

  // Encode response to Base64
  const encodeToBase64 = (str) => {
    return btoa(unescape(encodeURIComponent(str)));
  };

  // Send the bot reply to the current email
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
      alert("Anna reply sent successfully!");
    } catch (error) {
      console.error("Error sending Anna reply", error);
    }
  };

  // Move to the next email in the list
  const moveToNextEmail = () => {
    if (currentEmailIndex < emails.length - 1) {
      setCurrentEmailIndex((prev) => prev + 1);
      console.log("Moved to the next email.");
    } else {
      console.log("No more emails to display.");
    }
  };

  // Trigger speech for the current email when it changes
  useEffect(() => {
    speakEmailContent(emails[currentEmailIndex]);
  }, [currentEmailIndex, emails]);

  const currentEmail = emails[currentEmailIndex];

  return (
    <div style={styles.container}>
      <div style={styles.content}>
        <h1 style={styles.title}>Anna</h1>
        {!session ? (
          <button onClick={googleSignIn} style={styles.authButton}>
            Sign in with Google
          </button>
        ) : (
          <>
            <button onClick={signOut} style={styles.authButton}>
              Sign Out
            </button>
            <button onClick={fetchEmails} style={styles.fetchButton}>
              Fetch Recent Emails
            </button>
            {emails.length > 0 ? (
              <div style={styles.emailContainer}>
                <h2 style={{...styles.emailTitle, color:'black'}}>Current Email:</h2>
                <p style={{ color: 'black' }}>
                  <strong>From:</strong> {currentEmail?.from}
                </p>
                <p style={{ color: 'black' }}>
                  <strong color="black">Subject:</strong> {currentEmail?.subject}
                </p>
                <p style={{ color: 'black' }}>
                  <strong>Content:</strong> {currentEmail?.snippet}
                </p>
                <button onClick={sendBotReply} style={styles.replyButton}>
                  Send Anna Reply
                </button>
                <button onClick={moveToNextEmail} style={styles.nextButton}>
                  Next Email
                </button>
              </div>
            ) : (
              <p style={styles.noEmails}>No recent emails found.</p>
            )}
          </>
        )}
      </div>
    </div>
  );
};

const styles = {
  container: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    minHeight: "100vh",
    backgroundColor: "#f9f9f9",
    padding: "20px",
    height: "80%",
  },
  content: {
    backgroundColor: "#fff",
    borderRadius: "8px",
    boxShadow: "0 4px 10px rgba(0, 0, 0, 0.1)",
    padding: "30px",
    width: "100%",
    maxWidth: "600px",
    textAlign: "center",
  },
  title: {
    fontSize: "2rem",
    color: "#333",
    marginBottom: "20px",
  },
  authButton: {
    backgroundColor: "#4285F4",
    color: "#fff",
    padding: "12px 24px",
    border: "none",
    borderRadius: "4px",
    fontSize: "16px",
    cursor: "pointer",
    margin: "10px 0",
    transition: "all 0.3s ease",
    width: "100%",
  },
  fetchButton: {
    backgroundColor: "#34A853",
    color: "#fff",
    padding: "12px 24px",
    border: "none",
    borderRadius: "4px",
    fontSize: "16px",
    cursor: "pointer",
    margin: "10px 0",
    transition: "all 0.3s ease",
    width: "100%",
  },
  emailContainer: {
    marginTop: "20px",
    textAlign: "left",
  },
  emailTitle: {
    fontSize: "1.5rem",
    color: "black",
    marginBottom: "10px",
  },
  replyButton: {
    backgroundColor: "#FBBC05",
    color: "#fff",
    padding: "12px 24px",
    border: "none",
    borderRadius: "4px",
    fontSize: "16px",
    cursor: "pointer",
    margin: "10px 0",
    transition: "all 0.3s ease",
    width: "100%",
  },
  nextButton: {
    backgroundColor: "#FF4B4B",
    color: "#fff",
    padding: "12px 24px",
    border: "none",
    borderRadius: "4px",
    fontSize: "16px",
    cursor: "pointer",
    margin: "10px 0",
    transition: "all 0.3s ease",
    width: "100%",
  },
  noEmails: {
    color: "#777",
    fontSize: "1.1rem",
    marginTop: "20px",
  },
};

export default GmailBot;
