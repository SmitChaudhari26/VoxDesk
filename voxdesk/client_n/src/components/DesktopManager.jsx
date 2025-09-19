import { Link } from "react-router-dom";
import { MdNote, MdChecklist } from "react-icons/md";
import React, { useEffect, useState } from "react";
import VoiceCommand from "./VoiceCommand";
import AIAssistant from "./AIAssistant";

function DesktopManager() {
  const [user, setUser] = useState({});

  // Load user data from localStorage
  useEffect(() => {
    const userData = JSON.parse(localStorage.getItem('user') || '{}');
    setUser(userData);
  }, []);

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        background: "linear-gradient(135deg, #e0e7ff 0%, #f0fdfa 100%)",
      }}
    >
      {/* Sidebar */}
      <nav
        style={{
          width: "220px",
          background: "#1e293b",
          color: "#fff",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          padding: "2rem 0",
          boxShadow: "2px 0 8px rgba(30,41,59,0.08)",
        }}
      >
        <h2
          style={{
            fontWeight: "bold",
            fontSize: "1.5rem",
            marginBottom: "3rem",
            letterSpacing: "1px",
          }}
        >
          VoxDesk
        </h2>

        {/* User profile summary */}
        <div style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          marginBottom: "2rem",
          padding: "1rem",
          borderRadius: "8px",
          background: "#334155"
        }}>
          {user.avatar && (
            <img
              src={user.avatar}
              alt="Profile"
              style={{
                width: "60px",
                height: "60px",
                borderRadius: "50%",
                objectFit: "cover",
                marginBottom: "0.75rem"
              }}
            />
          )}
          <span style={{
            fontSize: "1rem",
            fontWeight: "bold"
          }}>
            {user.name || "Guest"}
          </span>
          <span style={{
            fontSize: "0.8rem",
            opacity: 0.8
          }}>
            {user.email || ""}
          </span>
        </div>

        <Link to="/profile" style={linkStyle}
          onMouseOver={(e) => (e.currentTarget.style.background = "#475569")}
          onMouseOut={(e) => (e.currentTarget.style.background = "#334155")}>
          👤 Profile
        </Link>

        {/* Notes Link */}
        <Link
          to="/notes"
          style={linkStyle}
          onMouseOver={(e) => (e.currentTarget.style.background = "#475569")}
          onMouseOut={(e) => (e.currentTarget.style.background = "#334155")}
        >
          <MdNote size={28} />
          <span style={{ fontSize: "1.1rem", fontWeight: 500 }}>Notes</span>
        </Link>

        {/* To-Do Link */}
        <Link
          to="/todos"
          style={linkStyle}
          onMouseOver={(e) => (e.currentTarget.style.background = "#475569")}
          onMouseOut={(e) => (e.currentTarget.style.background = "#334155")}
        >
          <MdChecklist size={28} />
          <span style={{ fontSize: "1.1rem", fontWeight: 500 }}>To-Do</span>
        </Link>

      </nav>

      {/* Main Content */}
      <main
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <h1
          style={{
            fontSize: "2.5rem",
            fontWeight: "bold",
            color: "#1e293b",
            marginBottom: "1rem",
          }}
        >
          Welcome, {user.name || "Guest"}!
        </h1>
        <p
          style={{
            fontSize: "1.25rem",
            color: "#334155",
            marginBottom: "2rem",
          }}
        >
          Your desktop manager is running.
          <br />
          Start by exploring the Notes or To-Do section, or add more features
          soon!
        </p>

        {/* Placeholder for future components */}
        <div
          style={{
            marginTop: "2rem",
            color: "#64748b",
            fontStyle: "italic",
          }}
        >
          More features coming soon...
        </div>

        {/* Voice + AI Assistant */}
        <VoiceCommand />
        <AIAssistant />
      </main>
    </div>
  );
}

// Extracted link style
const linkStyle = {
  display: "flex",
  alignItems: "center",
  gap: "0.75rem",
  color: "#fff",
  textDecoration: "none",
  padding: "0.75rem 1.5rem",
  borderRadius: "8px",
  marginBottom: "1rem",
  background: "#334155",
  transition: "background 0.2s",
};

export default DesktopManager;