import React, { useState } from "react";

export default function AIAssistant() {
    const [input, setInput] = useState("");
    const [messages, setMessages] = useState([]);

    const handleSend = async () => {
        if (!input.trim()) return;
        setMessages([...messages, { from: "user", text: input }]);
        setInput("");

        /* global chrome*/
        const lowerInput = input.toLowerCase();
        if (window.chrome && chrome.runtime && chrome.runtime.sendMessage) {
            if (lowerInput.includes("open youtube")) {
                chrome.runtime.sendMessage({ command: "open_youtube" });
                setMessages(msgs => [...msgs, { from: "ai", text: "Opening YouTube..." }]);
                return;
            } else if (lowerInput.includes("open google")) {
                chrome.runtime.sendMessage({ command: "open_google" });
                setMessages(msgs => [...msgs, { from: "ai", text: "Opening Google..." }]);
                return;
            }
        }

        // Step 2: Otherwise, send to OpenAI
        const aiResponse = await fetch("https://api.openai.com/v1/chat/completions", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": "Bearer sk-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
            },
            body: JSON.stringify({
                model: "gpt-3.5-turbo",
                messages: [{ role: "user", content: input }]
            })
        }).then(res => res.json());
        const reply = aiResponse.choices?.[0]?.message?.content || "Sorry, I couldn't understand.";
        setMessages(msgs => [...msgs, { from: "ai", text: reply }]);
        // Optional: Speak the reply
        if ('speechSynthesis' in window) {
            const utter = new window.SpeechSynthesisUtterance(reply);
            window.speechSynthesis.speak(utter);
        }
    };

    return (
        <div style={{ margin: "2rem auto", maxWidth: 400, background: "#f1f5f9", borderRadius: 12, padding: 16 }}>
            <div style={{ minHeight: 100 }}>
                {messages.map((msg, i) => (
                    <div key={i} style={{ textAlign: msg.from === "user" ? "right" : "left", margin: "0.5rem 0" }}>
                        <b>{msg.from === "user" ? "You" : "AI"}:</b> {msg.text}
                    </div>
                ))}
            </div>
            <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
                <input
                    value={input}
                    onChange={e => setInput(e.target.value)}
                    placeholder="Ask me anything..."
                    style={{ flex: 1, padding: 8, borderRadius: 6, border: "1px solid #cbd5e1" }}
                />
                <button onClick={handleSend} style={{ padding: "8px 16px", borderRadius: 6, background: "#2563eb", color: "#fff", border: "none" }}>
                    Send
                </button>
            </div>
        </div>
    );
}