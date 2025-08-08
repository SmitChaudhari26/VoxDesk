// import { Link } from 'react-router-dom';
// import { MdNote } from 'react-icons/md';
// import React from "react";

// function DesktopManager() {
//   return (
//     <div style={{ padding: "2rem", textAlign: "center" }}>
//       <h1>Welcome to VoxDesk!</h1>
//       <p>Your desktop manager is running.</p>
//       <Link to="/notes">
//         <MdNote size={32} title="Go to Notes" />
//         <button>Go to Notes</button>
//       </Link>
//     </div>
//   );
// }

// export default DesktopManager;

import { Link } from 'react-router-dom';
import { MdNote } from 'react-icons/md';
import React from "react";

function DesktopManager() {
  return (
    <div style={{
      minHeight: "100vh",
      display: "flex",
      background: "linear-gradient(135deg, #e0e7ff 0%, #f0fdfa 100%)"
    }}>
      {/* Sidebar */}
      <nav style={{
        width: "220px",
        background: "#1e293b",
        color: "#fff",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        padding: "2rem 0",
        boxShadow: "2px 0 8px rgba(30,41,59,0.08)"
      }}>
        <h2 style={{
          fontWeight: "bold",
          fontSize: "1.5rem",
          marginBottom: "3rem",
          letterSpacing: "1px"
        }}>
          VoxDesk
        </h2>
        <Link
          to="/notes"
          style={{
            display: "flex",
            alignItems: "center",
            gap: "0.75rem",
            color: "#fff",
            textDecoration: "none",
            padding: "0.75rem 1.5rem",
            borderRadius: "8px",
            marginBottom: "1rem",
            background: "#334155",
            transition: "background 0.2s"
          }}
          onMouseOver={e => e.currentTarget.style.background = "#475569"}
          onMouseOut={e => e.currentTarget.style.background = "#334155"}
        >
          <MdNote size={28} />
          <span style={{ fontSize: "1.1rem", fontWeight: 500 }}>Notes</span>
        </Link>
        {/* Add more sidebar links here */}
      </nav>

      {/* Main Content */}
      <main style={{
        flex: 1,
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center"
      }}>
        <h1 style={{
          fontSize: "2.5rem",
          fontWeight: "bold",
          color: "#1e293b",
          marginBottom: "1rem"
        }}>
          Welcome to VoxDesk!
        </h1>
        <p style={{
          fontSize: "1.25rem",
          color: "#334155",
          marginBottom: "2rem"
        }}>
          Your desktop manager is running.<br />
          Start by exploring the Notes section or add more features soon!
        </p>
        {/* Placeholder for future components */}
        <div style={{
          marginTop: "2rem",
          color: "#64748b",
          fontStyle: "italic"
        }}>
          {/* Future widgets/components will appear here */}
          More features coming soon...
        </div>
      </main>
    </div>
  );
}

export default DesktopManager;