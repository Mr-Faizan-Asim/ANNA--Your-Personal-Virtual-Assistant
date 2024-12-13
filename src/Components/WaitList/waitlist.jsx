import React, { useState } from "react";
import "./Waitlist.css";

const Waitlist = () => {
    const [email, setEmail] = useState("");

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (email) {
            try {
                // Send email to backend using fetch
                const response = await fetch('http://localhost:3000/api/waitlist', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ email }),
                });

                const data = await response.json();

                if (response.ok) {
                    alert(`Thank you for joining the waitlist, ${email}!`);
                    setEmail(""); // Clear email input after successful submission
                } else {
                    alert(data.message || 'Something went wrong.');
                }
            } catch (error) {
                console.error('Error:', error);
                alert('There was an error with the server. Please try again.');
            }
        } else {
            alert("Please enter a valid email address.");
        }
    };

    return (
        <div className="waitlist-container">
            <h2>Excited for the future of design?</h2>
            <h1>JOIN THE WAITLIST.</h1>
            <form className="waitlist-form" onSubmit={handleSubmit}>
                <input
                    type="email"
                    placeholder="Your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                />
                <button type="submit">JOIN THE WAITLIST</button>
            </form>
        </div>
    );
};

export default Waitlist;
