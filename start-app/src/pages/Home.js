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

    const toggleDropdown = () => setDropdownOpen(!dropdownOpen);
    const handleLogout = () => {
        localStorage.removeItem("userToken");
        navigate("/login");
    };

    return (
        <div style={{ textAlign: "center", minHeight: "100vh" }}>
            {/* Header */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "20px", backgroundColor: "#f8f8f8" }}>
                <h1 style={{ fontSize: "24px", color: "#333", margin: 0 }}>Driver Incentive Program</h1>
                <div>
                    <Link to="/login" style={{ margin: "0 10px" }}>Login</Link>
                    <Link to="/account-creation" style={{ margin: "0 10px" }}>Create Account</Link>
                    <Link to="/about" style={{ margin: "0 10px" }}>About</Link>
                    <Link to="/applications" style={{ margin: "0 10px" }}>Applications</Link>
                    <Link to="/points" style={{ margin: "0 10px" }}>Manage Points</Link>
                </div>
                <div style={{ position: "relative" }}>
                    <FaUserCircle size={30} color="#333" onClick={toggleDropdown} style={{ cursor: "pointer" }} />
                    {dropdownOpen && (
                        <div style={{ position: "absolute", top: "35px", right: 0, backgroundColor: "white", boxShadow: "0px 4px 8px rgba(0, 0, 0, 0.2)", borderRadius: "5px", width: "150px", textAlign: "left", padding: "10px" }}>
                            <Link to="/profile" style={{ display: "block", padding: "10px", textDecoration: "none", color: "#333" }}>Profile</Link>
                            <hr />
                            <button onClick={handleLogout} style={{ width: "100%", background: "none", border: "none", color: "#d9534f", cursor: "pointer", padding: "10px", textAlign: "left" }}>Logout</button>
                        </div>
                    )}
                </div>
            </div>

            {/* Main Content */}
            <h2 style={{ fontSize: "20px", color: "#333", marginTop: "20px" }}>Welcome to the Driver Incentive Program Home Page!</h2>
            <p>Login or create an account below</p>

            {/* Carousel */}
            <div style={{ width: "25%", margin: "20px auto", overflow: "hidden" }}>
                <img src={images[currentIndex]} alt={`Slide ${currentIndex}`} style={{ width: "100%", height: "auto", objectFit: "contain" }} />
            </div>

            {/* Help Link */}
            <div style={{ marginTop: "20px" }}>
                <Link to="/help" style={{ fontSize: "18px", color: "#F56600", textDecoration: "none", fontWeight: "bold" }}>Need help? Visit our Help & Support Page</Link>
            </div>
        </div>
    );
}

export default Home;
