import React, { useState, useEffect, useRef } from "react";
import { useNavigate, Link } from "react-router-dom";

function Login() {
    const navigate = useNavigate();
    const googleBtnRef = useRef(null);
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");

    // Handle login form submission
    const handleLogin = async (e) => {
        e.preventDefault();
        setError("");

        try {
            const response = await fetch("http://localhost:5000/api/auth/login", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ email, password }),
            });

            const data = await response.json();

            if (!response.ok) {
                setError(data.message || "Login failed");
                return;
            }

            // Save token and user data
            localStorage.setItem("token", data.token);
            localStorage.setItem("user", JSON.stringify(data.user));

            // Redirect to desktop - CHANGED FROM "/" to "/desktop"
            navigate("/desktop");
        } catch (err) {
            console.error("Login error:", err);
            setError("Network error. Please try again.");
        }
    };

    // Debug and initialize Google Sign-In
    useEffect(() => {
        // Debug Google Client ID and availability
        console.log("Google script loaded:", !!window.google);
        console.log("Client ID:", process.env.REACT_APP_GOOGLE_CLIENT_ID);

        if (!window.google || !googleBtnRef.current) {
            console.warn("Google script not loaded or button ref not available");
            return;
        }

        try {
            window.google.accounts.id.initialize({
                client_id: process.env.REACT_APP_GOOGLE_CLIENT_ID,
                callback: handleGoogleCallback
            });

            window.google.accounts.id.renderButton(googleBtnRef.current, {
                theme: "filled_blue",
                size: "large",
                width: 280,
            });
        } catch (err) {
            console.error("Google initialization error:", err);
        }
    }, [navigate]);

    // Separate callback function for Google Sign-In
    const handleGoogleCallback = async (response) => {
        try {
            console.log("Google response received", response);
            const res = await fetch("http://localhost:5000/api/auth/google", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ idToken: response.credential }),
            });

            const data = await res.json();

            if (!res.ok) {
                console.error("Google auth failed:", data);
                setError(data.message || "Google sign-in failed");
                return;
            }

            localStorage.setItem("token", data.token);
            localStorage.setItem("user", JSON.stringify(data.user));

            // Redirect to desktop - CHANGED FROM "/" to "/desktop"
            navigate("/desktop");
        } catch (err) {
            console.error("Google sign-in error:", err);
            setError("Network error. Please try again.");
        }
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4">
            <div className="w-full max-w-md bg-white rounded-lg shadow-md p-6">
                <h1 className="text-2xl font-bold text-center mb-6">Login</h1>

                {error && (
                    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                        {error}
                    </div>
                )}

                <form onSubmit={handleLogin} className="space-y-4">
                    <div>
                        <input
                            type="email"
                            placeholder="Email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full p-3 border border-gray-300 rounded"
                            required
                        />
                    </div>

                    <div>
                        <input
                            type="password"
                            placeholder="Password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full p-3 border border-gray-300 rounded"
                            required
                        />
                    </div>

                    <button
                        type="submit"
                        className="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 px-4 rounded"
                    >
                        Login
                    </button>
                </form>

                <div className="my-4 text-center">
                    <span className="px-2 bg-white text-gray-500">or</span>
                </div>

                {/* Google Sign-In Button */}
                <div ref={googleBtnRef} className="flex justify-center" />

                <div className="mt-4 text-center">
                    <p>
                        Don't have an account?{" "}
                        <Link to="/register" className="text-blue-500 hover:text-blue-700">
                            Create Account
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
}

export default Login;