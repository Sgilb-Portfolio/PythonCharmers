import React from "react";
import { Form, Link } from "react-router-dom";
import { FaUser, FaLock } from "react-icons/fa";
import '../App.css';

function Login() {
    return (
        <div className='login'>
            <form action="">
                <div>
                    <title>Login Page</title>
                    <h1>Login Page</h1>
                    <div className="input-box">
                        <input type="text" placeholder='Username' required />
                        <FaUser className="icon" />
                    </div>
                    <div className="input-box">
                        <input type="password" placeholder='Password' required />
                        <FaLock className="icon" />

                    </div>

                    <div className="remember-forgot">
                        <label><input type="checkbox" />Remember me</label>
                        <a href="#">Forgot Password</a>
                    </div>

                    <button type="submit">Login</button>

                    <div className="register-link">
                        <p>Don't have an account? <a href="/account-creation">Register</a></p>
                    </div>
                    <Link to="/">
                        <button>Home</button>
                    </Link>
                </div>
            </form>
        </div>

    );
}

export default Login;