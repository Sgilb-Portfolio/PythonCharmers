import React from "react";
import { Link } from "react-router-dom";

function Home() {
    return (
        <div>
            <h1>Welcome to the Driver Incentive Program Home Page!</h1>
            <h2>Log in or create an account using the buttons below to access the rest of the site.</h2>
            <Link to="/login">
                <button>Login</button>
            </Link>
            <Link to="/account-creation">
                <button>Create an Account</button>
            </Link>
            <Link to="/about">
                <button>About</button>
            </Link>
        </div>
    );
}

export default Home;