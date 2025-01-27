import React, { useState, useEffect } from "react";
import "./EmailManager.css";
import emailjs from "emailjs-com";

function EmailManager() {
  const [emails, setEmails] = useState([]);
  const [importantEmails, setImportantEmails] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Mock data for emails
    const fetchedEmails = [
      { id: 1, subject: "Meeting Reminder", isImportant: true },
      { id: 2, subject: "Event Invitation", isImportant: true },
      { id: 3, subject: "Newsletter Update", isImportant: false },
      { id: 4, subject: "Technical Issue Report", isImportant: true },
      { id: 5, subject: "Promotional Offer", isImportant: false },
    ];

    setEmails(fetchedEmails);
    setImportantEmails(fetchedEmails.filter((email) => email.isImportant));
  }, []);

  const autoReply = (email) => {
    const replyContent = `Dear Sender, \n\nThank you for your email regarding "${email.subject}". Anna has received your message and will respond soon.\n\nBest regards,\nAnna`;

    const emailParams = {
      to_name: "Sender Name",
      to_email: "sender@example.com",
      subject: "Re: " + email.subject,
      message: replyContent,
    };

    emailjs
      .send(
        "your_service_id", // Replace with your EmailJS service ID
        "your_template_id", // Replace with your EmailJS template ID
        emailParams,
        "your_user_id" // Replace with your EmailJS user ID
      )
      .then(
        (response) => {
          console.log("Auto-reply sent:", response);
          alert(`Auto-reply sent to "${email.subject}"`);
        },
        (error) => {
          console.error("Error sending auto-reply:", error);
        }
      );
  };

  return (
    <div className="email-manager">
      <h1>Anna Email Manager</h1>
      <div className="email-summary">
        <p>Total Emails: {emails.length}</p>
        <p>Important Emails: {importantEmails.length}</p>
      </div>
      <div className="email-list">
        <h2>Emails:</h2>
        <ul>
          {emails.map((email) => (
            <li key={email.id}>
              <div className={email.isImportant ? "important-email" : ""}>
                <p>
                  <strong>{email.subject}</strong>
                  {email.isImportant && <span> (Important)</span>}
                </p>
                {email.isImportant && (
                  <button onClick={() => autoReply(email)}>Auto Reply</button>
                )}
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export default EmailManager;
