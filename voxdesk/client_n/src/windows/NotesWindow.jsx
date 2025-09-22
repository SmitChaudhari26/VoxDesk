import React, { useState, useRef, useEffect } from "react";

function NotesWindow() {
  const [note, setNote] = useState("");
  const [savedNotes, setSavedNotes] = useState([]);
  const [isListening, setIsListening] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const recognitionRef = useRef(null);

  // Get auth token for API requests
  const getAuthHeaders = () => {
    const token = localStorage.getItem("token");
    console.log("Token being sent:", token ? "Token exists" : "No token found");
    return {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`
    };
  };

  // Fetch saved notes (user-specific)
  useEffect(() => {
    fetchNotes();
  }, []);

  const fetchNotes = async () => {
    try {
      setLoading(true);
      setError("");
      console.log("Fetching notes...");

      const res = await fetch("http://localhost:5000/api/notes", {
        method: "GET",
        headers: getAuthHeaders()
      });

      console.log("Fetch response status:", res.status);
      const data = await res.json();
      console.log("Fetch response data:", data);

      if (res.ok) {
        setSavedNotes(data);
      } else {
        console.error("Failed to fetch notes:", data);
        // Don't show error on initial load if no notes exist
        if (res.status !== 401) {
          setError(`Failed to fetch notes: ${data.message || res.status}`);
        }
      }
    } catch (err) {
      console.error("Error fetching notes:", err);
      setError(`Network error: ${err.message}`);
    } finally {
      setLoading(false);
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
    recognition.interimResults = true;
    recognition.lang = "en-US";

    recognition.onstart = () => setIsListening(true);

    recognition.onresult = (event) => {
      let transcript = "";
      for (let i = 0; i < event.results.length; i++) {
        transcript += event.results[i][0].transcript + " ";
      }
      setNote(transcript.trim());
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

  // Save note (user-specific)
  const handleSave = async () => {
    if (!note.trim()) {
      setError("Please enter a note before saving");
      return;
    }

    try {
      setLoading(true);
      setError("");
      console.log("Saving note:", note);

      const res = await fetch("http://localhost:5000/api/notes", {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify({ note: note.trim() }),
      });

      console.log("Save response status:", res.status);
      const data = await res.json();
      console.log("Save response data:", data);

      if (res.ok) {
        setNote("");
        setError("");
        await fetchNotes(); // Refresh the notes list
        console.log("Note saved successfully!");
      } else {
        setError(`Failed to save note: ${data.message || res.status}`);
        console.error("Failed to save note:", data);
      }
    } catch (err) {
      setError(`Network error: ${err.message}`);
      console.error("Error saving note:", err);
    } finally {
      setLoading(false);
    }
  };

  // Delete note (user-specific)
  const handleDelete = async (id) => {
    try {
      setLoading(true);
      setError("");
      console.log("Deleting note:", id);

      const res = await fetch(`http://localhost:5000/api/notes/${id}`, {
        method: "DELETE",
        headers: getAuthHeaders()
      });

      console.log("Delete response status:", res.status);
      const data = await res.json();
      console.log("Delete response data:", data);

      if (res.ok) {
        await fetchNotes(); // Refresh the notes list
        console.log("Note deleted successfully!");
      } else {
        setError(`Failed to delete note: ${data.message || res.status}`);
        console.error("Failed to delete note:", data);
      }
    } catch (err) {
      setError(`Network error: ${err.message}`);
      console.error("Error deleting note:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white shadow-lg rounded-xl p-4 w-full h-full flex flex-col">
      <h2 className="text-xl font-bold mb-2">📝 Notes</h2>

      {/* Error display - only show if there's an actual error */}
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
          <button
            onClick={() => setError("")}
            className="ml-2 text-red-800 hover:text-red-900"
          >
            ✕
          </button>
        </div>
      )}

      <textarea
        className="w-full h-32 p-2 border rounded resize-none"
        placeholder="Speak or type your note..."
        value={note}
        onChange={(e) => setNote(e.target.value)}
        disabled={loading}
      />

      <div className="mt-2 flex gap-2">
        <button
          className={`px-3 py-1 rounded text-white ${isListening ? "bg-red-500" : "bg-green-500"
            }`}
          onClick={isListening ? handleStopListening : handleStartListening}
          disabled={loading}
        >
          {isListening ? "🛑 Stop" : "🎤 Speak"}
        </button>
        <button
          className="bg-blue-500 text-white px-3 py-1 rounded disabled:bg-blue-300"
          onClick={handleSave}
          disabled={loading || !note.trim()}
        >
          {loading ? "Saving..." : "Save"}
        </button>
        <button
          className="bg-gray-500 text-white px-3 py-1 rounded"
          onClick={fetchNotes}
          disabled={loading}
        >
          {loading ? "Loading..." : "Refresh"}
        </button>
      </div>

      <div className="flex-1 overflow-auto mt-4">
        <h3 className="font-semibold mb-2">Saved Notes:</h3>
        {loading && <p className="text-gray-500">Loading...</p>}
        {!loading && savedNotes.length === 0 && (
          <p className="text-gray-500">No saved notes yet.</p>
        )}
        {!loading && savedNotes.map((n) => (
          <div
            key={n._id}
            className="p-2 border rounded bg-gray-50 flex justify-between items-start mb-2"
          >
            <div className="flex-1">
              <p className="whitespace-pre-wrap">{n.note}</p>
              <p className="text-xs text-gray-500">
                {new Date(n.createdAt).toLocaleString()}
              </p>
            </div>
            <button
              onClick={() => handleDelete(n._id)}
              className="text-red-500 hover:bg-red-100 p-1 rounded ml-2"
              disabled={loading}
            >
              🗑️
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

export default NotesWindow;