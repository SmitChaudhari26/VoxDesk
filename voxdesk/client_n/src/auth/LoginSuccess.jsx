import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

const LoginSuccess = () => {
    const navigate = useNavigate();

    useEffect(() => {
        // Check if there's a token
        const token = localStorage.getItem("token");

        // Redirect to desktop if logged in, otherwise to login
        if (token) {
            navigate("/desktop");
        } else {
            navigate("/login");
        }
    }, [navigate]);

    return (
        <div className="flex items-center justify-center h-screen">
            <p>Redirecting...</p>
        </div>
    );
};

export default LoginSuccess;