import React from "react";
import { Link } from "react-router-dom";

function Create() {
    return (
        <div>
            <h1>Account Creation Page</h1>
            <Link to="/">
                <button>Home</button>
            </Link>
        </div>
    );
}

export default Create;