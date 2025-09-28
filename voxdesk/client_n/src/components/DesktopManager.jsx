import { Link, useNavigate } from "react-router-dom";
import { MdNote, MdChecklist, MdLogout } from "react-icons/md";
import React, { useEffect, useState } from "react";
import VoiceCommand from "./VoiceCommand";
import AIAssistant from "./AIAssistant";
import WeatherWidget from "./WeatherWidget";
import LiveClock from "./LiveClock";

function DesktopManager() {
  const [user, setUser] = useState({});
  const [stats, setStats] = useState({
    totalNotes: 0,
    totalTodos: 0,
    completedTodos: 0,
    loading: true
  });
  const navigate = useNavigate();

  // Load user data from localStorage
  useEffect(() => {
    const userData = JSON.parse(localStorage.getItem('user') || '{}');
    setUser(userData);
  }, []);

  // Fetch user statistics
  const fetchStats = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return;

      const headers = {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json"
      };

      // Fetch notes count
      const notesResponse = await fetch("http://localhost:5000/api/notes", { headers });
      const notes = notesResponse.ok ? await notesResponse.json() : [];

      // Fetch todos count
      const todosResponse = await fetch("http://localhost:5000/api/todos", { headers });
      const todos = todosResponse.ok ? await todosResponse.json() : [];

      const completedTodos = todos.filter(todo => todo.completed).length;

      setStats({
        totalNotes: notes.length,
        totalTodos: todos.length,
        completedTodos: completedTodos,
        loading: false
      });
    } catch (error) {
      console.error("Error fetching stats:", error);
      setStats(prev => ({ ...prev, loading: false }));
    }
  };

  // Load stats on component mount
  useEffect(() => {
    fetchStats();

    // Refresh stats every 30 seconds
    const interval = setInterval(fetchStats, 30000);
    return () => clearInterval(interval);
  }, []);

  // Logout function
  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login", { replace: true });
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        background: "linear-gradient(135deg, #e0e7ff 0%, #f0fdfa 100%)",
      }}
    >
      {/* Sidebar - keep existing code */}
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

        <Link
          to="/notes"
          style={linkStyle}
          onMouseOver={(e) => (e.currentTarget.style.background = "#475569")}
          onMouseOut={(e) => (e.currentTarget.style.background = "#334155")}
        >
          <MdNote size={28} />
          <span style={{ fontSize: "1.1rem", fontWeight: 500 }}>Notes</span>
        </Link>

        <Link
          to="/todos"
          style={linkStyle}
          onMouseOver={(e) => (e.currentTarget.style.background = "#475569")}
          onMouseOut={(e) => (e.currentTarget.style.background = "#334155")}
        >
          <MdChecklist size={28} />
          <span style={{ fontSize: "1.1rem", fontWeight: 500 }}>To-Do</span>
        </Link>

        <button
          onClick={handleLogout}
          style={{
            ...linkStyle,
            border: "none",
            cursor: "pointer",
            backgroundColor: "#dc2626",
            marginTop: "auto",
            marginBottom: "1rem"
          }}
          onMouseOver={(e) => (e.currentTarget.style.background = "#b91c1c")}
          onMouseOut={(e) => (e.currentTarget.style.background = "#dc2626")}
        >
          <MdLogout size={28} />
          <span style={{ fontSize: "1.1rem", fontWeight: 500 }}>Logout</span>
        </button>
      </nav>

      {/* Main Content */}
      <main
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          padding: "2rem",
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
            marginBottom: "3rem",
            textAlign: "center",
          }}
        >
          Your desktop manager is running.
          <br />
          Start by exploring the Notes or To-Do section, or use voice commands below!
        </p>

        {/* Updated Widgets Grid */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
          gap: "2rem",
          width: "100%",
          maxWidth: "1200px",
          marginBottom: "3rem"
        }}>
          {/* Weather Widget */}
          <WeatherWidget />

          {/* Updated Quick Stats Widget with Real Data */}
          <div className="bg-white rounded-xl p-6 shadow-lg">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-800">📊 Quick Stats</h3>
              <button
                onClick={fetchStats}
                className="bg-blue-100 hover:bg-blue-200 text-blue-600 p-2 rounded-lg transition-colors"
                disabled={stats.loading}
              >
                {stats.loading ? "⏳" : "🔄"}
              </button>
            </div>

            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">📝 Total Notes</span>
                <span className="font-bold text-blue-600 text-lg">
                  {stats.loading ? "..." : stats.totalNotes}
                </span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-gray-600">📋 Total Tasks</span>
                <span className="font-bold text-orange-600 text-lg">
                  {stats.loading ? "..." : stats.totalTodos}
                </span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-gray-600">✅ Completed Tasks</span>
                <span className="font-bold text-green-600 text-lg">
                  {stats.loading ? "..." : stats.completedTodos}
                </span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-gray-600">🎤 Voice Commands</span>
                <span className="font-bold text-purple-600">Active</span>
              </div>

              {/* Progress Bar for Task Completion */}
              {stats.totalTodos > 0 && (
                <div className="mt-4">
                  <div className="flex justify-between text-sm text-gray-600 mb-1">
                    <span>Progress</span>
                    <span>{Math.round((stats.completedTodos / stats.totalTodos) * 100)}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-green-500 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${(stats.completedTodos / stats.totalTodos) * 100}%` }}
                    ></div>
                  </div>
                </div>
              )}
            </div>
          </div>

          <LiveClock />
        </div>

        {/* Voice + AI Assistant */}
        <div style={{
          display: "flex",
          gap: "2rem",
          flexWrap: "wrap",
          justifyContent: "center",
        }}>
          <VoiceCommand />
          <AIAssistant />
        </div>

        {/* Footer */}
        <div
          style={{
            marginTop: "3rem",
            color: "#64748b",
            fontStyle: "italic",
            textAlign: "center",
          }}
        >
          🎉 VoxDesk - Your Voice-Powered Desktop Manager
        </div>
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