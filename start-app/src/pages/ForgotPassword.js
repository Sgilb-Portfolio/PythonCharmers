import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

function ForgotPassword() {
    const [username, setUsername] = useState("");
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate(); // React Router navigation hook

    const handleForgotPassword = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage("");
        setError("");

        try {
            // const response = await fetch("http://localhost:8000/api/forgot-password/", {
            const response = await fetch("http://44.202.51.190:8000/api/forgot-password/", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ username }),
            });
            
            const data = await response.json();
            if (response.ok) {
                setMessage(data.message);
                
                // Redirect to Reset Password page with username
                setTimeout(() => {
                    navigate("/reset-password", { state: { username } });
                }, 2000);
            } else {
                setError(data.error || "Something went wrong");
            }
        } catch (err) {
            setError("Failed to connect to the server");
        }
        setLoading(false);
    };

    return (
        <div style={{ textAlign: "center", padding: "50px" }}>
            <h2>Forgot Password</h2>
            <p>Enter your username or email to receive a password reset code.</p>
            <form onSubmit={handleForgotPassword}>
                <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Enter your username or email"
                    required
                    style={{ padding: "10px", width: "250px", marginBottom: "10px" }}
                />
                <br />
                <button type="submit" disabled={loading} style={{ padding: "10px 20px" }}>
                    {loading ? "Sending..." : "Send Reset Code"}
                </button>
            </form>
            {message && <p style={{ color: "green" }}>{message}</p>}
            {error && <p style={{ color: "red" }}>{error}</p>}
        </div>
    );
}

export default ForgotPassword;