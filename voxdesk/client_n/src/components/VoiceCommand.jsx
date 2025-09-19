import React, { useRef, useState } from "react";

export default function VoiceCommand() {
    const recognitionRef = useRef(null);
    const [listening, setListening] = useState(false);
    const [message, setMessage] = useState("Say 'open YouTube' or 'open Google'...");

    const startListening = () => {
        console.log("Starting voice recognition...");

        if (!("webkitSpeechRecognition" in window)) {
            console.error("Speech recognition not supported");
            setMessage("Speech recognition not supported in this browser.");
            return;
        }

        const recognition = new window.webkitSpeechRecognition();
        recognition.continuous = false;
        recognition.interimResults = false;
        recognition.lang = "en-US";

        recognition.onstart = () => {
            console.log("Recognition started");
            setListening(true);
            setMessage("Listening...");
        };

        recognition.onresult = (event) => {
            console.log("Got speech result:", event);
            const transcript = event.results[0][0].transcript.toLowerCase();
            console.log("Transcript:", transcript);
            setMessage(`You said: "${transcript}"`);

            // eslint-disable-next-line no-undef
            if (window.chrome && chrome.runtime && chrome.runtime.sendMessage) {
                console.log("Attempting to send command to extension");

                if (transcript.includes("open youtube")) {
                    // eslint-disable-next-line no-undef
                    chrome.runtime.sendMessage({ command: "open_youtube" }, (response) => {
                        // eslint-disable-next-line no-undef
                        if (chrome.runtime.lastError) {
                            // eslint-disable-next-line no-undef
                            console.error("Error:", chrome.runtime.lastError);
                            setMessage("Error: Could not send command to extension");
                        } else {
                            console.log("YouTube command sent successfully");
                            setMessage("Opening YouTube...");
                        }
                    });
                } else if (transcript.includes("open google")) {
                    // eslint-disable-next-line no-undef
                    chrome.runtime.sendMessage({ command: "open_google" }, (response) => {
                        // eslint-disable-next-line no-undef
                        if (chrome.runtime.lastError) {
                            // eslint-disable-next-line no-undef
                            console.error("Error:", chrome.runtime.lastError);
                            setMessage("Error: Could not send command to extension");
                        } else {
                            console.log("Google command sent successfully");
                            setMessage("Opening Google...");
                        }
                    });
                } else {
                    console.log("Command not recognized:", transcript);
                    setMessage("Command not recognized. Try 'open youtube' or 'open google'");
                }
            } else {
                console.warn("Chrome extension API not available");
                setMessage("This feature only works in the extension popup.");
            }
        };

        recognition.onerror = (event) => {
            console.error("Recognition error:", event.error);
            setMessage(`Error: ${event.error}`);
            setListening(false);
        };

        recognition.onend = () => {
            console.log("Recognition ended");
            setListening(false);
        };

        try {
            recognitionRef.current = recognition;
            recognition.start();
        } catch (error) {
            console.error("Error starting recognition:", error);
            setMessage("Error starting voice recognition");
            setListening(false);
        }
    };

    const stopListening = () => {
        console.log("Stopping voice recognition...");
        if (recognitionRef.current) {
            recognitionRef.current.stop();
            setListening(false);
            setMessage("Stopped listening.");
        }
    };

    return (
        <div style={{ margin: "2rem 0", textAlign: "center" }}>
            <button
                onClick={listening ? stopListening : startListening}
                style={{
                    background: "#2563eb",
                    color: "#fff",
                    padding: "0.75rem 1.5rem",
                    border: "none",
                    borderRadius: "8px",
                    cursor: "pointer",
                    fontWeight: "bold"
                }}
            >
                {listening ? "Stop Listening" : "Start Voice Command"}
            </button>
            <div style={{ marginTop: "1rem", color: "#334155" }}>{message}</div>
        </div>
    );
}