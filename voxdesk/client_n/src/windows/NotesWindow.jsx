import React, { useState, useRef, useEffect } from "react";

function NotesWindow() {
  const [note, setNote] = useState("");
  const [savedNotes, setSavedNotes] = useState([]);
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef(null);

  // Fetch saved notes
  useEffect(() => {
    fetchNotes();
  }, []);

  const fetchNotes = async () => {
    try {
      const res = await fetch("http://localhost:5000/api/notes");
      if (res.ok) {
        const data = await res.json();
        setSavedNotes(data);
      }
    } catch (err) {
      console.error("Error fetching notes:", err);
    }
  };

  // 🎤 Start live dictation
  const handleStartListening = () => {
    if (!("webkitSpeechRecognition" in window)) {
      alert("Speech recognition not supported in this browser.");
      return;
    }

    const recognition = new window.webkitSpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true; // ✅ live words
    recognition.lang = "en-US";

    recognition.onstart = () => setIsListening(true);

    recognition.onresult = (event) => {
      let transcript = "";
      for (let i = 0; i < event.results.length; i++) {
        transcript += event.results[i][0].transcript + " ";
      }
      setNote(transcript.trim()); // ✅ updates live in textarea
    };

    recognition.onerror = (e) => {
      console.error("Speech error:", e.error);
      setIsListening(false);
    };

    recognition.onend = () => setIsListening(false);

    recognitionRef.current = recognition;
    recognition.start();
  };

  // 🎤 Stop listening
  const handleStopListening = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      setIsListening(false);
    }
  };

  // Save
  const handleSave = async () => {
    if (!note.trim()) return;
    const res = await fetch("http://localhost:5000/api/notes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ note }),
    });
    if (res.ok) {
      setNote("");
      fetchNotes();
    }
  };

  // Delete
  const handleDelete = async (id) => {
    await fetch(`http://localhost:5000/api/notes/${id}`, { method: "DELETE" });
    fetchNotes();
  };

  return (
    <div className="bg-white shadow-lg rounded-xl p-4 w-full h-full flex flex-col">
      <h2 className="text-xl font-bold mb-2">📝 Notes</h2>

      <textarea
        className="w-full h-32 p-2 border rounded resize-none"
        placeholder="Speak or type your note..."
        value={note}
        onChange={(e) => setNote(e.target.value)}
      />

      <div className="mt-2 flex gap-2">
        <button
          className={`px-3 py-1 rounded text-white ${
            isListening ? "bg-red-500" : "bg-green-500"
          }`}
          onClick={isListening ? handleStopListening : handleStartListening}
        >
          {isListening ? "🛑 Stop" : "🎤 Speak"}
        </button>
        <button
          className="bg-blue-500 text-white px-3 py-1 rounded"
          onClick={handleSave}
        >
          Save
        </button>
      </div>

      <div className="flex-1 overflow-auto mt-4">
        <h3 className="font-semibold mb-2">Saved Notes:</h3>
        {savedNotes.length === 0 ? (
          <p className="text-gray-500">No saved notes yet.</p>
        ) : (
          savedNotes.map((n) => (
            <div
              key={n._id}
              className="p-2 border rounded bg-gray-50 flex justify-between items-start mb-2"
            >
              <div>
                <p>{n.note}</p>
                <p className="text-xs text-gray-500">
                  {new Date(n.createdAt).toLocaleString()}
                </p>
              </div>
              <button
                onClick={() => handleDelete(n._id)}
                className="text-red-500"
              >
                🗑️
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default NotesWindow;
