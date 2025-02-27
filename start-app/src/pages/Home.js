import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import HomePage1 from "../images/HomePage1.jpg";
import HomePage2 from "../images/HomePage2.jpg";
import HomePage3 from "../images/HomePage3.jpg";


function Home() {
    const images = [HomePage1, HomePage2, HomePage3];

    const [currentIndex, setCurrentIndex] = useState(0);

    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentIndex((prevIndex) => (prevIndex + 1) % images.length);
        }, 3000);

        return () => clearInterval(interval);
    }, [images.length]);

    const carouselStyle = {
        width: "25%",  // Adjust the width of the carousel
        height: "auto", // Adjust height based on image aspect ratio
        position: "relative",
        overflow: "hidden",
        margin: "20px 0",
    };

    const imageStyle = {
        width: "100%",   // Ensure image scales to 100% width of the container
        height: "100%",  // Let the height adjust automatically based on the width
        objectFit: "contain",  // Keeps the entire image visible without cropping
    };

    // Container style for centering everything
    const containerStyle = {
        display: "flex",          // Apply flexbox
        flexDirection: "column",  // Stack elements vertically
        justifyContent: "center", // Center content vertically
        alignItems: "center",     // Center content horizontally
        minHeight: "100vh",       // Ensure the container takes up the full height of the viewport
        textAlign: "center",      // Center the text
    };

    // Button container to center and space out the buttons
    const buttonContainerStyle = {
        display: "flex",
        justifyContent: "center", // Center buttons horizontally
        gap: "20px",              // Add space between buttons
        marginBottom: "20px",     // Optional: Add space below the buttons
    };

    return (
        <div style={containerStyle}>
            <h1 style={{ fontSize: "60px", color: "#333333", marginBottom: "20px" }}> Welcome to the Driver Incentive Program<br />Home Page!</h1>
            <h2 style={{ fontSize: "20px", color: "#333333", marginBottom: "20px" }}>
                Login or create account below
            </h2>

            <div style={buttonContainerStyle}>
                <Link to="/login">
                    <button
                        style={{
                            backgroundColor: "#F56600",
                            color: "#FFFFFF",
                            border: "none",
                            fontSize: "1vw",
                            borderRadius: "5px",
                            padding: ".5vw 1.5vw",
                            cursor: "pointer",
                            transition: "background-color 0.3s ease",
                            marginRight: "5px",
                        }}
                        onMouseEnter={(e) => e.target.style.backgroundColor = "#522D80"}
                        onMouseLeave={(e) => e.target.style.backgroundColor = "#f56000"}
                    >Login
                    </button>
                </Link>
                <Link to="/account-creation">
                    <button
                        style={{
                            backgroundColor: "#F56600",
                            color: "#FFFFFF",
                            border: "none",
                            fontSize: "1vw",
                            borderRadius: "5px",
                            padding: ".5vw 1.5vw",
                            cursor: "pointer",
                            transition: "background-color 0.3s ease",
                            marginRight: "5px",
                        }}
                        onMouseEnter={(e) => e.target.style.backgroundColor = "#522D80"}
                        onMouseLeave={(e) => e.target.style.backgroundColor = "#f56000"}
                    >
                        Create Account
                    </button>
                </Link>
                <Link to="/about">
                    <button
                        style={{
                            backgroundColor: "#F56600",
                            color: "#FFFFFF",
                            border: "none",
                            fontSize: "1vw",
                            borderRadius: "5px",
                            padding: ".5vw 1.5vw",
                            cursor: "pointer",
                            transition: "background-color 0.3s ease",
                        }}
                        onMouseEnter={(e) => e.target.style.backgroundColor = "#522D80"}
                        onMouseLeave={(e) => e.target.style.backgroundColor = "#f56000"}
                    >
                        About
                    </button>
                </Link>
                <Link to="/applications">
                    <button
                        style={{
                            backgroundColor: "#F56600",
                            color: "#FFFFFF",
                            border: "none",
                            fontSize: "1vw",
                            borderRadius: "5px",
                            padding: ".5vw 1.5vw",
                            cursor: "pointer",
                            transition: "background-color 0.3s ease",
                        }}
                        onMouseEnter={(e) => e.target.style.backgroundColor = "#522D80"}
                        onMouseLeave={(e) => e.target.style.backgroundColor = "#f56000"}
                    >
                        Applications
                    </button>
                </Link>
               
            </div>

            <div style={carouselStyle}>
                <img
                    src={images[currentIndex]}
                    alt={`Slide ${currentIndex}`}
                    style={imageStyle}
                />
            </div>
        </div>
    );
}

export default Home;
