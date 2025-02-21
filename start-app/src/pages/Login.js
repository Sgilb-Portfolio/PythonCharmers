import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { AiFillEye, AiFillEyeInvisible } from "react-icons/ai";
import '../App.css';
import CheckBox from '../components/CheckBox';
function Login() {
    const [showPassword, setShowPassword] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");

    useEffect(() => {
        document.title = "Login Page";
    }, []);

    const handleShowPassword = () => {
        setShowPassword((prev) => !prev);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        setErrorMessage("Invalid Credentials");
    };

    return (
        <div style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            minHeight: "100vh",
            backgroundColor: "#ffffff"
        }}>
            <h1 style={{ fontSize: "60px", color: "#333333", marginBottom: "20px" }}>Login Page</h1>

            <Link to="/">
                <button style={{
                    backgroundColor: "#F56600",
                    color: "#FFFFFF",
                    border: "none",
                    fontSize: "20px",
                    borderRadius: "5px",
                    padding: "10px 20px",
                    cursor: "pointer",
                    transition: "background-color 0.3s ease"
                }}
                    onMouseEnter={(e) => e.target.style.backgroundColor = "#522D80"}
                    onMouseLeave={(e) => e.target.style.backgroundColor = "#f56000"}
                >Home</button>
            </Link>

            <br />
            <br />
            <div style={{
                backgroundColor: "#FFFFFF",
                padding: "30px",
                borderRadius: "5px",
                boxShadow: "0px 4px 10px rgba(245, 102, 0, 1",
                width: "400px",
                textAlign: "center"
            }}>
                <form onSubmit={handleSubmit}>
                    <input type="text" placeholder='Username' required
                        style={{
                            width: "95%",
                            padding: "10px",
                            marginBottom: "10px",
                            borderRadius: "5px",
                            border: "1px solid #333333"
                        }} />
                    <br />

                    <div className="passwords" style={{ position: "relative" }}>
                        <input type={showPassword ? "text" : "password"} placeholder='Password' required
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

                    <CheckBox label = "Remember Me"/>

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
        </div>
    );
}

export default Login;