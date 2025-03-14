import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import HomePage1 from "../images/HomePage1.jpg";
import HomePage2 from "../images/HomePage2.jpg";
import HomePage3 from "../images/HomePage3.jpg";
import { FaUserCircle } from "react-icons/fa";


function Home() {
    const images = [HomePage1, HomePage2, HomePage3];

    const [currentIndex, setCurrentIndex] = useState(0);
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentIndex((prevIndex) => (prevIndex + 1) % images.length);
        }, 3000);

        return () => clearInterval(interval);
    }, [images.length]);

    const toggleDropdown = () => {
        setDropdownOpen(!dropdownOpen);
    }

    const handleLogout = () => {
        localStorage.removeItem("userToekn");
        navigate("/login")
    }
    const carouselStyle = {
        width: "25%",  
        height: "auto", 
        position: "relative",
        overflow: "hidden",
        margin: "20px 0",
    };

    const imageStyle = {
        width: "100%", 
        height: "100%",  
        objectFit: "contain",
    };

    
    const containerStyle = {
        display: "flex",         
        flexDirection: "column", 
        justifyContent: "center", 
        alignItems: "center",
        minHeight: "100vh",
        textAlign: "center",
    };

    const buttonContainerStyle = {
        display: "flex",
        justifyContent: "center",
        gap: "20px",   
        marginBottom: "20px",  
    };

    const helpLinkContainer = {
        position: "absolute",
        bottom: "30px",
        textAlign: "center",
    };

    const helpLinkStyle = {
        fontSize: "18px",
        color: "#F56600",
        textDecoration: "none",
        fontWeight: "bold",
    };

    return (
        <div style={containerStyle}>
            <div style={{ position: "absolute", top: "20px", right: "30px", cursor: "pointer" }}>
                <FaUserCircle size={40} color="#333" onClick={toggleDropdown} />
                {dropdownOpen && (
                    <div style={{
                        position: "absolute",
                        top: "45px",
                        right: "0",
                        backgroundColor: "white",
                        boxShadow: "0px 4px 8px rgba(0, 0, 0, 0.2)",
                        borderRadius: "5px",
                        width: "150px",
                        textAlign: "left",
                        padding: "10px"
                    }}>
                        <Link to="/profile" style={{ textDecoration: "none", color: "#333", display: "block", padding: "10px" }}>
                            Profile
                        </Link>
                        <hr />
                        <button onClick={handleLogout} style={{
                            width: "100%",
                            background: "none",
                            border: "none",
                            color: "#d9534f",
                            cursor: "pointer",
                            padding: "10px",
                            textAlign: "left"
                        }}>Logout</button>
                    </div>
                )}
            </div>
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

            <div style={helpLinkContainer}>
                <Link to="/help" style={helpLinkStyle}>
                        Need help? Visit our Help & Support Page
                </Link>
            </div>
        </div>
    );
}

export default Home;
