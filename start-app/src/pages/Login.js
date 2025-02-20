import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { FaUser } from "react-icons/fa";
import { AiFillEye, AiFillEyeInvisible } from "react-icons/ai";
import '../App.css';

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
    }

    return (
        <div className='login'>
            <form onSubmit={handleSubmit}>
                <h1>Login Page</h1>
                <div className="input-box">
                    <input type="text" placeholder='Username' required />
                    <FaUser className="icon" />
                </div>

                <div className="input-box passwords">
                    <input 
                        type={showPassword ? "text" : "password"} 
                        placeholder='Password' 
                        required 
                    />
                    <span className="password-eye" onClick={handleShowPassword}>
                        {showPassword ? <AiFillEye /> : <AiFillEyeInvisible />}
                    </span>
                </div>

                {errorMessage && <div className="error-message">{errorMessage}</div>}

                <div className="remember-forgot">
                    <label><input type="checkbox" />Remember me</label>
                    <a href="#">Forgot Password</a>
                </div>

                <button type="submit">Login</button>

                <div className="register-link">
                    <p>Don't have an account? <a href="/account-creation">Register</a></p>
                </div>
            </form>

            <div className="home-link">
                <Link to="/">
                    <button>Home</button>
                </Link>
            </div>
        </div>
    );
}

export default Login;