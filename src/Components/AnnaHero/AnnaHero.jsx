import React, { useState } from "react";
import "./AnnaHero.css";

const AnnaHero = () => {
    const [buttonClicked, setButtonClicked] = useState(false);

    const handleButtonClick = () => {
        setButtonClicked(true);
        setTimeout(() => setButtonClicked(false), 1000); // Reset after 1 second
    };

    const handleLogoHover = (e) => {
        e.target.style.transition = "transform 0.5s ease, box-shadow 0.5s ease";
        e.target.style.transform = "rotate(180deg)"; // Apply smooth rotation
    };

    const handleLogoMouseLeave = (e) => {
        e.target.style.transform = "";
        e.target.style.boxShadow = "";
    };

    return (
        <div>
            <div className="logo">
                <img
                    src="../../../public/logo.png"
                    alt="Anna"
                    onMouseEnter={handleLogoHover}
                    onMouseLeave={handleLogoMouseLeave}
                />
            </div>
            <div className="hero">
            <h1 className="glowing-header">Matrix.AI</h1>
            <p className="pulsing-slogan">
            Matrix.ai – Your Intelligent Companion.
            </p>
            <button
                className={`cta-button ${buttonClicked ? "clicked" : ""}`}
                onClick={handleButtonClick}
            >
                WAITLIST
            </button>
            </div>
        </div>
    );
};

export default AnnaHero;
