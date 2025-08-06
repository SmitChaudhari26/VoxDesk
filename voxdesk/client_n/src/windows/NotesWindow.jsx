import React, { useState, useRef } from "react";

function NotesWindow() {
  const [note, setNote] = useState("");
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef(null);

  // Start speech recognition
  const handleStartListening = () => {
    if (!("webkitSpeechRecognition" in window)) {
      alert("Speech recognition not supported in this browser.");
      return;
    }
    const recognition = new window.webkitSpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = "en-US";
    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      setNote((prev) => prev + " " + transcript);
    };
    recognition.onend = () => setIsListening(false);
    recognitionRef.current = recognition;
    recognition.start();
    setIsListening(true);
  };

  // Stop speech recognition
  const handleStopListening = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      setIsListening(false);
    }
  };

  // Save note to backend
  const handleSave = async () => {
    try {
      const res = await fetch("http://localhost:5000/api/notes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ note }),
      });
      if (res.ok) {
        alert("Note saved!");
        setNote("");
      } else {
        alert("Failed to save note.");
      }
    } catch (err) {
      alert("Error saving note.");
    }
  };

  return (
    <div className="bg-white shadow-lg rounded-xl p-4 w-full h-full">
      <h2 className="text-xl font-bold mb-2">📝 Notes</h2>
      <textarea
        className="w-full h-40 mt-2 p-2 border rounded"
        placeholder="Write here..."
        value={note}
        onChange={(e) => setNote(e.target.value)}
      />
      <div className="mt-2 flex gap-2">
        <button
          className="bg-blue-500 text-white px-3 py-1 rounded"
          onClick={isListening ? handleStopListening : handleStartListening}
        >
          {isListening ? "Stop Listening" : "Speak Note"}
        </button>
        <button
          className="bg-green-500 text-white px-3 py-1 rounded"
          onClick={handleSave}
        >
          Save
        </button>
      </div>
    </div>
  );
}

export default NotesWindow;