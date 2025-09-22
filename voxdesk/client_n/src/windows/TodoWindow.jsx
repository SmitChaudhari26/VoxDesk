import React, { useState, useRef, useEffect } from "react";

function TodoWindow() {
    const [todos, setTodos] = useState([]);
    const [input, setInput] = useState("");
    const [isListening, setIsListening] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const recognitionRef = useRef(null);

    // Get auth token for API requests
    const getAuthHeaders = () => {
        const token = localStorage.getItem("token");
        return {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
        };
    };

    // Fetch tasks
    useEffect(() => {
        fetchTodos();
    }, []);

    const fetchTodos = async () => {
        try {
            setLoading(true);
            setError("");
            const res = await fetch("http://localhost:5000/api/todos", {
                headers: getAuthHeaders()
            });

            if (res.ok) {
                const data = await res.json();
                setTodos(data);
            } else {
                const errorData = await res.json();
                setError(`Failed to fetch todos: ${errorData.message}`);
            }
        } catch (err) {
            console.error("Error fetching todos:", err);
            setError("Network error while fetching todos");
        } finally {
            setLoading(false);
        }
    };

    // Add todo
    const addTodo = async (title) => {
        if (!title.trim()) return;

        try {
            setLoading(true);
            setError("");
            const res = await fetch("http://localhost:5000/api/todos", {
                method: "POST",
                headers: getAuthHeaders(),
                body: JSON.stringify({ title: title.trim() }),
            });

            if (res.ok) {
                const newTodo = await res.json();
                setTodos((prev) => [newTodo, ...prev]);
                setInput(""); // Clear input after successful add
            } else {
                const errorData = await res.json();
                setError(`Failed to add todo: ${errorData.message}`);
            }
        } catch (err) {
            console.error("Error adding todo:", err);
            setError("Network error while adding todo");
        } finally {
            setLoading(false);
        }
    };

    // Toggle complete ✅
    const toggleTodo = async (id, completed) => {
        try {
            setError("");
            const res = await fetch(`http://localhost:5000/api/todos/${id}`, {
                method: "PUT",
                headers: getAuthHeaders(),
                body: JSON.stringify({ completed: !completed }),
            });

            if (res.ok) {
                const updated = await res.json();
                setTodos((prev) => prev.map((t) => (t._id === id ? updated : t)));
            } else {
                const errorData = await res.json();
                setError(`Failed to update todo: ${errorData.message}`);
            }
        } catch (err) {
            console.error("Error toggling todo:", err);
            setError("Network error while updating todo");
        }
    };

    // Delete ❌
    const deleteTodo = async (id) => {
        try {
            setError("");
            const res = await fetch(`http://localhost:5000/api/todos/${id}`, {
                method: "DELETE",
                headers: getAuthHeaders()
            });

            if (res.ok) {
                setTodos((prev) => prev.filter((t) => t._id !== id));
            } else {
                const errorData = await res.json();
                setError(`Failed to delete todo: ${errorData.message}`);
            }
        } catch (err) {
            console.error("Error deleting todo:", err);
            setError("Network error while deleting todo");
        }
    };

    // 🎤 Start listening
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
            setInput(transcript.trim()); // ✅ live dictation in input
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

    return (
        <div className="bg-white shadow-lg rounded-xl p-6 w-full h-full flex flex-col">
            <h2 className="text-xl font-bold mb-4">📝 Voice To-Do List</h2>

            {/* Error display */}
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

            {/* Input */}
            <div className="flex mb-4">
                <input
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Add a task..."
                    className="border p-2 rounded w-full"
                    disabled={loading}
                />
                <button
                    onClick={() => {
                        if (input.trim()) {
                            addTodo(input);
                        }
                    }}
                    className="ml-2 bg-blue-500 text-white px-4 py-2 rounded disabled:bg-blue-300"
                    disabled={loading || !input.trim()}
                >
                    {loading ? "Adding..." : "Add"}
                </button>
            </div>

            {/* Voice control */}
            <div className="mb-4">
                <button
                    onClick={isListening ? handleStopListening : handleStartListening}
                    className={`px-4 py-2 rounded ${isListening ? "bg-red-500" : "bg-green-500"
                        } text-white`}
                    disabled={loading}
                >
                    {isListening ? "🛑 Stop Listening" : "🎤 Speak Task"}
                </button>
                <button
                    onClick={fetchTodos}
                    className="ml-2 bg-gray-500 text-white px-4 py-2 rounded"
                    disabled={loading}
                >
                    {loading ? "Loading..." : "Refresh"}
                </button>
            </div>

            {/* Task list */}
            <div className="flex-1 overflow-auto">
                {loading && todos.length === 0 && <p className="text-gray-500">Loading todos...</p>}
                {!loading && todos.length === 0 && <p className="text-gray-500">No todos yet. Add one above!</p>}

                <ul className="space-y-2">
                    {todos.map((todo) => (
                        <li
                            key={todo._id}
                            className="flex justify-between items-center p-2 bg-gray-100 rounded"
                        >
                            <span
                                onClick={() => toggleTodo(todo._id, todo.completed)}
                                className={`cursor-pointer flex-1 ${todo.completed ? "line-through text-gray-500" : ""
                                    }`}
                            >
                                {todo.title}
                            </span>
                            <button
                                onClick={() => deleteTodo(todo._id)}
                                className="text-red-500 hover:bg-red-100 p-1 rounded ml-2"
                                disabled={loading}
                            >
                                ❌
                            </button>
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
}

export default TodoWindow;