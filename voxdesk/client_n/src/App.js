import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Login from "./auth/Login";
import Register from "./auth/Register";
import SignUp from "./auth/SignUp";
import DesktopManager from "./components/DesktopManager";
import Profile from "./auth/Profile";
import LoginSuccess from "./auth/LoginSuccess";

// Simple auth protection
const ProtectedRoute = ({ children }) => {
  const isAuthenticated = localStorage.getItem("token");
  return isAuthenticated ? children : <Navigate to="/login" />;
};

function App() {
  return (
    <Router>
      <Routes>
        {/*This code is pasted so that like to push each time the login part,,*\<Route path="/" element={<Navigate to="/login" />} />}
        {/* Root route - redirect to desktop if logged in, otherwise to login */}
        <Route path="/" element={<Navigate to="/login" />} />

        {/* Auth routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/login/success" element={<LoginSuccess />} />

        {/* Protected routes */}
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
            <DesktopManager />
          </ProtectedRoute>
        } />
        <Route path="/todos" element={
          <ProtectedRoute>
            <DesktopManager />
          </ProtectedRoute>
        } />
      </Routes>
    </Router>
  );
}

export default App;