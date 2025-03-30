import React, { useEffect, useState } from "react";
//import { useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router-dom";
import { AiFillEye, AiFillEyeInvisible } from "react-icons/ai";
import '../App.css';
import CheckBox from '../components/CheckBox';
import Header from "../components/Header";
import Footer from "../components/Footer";

function Login() {
    const [username, setUsername] = useState("")
    const [password, setPassword] = useState("")
    const [errorMessage, setMessage] = useState("")
    const [showPassword, setShowPassword] = useState(false);
    const [rememberMe, setRememberMe] = useState(true);
    const navigate = useNavigate()

    useEffect(() => {
        document.title = "Login Page";

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
            //const response = await fetch("http://44.202.51.190:8000/api/login-cognito/", {
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
                if(data.lockout_until) {
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

    const handleRememberMeChange = (e) => {
        setRememberMe(e.target.checked);
        if (e.target.checked) {
            localStorage.setItem("savedUsername", username);
        } else {
            localStorage.removeItem("savedUsername");
        }
    };

    return (
        <div style={{
            minHeight: "100vh",
            fontFamily: "'Segoe UI', Roboto, 'Helvetica Neue', sans-serif",
            backgroundColor: "#f9f9f9",
            display: "flex",
            flexDirection: "column"
        }}>
            <Header />
            
            <main style={{ 
                flex: "1", 
                display: "flex", 
                flexDirection: "column",
                alignItems: "center", 
                justifyContent: "center", 
                padding: "40px 20px" 
            }}>
                <h1 style={{ fontSize: "48px", color: "#333333", marginBottom: "20px" }}>Login Page</h1>

                <div style={{
                    backgroundColor: "#FFFFFF",
                    padding: "30px",
                    borderRadius: "8px",
                    boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.1)",
                    width: "400px",
                    textAlign: "center",
                    marginBottom: "30px"
                }}>
                    <form onSubmit={handleSubmit}>
                        <input type="text" placeholder='Username' value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            required
                            style={{
                                width: "95%",
                                padding: "10px",
                                marginBottom: "10px",
                                borderRadius: "5px",
                                border: "1px solid #333333"
                            }} />
                        <br />

                        <div className="passwords" style={{ position: "relative" }}>
                            <input type={showPassword ? "text" : "password"} placeholder='Password'
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                style={{
                                    width: "95%",
                                    padding: "10px",
                                    marginBottom: "10px",
                                    borderRadius: "5px",
                                    border: "1px solid #333333"
                                }} />
                            <span className="password-eye" onClick={handleShowPassword}
                                style={{
                                    position: "absolute",
                                    right: "10px",
                                    top: "20px",
                                    cursor: "pointer"
                                }}>
                                {showPassword ? <AiFillEye /> : <AiFillEyeInvisible />}
                            </span>
                        </div>

                        {errorMessage && <div style={{ color: "red", marginBottom: "10px" }}>{errorMessage}</div>}

                        <CheckBox label="Remember Me" checked={rememberMe} onChange={handleRememberMeChange} />

                        <p>
                            <Link to="/forgot-password" style={{ color: "#F56600", cursor: "pointer" }}>
                                Forgot Password?
                            </Link>
                        </p>


                        <input type="submit" value="Login"
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

                    <br />
                    <p style={{
                        color: "#333333"
                    }
                    }>Don't have an account? <Link to="/account-creation"
                        style={{
                            color: "#F56600",
                            cursor: "pointer",
                        }}>
                            Register</Link></p>
                </div>
            </main>
            
            <Footer />
        </div>
    );
}

export default Login;