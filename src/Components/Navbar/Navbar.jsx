import React from "react";
import { useNavigate } from "react-router-dom";
import "./Navbar.css";

const Navbar = () => {
  const navigate = useNavigate();

  return (
    <div className="navbar">
      <button className="nav-button" onClick={() => navigate("/calendar")}>
        🗓️ Meeting
      </button>
      <button className="nav-button" onClick={() => navigate("/annamail")}>
        📧 Mail
      </button>
      <button className="nav-button" onClick={() => navigate("/")}>
        👩 Anna
      </button>
    </div>
  );
};

export default Navbar;
