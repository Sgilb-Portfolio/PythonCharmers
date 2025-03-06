import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

function ResetPassword() {
    const [username, setUsername] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [errorMessage, setErrorMessage] = useState("");
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setErrorMessage("");

        if (newPassword !== confirmPassword) {
            setErrorMessage("Passwords do not match!");
            return;
        }

        try {
            const response = await fetch("http://44.202.51.190:8000/api/reset-password/", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ username, new_password: newPassword, confirm_password: confirmPassword }),
            });

            const data = await response.json();

            if (response.ok) {
                alert("Password reset successful!");
                navigate("/login"); // Redirect to login page
            } else {
                setErrorMessage(data.error || "An error occurred.");
            }
        } catch (error) {
            setErrorMessage("Server error. Please try again.");
        }
    };

    return (
        <div style={styles.container}>
            <div style={styles.card}>
                <h1 style={styles.title}>Reset Password</h1>
                <p style={styles.subtitle}>Enter your username and create a new password.</p>
                <form onSubmit={handleSubmit} style={styles.form}>
                    <input
                        type="text"
                        placeholder="Username"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        required
                        style={styles.input}
                    />
                    <input
                        type="password"
                        placeholder="New Password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        required
                        style={styles.input}
                    />
                    <input
                        type="password"
                        placeholder="Confirm New Password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        required
                        style={styles.input}
                    />
                    {errorMessage && <p style={styles.error}>{errorMessage}</p>}
                    <button type="submit" style={styles.button}>Reset Password</button>
                </form>
            </div>
        </div>
    );
}

const styles = {
    container: {
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        minHeight: "100vh",
        backgroundColor: "#f4f4f4",
    },
    card: {
        backgroundColor: "#fff",
        padding: "30px",
        borderRadius: "10px",
        boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.1)",
        width: "400px",
        textAlign: "center",
    },
    title: {
        fontSize: "28px",
        fontWeight: "bold",
        color: "#333",
        marginBottom: "10px",
    },
    subtitle: {
        fontSize: "14px",
        color: "#666",
        marginBottom: "20px",
    },
    form: {
        display: "flex",
        flexDirection: "column",
    },
    input: {
        width: "100%",
        padding: "12px",
        marginBottom: "15px",
        borderRadius: "5px",
        border: "1px solid #ccc",
        fontSize: "16px",
    },
    button: {
        width: "100%",
        backgroundColor: "#f56600",
        color: "#FFFFFF",
        border: "none",
        padding: "12px",
        fontSize: "18px",
        fontWeight: "bold",
        borderRadius: "5px",
        cursor: "pointer",
        transition: "background-color 0.3s ease",
    },
    buttonHover: {
        backgroundColor: "#522D80",
    },
    error: {
        color: "red",
        fontSize: "14px",
        marginBottom: "10px",
    },
};

export default ResetPassword;
