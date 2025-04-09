import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";

function ConfirmAccount() {
    const [username, setUsername] = useState("");
    const [confirmation_code, setCode] = useState("");
    const [message, setMessage] = useState("");
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        const Params = new URLSearchParams(location.search);
        const user = Params.get("username");
        if (user) {
            setUsername(user);
        }
    }, [location]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage("");

        try {
            // const response = await fetch("http://localhost:8000/api/confirm-cognito/", {
            const response = await fetch("http://44.202.51.190:8000/api/confirm-cognito/", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ username, confirmation_code }),
            });
            const data = await response.json();
            if (response.ok) {
                setMessage("Account confirmed successfully! Redirecting to login...");
                setTimeout(() => navigate("/login"), 1000);
            } else {
                setMessage(data.error || "Failed to confirm account.");
            }
        } catch (error) {
            setMessage("An error occurred. Please try again.");
        }
    };

    return (
        <div style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "flex-start",
            minHeight: "100vh",
            backgroundColor: "#ffffff"
        }}>
            <h2 style={{ fontSize: "40px", color: "#333333", marginBottom: "20px"}}>Account Confirmation</h2>
            <div style={{ fontSize: "18px", maxWidth: "400px", textAlign: "center"}}>
                Please enter the code sent to your email you entered during account creation.</div>
            <br />
            <form onSubmit={handleSubmit}>
                <input 
                    type="text" 
                    placeholder="Username" 
                    value={username} 
                    onChange={(e) => setUsername(e.target.value)} 
                    required
                    style={{
                        width: "95%",
                        padding: "10px",
                        marginBottom: "10px",
                        borderRadius: "5px",
                        border: "1px solid #333333"
                    }}
                />
                <br />
                <input 
                    type="text" 
                    placeholder="Verification Code" 
                    value={confirmation_code} 
                    onChange={(e) => setCode(e.target.value)} 
                    required
                    style={{
                        width: "95%",
                        padding: "10px",
                        marginBottom: "10px",
                        borderRadius: "5px",
                        border: "1px solid #333333"
                    }}
                />
                <br />
                {message && <div style={{ color: "red", marginBottom: "10px" }}>{message}</div>}
                <input type="submit" value="Confirm Account"
                    style={{
                        width: "100%",
                        backgroundColor: "#f56600",
                        color: "#FFFFFF",
                        border: "none",
                        padding: "10px",
                        fontSize: "18px",

                        borderRadius: "5px",
                        cursor: "pointer",
                        transition: "background-color 0.3s ease"
                    }}
                    onMouseEnter={(e) => e.target.style.backgroundColor = "#522D80"}
                    onMouseLeave={(e) => e.target.style.backgroundColor = "#F56600"} />
            </form>
        </div>
    );
}

export default ConfirmAccount;