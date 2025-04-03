import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AiFillEye, AiFillEyeInvisible } from "react-icons/ai";
import Header from "../components/Header";
import Footer from "../components/Footer";

function Login() {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [errorMessage, setMessage] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [rememberMe, setRememberMe] = useState(true);
    const [session, setSession] = useState("");
    const [otpRequired, setOtpRequired] = useState(false);
    const [otpCode, setOtpCode] = useState("");
    const navigate = useNavigate();

    useEffect(() => {
        document.title = "Login | Driver Incentive Program";

        const savedUsername = localStorage.getItem("savedUsername");
        if (savedUsername) {
            setUsername(savedUsername);
            setRememberMe(true);
        }
    }, []);

    const handleShowPassword = () => {
        setShowPassword((prev) => !prev);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage(""); // Clear previous messages
    
        try {
            const response = await fetch("http://localhost:8000/api/login-cognito/", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ username, password }),
            });
    
            const data = await response.json();
            console.log("Login Response:", data);
    
            if (response.ok) {
                // If MFA is required, show MFA form
                if (data.challenge === "EMAIL_OTP") {
                    setOtpRequired(true);
                    setSession(data.session); // Store session for MFA verification
                    localStorage.setItem("session", data.session);
                    return;
                }
    
                // If authentication is successful
                localStorage.setItem("IdToken", data.IdToken);
                localStorage.setItem("AccessToken", data.AccessToken);
                localStorage.setItem("RefreshToken", data.RefreshToken);
    
                if (rememberMe) {
                    localStorage.setItem("savedUsername", username);
                } else {
                    localStorage.removeItem("savedUsername");
                }
    
                setMessage("Login successful!");
                setTimeout(() => navigate("/about"), 1000); // Redirect after success
            } else {
                // Handle error messages
                if (data.lockout_until) {
                    setMessage(`Your account is locked until ${new Date(data.lockout_until).toLocaleString()}. Please try again later.`);
                } else if (data.remaining_attempts !== undefined) {
                    setMessage(`Invalid credentials. ${data.remaining_attempts} attempts remaining.`);
                } else {
                    setMessage(data.error || "Invalid credentials. Please try again.");
                }
            }
        } catch (error) {
            setMessage("An error occurred. Please try again later.");
        }
    };

    const handleOtpSubmit = async (e) => {
        e.preventDefault();
        setMessage("");
    
        try {
            const response = await fetch("http://localhost:8000/api/verify-mfa/", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ username, mfa_code: otpCode, session }),
            });
    
            const data = await response.json();
    
            if (response.ok) {
                localStorage.setItem("IdToken", data.IdToken);
                localStorage.setItem("AccessToken", data.AccessToken);
                localStorage.setItem("RefreshToken", data.RefreshToken);
                localStorage.removeItem("session"); // Clean up session
                setMessage("OTP verification successful!");
                setTimeout(() => navigate("/about"), 1000);
            } else {
                setMessage(data.error || "OTP verification failed. Try again.");
            }
        } catch (error) {
            setMessage("An error occurred. Please try again.");
        }
    };

    const handleRememberMeChange = (e) => {
        setRememberMe(e.target.checked);
    };

    // Common styles for consistent design
    const pageContainer = {
        minHeight: "100vh",
        fontFamily: "'Segoe UI', Roboto, 'Helvetica Neue', sans-serif",
        backgroundColor: "#f9f9f9",
        display: "flex",
        flexDirection: "column"
    };

    const mainContent = {
        flex: "1", 
        display: "flex", 
        flexDirection: "column",
        alignItems: "center", 
        justifyContent: "center", 
        padding: "40px 20px"
    };
    
    const pageTitle = {
        fontSize: "36px",
        color: "#333333",
        marginBottom: "30px"
    };

    const formContainer = {
        backgroundColor: "#FFFFFF",
        padding: "30px",
        borderRadius: "8px",
        boxShadow: "0px 4px 10px rgba(245, 102, 0, 0.3)",
        width: "400px",
        maxWidth: "90%",
        textAlign: "center",
        marginBottom: "30px"
    };

    const inputStyle = {
        width: "100%",
        padding: "12px",
        marginBottom: "15px",
        borderRadius: "5px",
        border: "1px solid #dddddd",
        fontSize: "16px",
        boxSizing: "border-box"
    };

    const buttonStyle = {
        width: "100%",
        backgroundColor: "#F56600",
        color: "#FFFFFF",
        border: "none",
        padding: "12px",
        fontSize: "16px",
        fontWeight: "600",
        borderRadius: "5px",
        cursor: "pointer",
        transition: "background-color 0.3s ease",
        marginTop: "20px"
    };

    const linkStyle = {
        color: "#F56600",
        textDecoration: "none",
        fontWeight: "500"
    };

    const checkboxContainer = {
        display: "flex",
        alignItems: "center",
        justifyContent: "flex-start",
        width: "100%",
        marginTop: "10px",
        marginBottom: "15px"
    };

    const forgotPasswordContainer = {
        width: "100%",
        textAlign: "right",
        marginBottom: "20px"
    };

    const errorStyle = {
        color: "red",
        marginBottom: "15px",
        fontSize: "14px"
    };

    return (
        <div style={pageContainer}>
            <Header />
            
            <main style={mainContent}>
                <h1 style={pageTitle}>Login</h1>

                <div style={formContainer}>
                {otpRequired ? (
                    <div>
                        <h2 style={{fontSize: "24px", marginBottom: "20px"}}>Enter Email OTP</h2>
                        <form onSubmit={handleOtpSubmit}>
                            <input
                                type="text"
                                placeholder="Enter OTP"
                                value={otpCode}
                                onChange={(e) => setOtpCode(e.target.value)}
                                required
                                style={inputStyle}
                            />
                            {errorMessage && <div style={errorStyle}>{errorMessage}</div>}
                            <button type="submit" style={buttonStyle}
                                onMouseEnter={(e) => e.target.style.backgroundColor = "#522D80"}
                                onMouseLeave={(e) => e.target.style.backgroundColor = "#F56600"}>
                                Verify OTP
                            </button>
                        </form>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit}>
                        <input 
                            type="text" 
                            placeholder="Username" 
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            required
                            style={inputStyle}
                        />

                        <div style={{ position: "relative" }}>
                            <input 
                                type={showPassword ? "text" : "password"} 
                                placeholder="Password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                style={inputStyle}
                            />
                            <span 
                                onClick={handleShowPassword}
                                style={{
                                    position: "absolute",
                                    right: "12px",
                                    top: "50%",
                                    transform: "translateY(-50%)",
                                    cursor: "pointer",
                                    color: "#666666"
                                }}
                            >
                                {showPassword ? <AiFillEye size={20} /> : <AiFillEyeInvisible size={20} />}
                            </span>
                        </div>

                        {errorMessage && <div style={errorStyle}>{errorMessage}</div>}

                        <div style={checkboxContainer}>
                            <input
                                type="checkbox"
                                id="rememberMe"
                                checked={rememberMe}
                                onChange={handleRememberMeChange}
                                style={{ marginRight: "8px" }}
                            />
                            <label htmlFor="rememberMe">Remember Me</label>
                        </div>

                        <div style={forgotPasswordContainer}>
                            <Link to="/forgot-password" style={linkStyle}>
                                Forgot Password?
                            </Link>
                        </div>

                        <button 
                            type="submit" 
                            style={buttonStyle}
                            onMouseEnter={(e) => e.target.style.backgroundColor = "#522D80"}
                            onMouseLeave={(e) => e.target.style.backgroundColor = "#F56600"}
                        >
                            Login
                        </button>
                    </form>
                )}
                    <p style={{ marginTop: "25px", color: "#333333" }}>
                        Don't have an account? <Link to="/account-creation" style={linkStyle}>Register</Link>
                    </p>
                </div>
            </main>
            
            <Footer />
        </div>
    );
}

export default Login;