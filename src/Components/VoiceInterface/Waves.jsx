import React from "react";
import "./Waves.css";

const Waves = ({ listening }) => {
  return (
    <div className={`wave-container ${listening ? "active" : ""}`}>
      <div className="wave wave1"></div>
      <div className="wave wave2"></div>
      <div className="wave wave3"></div>
      <div className="wave wave4"></div>
      <div className="wave wave5"></div>
    </div>
  );
};

export default Waves;
