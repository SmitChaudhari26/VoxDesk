import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import DesktopManager from "./components/DesktopManager";
import NotesWindow from "./windows/NotesWindow"; // ✅ direct import

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<DesktopManager />} />
        <Route path="/notes" element={<NotesWindow />} />
      </Routes>
    </Router>
  );
}

export default App;
