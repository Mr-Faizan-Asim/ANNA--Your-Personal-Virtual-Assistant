import React, { useState } from "react";

const Navbar = () => {
  const [hover, setHover] = useState(null);

  const handleMouseEnter = (button) => {
    setHover(button);
  };

  const handleMouseLeave = () => {
    setHover(null);
  };

  return (
    <div style={styles.navbar}>
      <button
        style={hover === "meeting" ? styles.navButtonHover : styles.navButton}
        onMouseEnter={() => handleMouseEnter("meeting")}
        onMouseLeave={handleMouseLeave}
      >
        Meeting
      </button>
      <button
        style={hover === "anna" ? styles.navButtonHover : styles.navButton}
        onMouseEnter={() => handleMouseEnter("anna")}
        onMouseLeave={handleMouseLeave}
      >
        Anna
      </button>
      <button
        style={hover === "email" ? styles.navButtonHover : styles.navButton}
        onMouseEnter={() => handleMouseEnter("email")}
        onMouseLeave={handleMouseLeave}
      >
        Email
      </button>
    </div>
  );
};

const styles = {
  navbar: {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    padding: "10px 0",
    background: "rgba(0, 0, 0, 0.3)", // Transparent background
    zIndex: 1000,
  },
  navButton: {
    backgroundColor: "#007BFF",
    color: "#fff",
    padding: "10px 20px",
    fontSize: "16px",
    border: "2px solid #007BFF",
    borderRadius: "2px", // Border radius of 2px
    margin: "0 10px",
    cursor: "pointer",
    transition: "all 0.3s ease",
    boxShadow: "0 4px 8px rgba(0, 123, 255, 0.5)", // Glossy effect
  },
  navButtonHover: {
    backgroundColor: "#0056b3",
    color: "#fff",
    padding: "10px 20px",
    fontSize: "16px",
    border: "2px solid #0056b3",
    borderRadius: "2px",
    margin: "0 10px",
    cursor: "pointer",
    transition: "all 0.3s ease",
    boxShadow: "0 8px 16px rgba(0, 123, 255, 0.8)", // Stronger glossy effect
  },
};

export default Navbar;
