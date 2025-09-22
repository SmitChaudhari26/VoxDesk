import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Login from "./auth/Login";
import Register from "./auth/Register";
import DesktopManager from "./components/DesktopManager";
import Profile from "./auth/Profile";
import NotesWindow from "./windows/NotesWindow"; // Import NotesWindow
import TodoWindow from "./windows/TodoWindow"; // Import TodoWindow

// For login/register pages - redirect to desktop if already logged in
const AuthRoute = ({ children }) => {
  const isAuthenticated = localStorage.getItem("token");
  return isAuthenticated ? <Navigate to="/desktop" replace /> : children;
};

// For protected pages - redirect to login if NOT logged in
const ProtectedRoute = ({ children }) => {
  const isAuthenticated = localStorage.getItem("token");
  return isAuthenticated ? children : <Navigate to="/login" replace />;
};

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={
          localStorage.getItem("token") ?
            <Navigate to="/desktop" replace /> :
            <Navigate to="/login" replace />
        } />

        {/* Auth routes: only show if NOT logged in */}
        <Route path="/login" element={
          <AuthRoute>
            <Login />
          </AuthRoute>
        } />
        <Route path="/register" element={
          <AuthRoute>
            <Register />
          </AuthRoute>
        } />

        {/* Protected routes: only show if logged in */}
        <Route path="/desktop" element={
          <ProtectedRoute>
            <DesktopManager />
          </ProtectedRoute>
        } />
        <Route path="/profile" element={
          <ProtectedRoute>
            <Profile />
          </ProtectedRoute>
        } />
        <Route path="/notes" element={
          <ProtectedRoute>
            <NotesWindow />
          </ProtectedRoute>
        } />
        <Route path="/todos" element={
          <ProtectedRoute>
            <TodoWindow />
          </ProtectedRoute>
        } />
      </Routes>
    </Router>
  );
}

export default App;