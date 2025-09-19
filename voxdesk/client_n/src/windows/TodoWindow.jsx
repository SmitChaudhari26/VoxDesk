import React, { useState, useRef, useEffect } from "react";

function TodoWindow() {
    const [todos, setTodos] = useState([]);
    const [input, setInput] = useState("");
    const [isListening, setIsListening] = useState(false);
    const recognitionRef = useRef(null);

    // Fetch tasks
    useEffect(() => {
        fetchTodos();
    }, []);

    const fetchTodos = async () => {
        try {
            const res = await fetch("http://localhost:5000/api/todos");
            if (res.ok) {
                const data = await res.json();
                setTodos(data);
            }
        } catch (err) {
            console.error("Error fetching todos:", err);
        }
    };

    // Add
    const addTodo = async (title) => {
        if (!title.trim()) return;
        const res = await fetch("http://localhost:5000/api/todos", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ title }),
        });
        if (res.ok) {
            const newTodo = await res.json();
            setTodos((prev) => [newTodo, ...prev]);
        }
    };

    // Toggle complete ✅
    const toggleTodo = async (id, completed) => {
        const res = await fetch(`http://localhost:5000/api/todos/${id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ completed: !completed }),
        });
        if (res.ok) {
            const updated = await res.json();
            setTodos((prev) => prev.map((t) => (t._id === id ? updated : t)));
        }
    };

    // Delete ❌
    const deleteTodo = async (id) => {
        await fetch(`http://localhost:5000/api/todos/${id}`, { method: "DELETE" });
        setTodos((prev) => prev.filter((t) => t._id !== id));
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
        <div className="bg-white shadow-lg rounded-xl p-6">
            <h2 className="text-xl font-bold mb-4">📝 Voice To-Do List</h2>

            {/* Input */}
            <div className="flex mb-4">
                <input
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Add a task..."
                    className="border p-2 rounded w-full"
                />
                <button
                    onClick={() => {
                        if (input) {
                            addTodo(input);
                            setInput("");
                        }
                    }}
                    className="ml-2 bg-blue-500 text-white px-4 py-2 rounded"
                >
                    Add
                </button>
            </div>

            {/* Voice control */}
            <div className="mb-4">
                <button
                    onClick={isListening ? handleStopListening : handleStartListening}
                    className={`px-4 py-2 rounded ${isListening ? "bg-red-500" : "bg-green-500"
                        } text-white`}
                >
                    {isListening ? "🛑 Stop Listening" : "🎤 Speak Task"}
                </button>
            </div>

            {/* Task list */}
            <ul className="space-y-2">
                {todos.map((todo) => (
                    <li
                        key={todo._id}
                        className="flex justify-between items-center p-2 bg-gray-100 rounded"
                    >
                        <span
                            onClick={() => toggleTodo(todo._id, todo.completed)}
                            className={`cursor-pointer ${todo.completed ? "line-through text-gray-500" : ""
                                }`}
                        >
                            {todo.title}
                        </span>
                        <button
                            onClick={() => deleteTodo(todo._id)}
                            className="text-red-500"
                        >
                            ❌
                        </button>
                    </li>
                ))}
            </ul>
        </div>
    );
}

export default TodoWindow;
