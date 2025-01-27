import React, { useState, useEffect } from "react";

const AlarmComponent = () => {
  const [alarms, setAlarms] = useState([]);
  const [step, setStep] = useState(0);
  const [inputs, setInputs] = useState({
    meetingName: "",
    day: "",
    month: "",
    year: "",
    hours: "",
    minutes: "",
    period: "",
  });
  const [confirmation, setConfirmation] = useState(false);

  // Speak function to use SpeechSynthesis
  const speak = (text) => {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.voice = speechSynthesis.getVoices().find((voice) => voice.name === "Google UK English Female"); // Choose female voice
    utterance.pitch = 1;  // Default pitch
    utterance.rate = 1;   // Default rate
    speechSynthesis.speak(utterance);
  };

  useEffect(() => {
    const savedAlarms = JSON.parse(localStorage.getItem("alarms")) || [];
    // Filter alarms that have not expired
    const validAlarms = savedAlarms.filter((alarm) => {
      return alarm.expirationTime > new Date().getTime();
    });
    setAlarms(validAlarms);
    speak(steps[step]);  // Speak the first step when the component mounts
  }, []);

  useEffect(() => {
    localStorage.setItem("alarms", JSON.stringify(alarms));

    if (step < steps.length) {
      speak(steps[step]);  // Speak the question for the current step
    }
  }, [step, alarms]);

  const steps = [
    "Enter the meeting name.",
    "Enter the day (e.g., 27).",
    "Enter the month (e.g., 11 for November).",
    "Enter the year (e.g., 2024).",
    "Enter the hours (e.g., 11).",
    "Enter the minutes (e.g., 15).",
    "Enter AM or PM.",
  ];

  const handleInput = (e) => {
    setInputs({ ...inputs, [e.target.name]: e.target.value });
  };

  const handleNextStep = () => {
    if (step < steps.length - 1) {
      setStep(step + 1);
    } else {
      setConfirmation(true);
    }
  };

  const handlePreviousStep = () => {
    if (step > 0) setStep(step - 1);
  };

  const handleSetAlarm = () => {
    const { meetingName, day, month, year, hours, minutes, period } = inputs;
    const formattedHours = period.toLowerCase() === "pm" ? parseInt(hours) + 12 : hours;

    const alarmDateTime = new Date(`${year}-${month}-${day}T${formattedHours}:${minutes}`);
    const alarmTimestamp = alarmDateTime.getTime();

    // Set expiration time to 30 days from the current date
    const expirationTime = new Date().getTime() + 30 * 24 * 60 * 60 * 1000;

    const newAlarm = {
      meetingName,
      alarmTimestamp,
      expirationTime,  // Expiration time (30 days from now)
      createdAt: new Date().getTime(),
      triggered: false,  // Initialize the triggered state
    };

    setAlarms([...alarms, newAlarm]);
    setInputs({
      meetingName: "",
      day: "",
      month: "",
      year: "",
      hours: "",
      minutes: "",
      period: "",
    });
    setStep(0);
    setConfirmation(false);
    alert("Alarm set successfully!");
  };

  const playSound = () => {
    const audio = new Audio('https://www.soundjay.com/button/beep-07.wav'); // A beep sound when alarm triggers
    audio.play();
  };

  useEffect(() => {
    const interval = setInterval(() => {
      const currentTime = new Date().getTime();
      alarms.forEach((alarm) => {
        if (alarm.alarmTimestamp <= currentTime && !alarm.triggered) {
          playSound();
          alarm.triggered = true;  // Mark this alarm as triggered
        }
      });
      setAlarms([...alarms]);  // Force a re-render to keep track of triggered alarms
    }, 1000);  // Check every second
    return () => clearInterval(interval);
  }, [alarms]);

  return (
    <div style={styles.container}>
      <h1 style={styles.header}>Meet Setup By Anna</h1>

      {confirmation ? (
        <div style={styles.confirmation}>
          <h2>Review Your Alarm</h2>
          <p>
            <strong>Meeting Name:</strong> {inputs.meetingName}
          </p>
          <p>
            <strong>Date:</strong> {inputs.day}/{inputs.month}/{inputs.year}
          </p>
          <p>
            <strong>Time:</strong> {inputs.hours}:{inputs.minutes} {inputs.period.toUpperCase()}
          </p>
          <button onClick={handleSetAlarm} style={styles.button}>
            Confirm Alarm
          </button>
          <button onClick={() => setConfirmation(false)} style={styles.button}>
            Edit Details
          </button>
        </div>
      ) : (
        <div style={styles.inputContainer}>
          <p>{steps[step]}</p>
          <input
            type="text"
            name={step === 0 ? "meetingName" : step === 1 ? "day" : step === 2 ? "month" : step === 3 ? "year" : step === 4 ? "hours" : step === 5 ? "minutes" : "period"}
            value={step === 0 ? inputs.meetingName : step === 1 ? inputs.day : step === 2 ? inputs.month : step === 3 ? inputs.year : step === 4 ? inputs.hours : step === 5 ? inputs.minutes : inputs.period}
            onChange={handleInput}
            style={styles.input}
            color="#333"
          />
          <div style={styles.buttonContainer}>
            {step > 0 && (
              <button onClick={handlePreviousStep} style={styles.button}>
                Previous
              </button>
            )}
            <button onClick={handleNextStep} style={styles.button}>
              Next
            </button>
          </div>
        </div>
      )}

      <div style={styles.alarmListContainer}>
        <h2>Upcoming Meetings</h2>
        {alarms.length > 0 ? (
          <ul style={styles.alarmList}>
            {alarms.map((alarm, index) => (
              <li key={index} style={styles.alarmItem}>
                <strong>{alarm.meetingName}</strong> -{" "}
                {new Date(alarm.alarmTimestamp).toLocaleString()}
              </li>
            ))}
          </ul>
        ) : (
          <p>No alarms set.</p>
        )}
      </div>
    </div>
  );
};

const styles = {
  container: {
    padding: "20px",
    fontFamily: "Arial, sans-serif",
    maxWidth: "600px",
    margin: "0 auto",
    textAlign: "center",
    background: "#f9f9f9",
    borderRadius: "10px",
    boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
  },
  header: {
    fontSize: "28px",
    color: "#333",
    marginBottom: "20px",
  },
  inputContainer: {
    marginBottom: "20px",
    color: "#333",
  },
  input: {
    padding: "10px",  
    borderRadius: "5px",
    border: "1px solid #ddd",
    fontSize: "16px",
    width: "80%",
    color: "#333",
  },
  buttonContainer: {
    marginTop: "10px",
    display: "flex",
    gap: "10px",
    justifyContent: "center",
  },
  button: {
    padding: "10px 20px",
    backgroundColor: "#007BFF",
    color: "#fff",
    border: "none",
    borderRadius: "5px",
    cursor: "pointer",
    fontSize: "16px",
  },
  confirmation: {
    textAlign: "left",
    color: "#333",
  },
  alarmListContainer: {
    marginTop: "20px",
  },
  alarmList: {
    listStyleType: "none",
    padding: "0",
  },
  alarmItem: {
    backgroundColor: "#f0f0f0",
    padding: "10px",
    borderRadius: "5px",
    marginBottom: "10px",
    color: "#333",
  },
};

export default AlarmComponent;
