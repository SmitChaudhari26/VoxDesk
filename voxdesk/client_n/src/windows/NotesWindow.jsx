import React, { useState, useRef, useEffect } from "react";

function NotesWindow() {
  const [note, setNote] = useState("");
  const [savedNotes, setSavedNotes] = useState([]);
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef(null);

  // Fetch saved notes when component mounts
  useEffect(() => {
    fetchNotes();
  }, []);

  // Fetch all notes from backend
  const fetchNotes = async () => {
    try {
      const res = await fetch("http://localhost:5000/api/notes");
      if (res.ok) {
        const data = await res.json();
        setSavedNotes(data);
      } else {
        console.error("Failed to fetch notes");
      }
    } catch (err) {
      console.error("Error fetching notes:", err);
    }
  };

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

    recognition.onstart = () => {
      setIsListening(true);
    };

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      setNote(prevNote => prevNote + " " + transcript);
    };

    recognition.onerror = (event) => {
      console.error("Speech recognition error:", event.error);
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognitionRef.current = recognition;
    recognition.start();
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
    if (!note.trim()) {
      alert("Please enter a note first!");
      return;
    }

    try {
      const res = await fetch("http://localhost:5000/api/notes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          note: note // Changed from content to note to match backend
        }),
      });

      if (res.ok) {
        alert("Note saved successfully!");
        setNote("");
        fetchNotes();
      } else {
        alert("Failed to save note.");
      }
    } catch (err) {
      console.error("Error saving note:", err);
      alert("Error saving note.");
    }
  };

  // Delete a note
  const handleDelete = async (noteId) => {
    try {
      const res = await fetch(`http://localhost:5000/api/notes/${noteId}`, {
        method: "DELETE",
      });

      if (res.ok) {
        fetchNotes();
        alert("Note deleted successfully!");
      } else {
        alert("Failed to delete note.");
      }
    } catch (err) {
      console.error("Error deleting note:", err);
      alert("Error deleting note.");
    }
  };

  return (
    <div className="bg-white shadow-lg rounded-xl p-4 w-full h-full flex flex-col">
      <h2 className="text-xl font-bold mb-2">📝 Notes</h2>

      {/* New note input section */}
      <div className="mb-4">
        <textarea
          className="w-full h-32 p-2 border rounded resize-none"
          placeholder="Write your note here..."
          value={note}
          onChange={(e) => setNote(e.target.value)}
        />
        <div className="mt-2 flex gap-2">
          <button
            className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600"
            onClick={isListening ? handleStopListening : handleStartListening}
          >
            {isListening ? "Stop Listening" : "Speak Note"}
          </button>
          <button
            className="bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600"
            onClick={handleSave}
          >
            Save Note
          </button>
        </div>
      </div>

      {/* Saved notes section */}
      <div className="flex-1 overflow-auto">
        <h3 className="font-semibold mb-2">Saved Notes:</h3>
        {savedNotes.length === 0 ? (
          <p className="text-gray-500">No saved notes yet.</p>
        ) : (
          <div className="space-y-2">
            {savedNotes.map((savedNote) => (
              <div
                key={savedNote._id}
                className="p-2 border rounded bg-gray-50 flex justify-between items-start"
              >
                <div>
                  <p className="whitespace-pre-wrap">{savedNote.note}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    {new Date(savedNote.createdAt).toLocaleString()}
                  </p>
                </div>
                <button
                  onClick={() => handleDelete(savedNote._id)}
                  className="text-red-500 hover:text-red-700 ml-2"
                >
                  🗑️
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default NotesWindow;