import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FaUserCircle, FaBars, FaTimes, FaShoppingCart } from "react-icons/fa";

const Header = () => {
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const navigate = useNavigate();

    const toggleDropdown = () => setDropdownOpen(!dropdownOpen);
    const toggleMobileMenu = () => setMobileMenuOpen(!mobileMenuOpen);

    const idToken = localStorage.getItem("IdToken") || null;
    const cart = JSON.parse(localStorage.getItem("cart")) || [];
    const cartCount = cart.reduce((count, item) => count + item.quantity, 0);

    const userRole = localStorage.getItem("userRole");
    const isAdmin = userRole === "admin";
    const isDriver = userRole === "driver";
    const [driverPoints, setDriverPoints] = useState(null);
    const username = localStorage.getItem("user");

    useEffect(() => {
        // Fetch driver points if the user is a driver
        if (isDriver && username) {
            fetchDriverPoints(username);
        }
    }, [isDriver, username]);

    const fetchDriverPoints = async (username) => {
        try {
            const response = await fetch(`http://localhost:8000/api/get-driver-points/${username}`);
            //const response = await fetch(`http://44.202.51.190:8000/api/get-driver-points/${username}`);
            if (response.ok) {
                const data = await response.json();
                setDriverPoints(data.points);
            }
        } catch (error) {
            console.error("Error fetching driver points:", error);
        }
    };

    const handleLogout = () => {
        localStorage.removeItem("IdToken");
        localStorage.removeItem("AccessToken");
        localStorage.removeItem("RefreshToken");
        localStorage.removeItem("userType");
        localStorage.removeItem("userRole");
        localStorage.removeItem("session");
        localStorage.removeItem("userBio");
        localStorage.removeItem("profilePicture");
        localStorage.removeItem("user");
        navigate("/login");
    };

    return (
        <div style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            padding: "15px 30px",
            backgroundColor: "#003366", // Deep blue
            boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            zIndex: 100
        }}>
            <h1 style={{
                fontSize: "28px",
                fontWeight: "600",
                color: "#ffffff",
                margin: 0,
                letterSpacing: "-0.5px",
                flex: "1",
                textAlign: "center"
            }}>
                <Link to="/" style={{
                    color: "#ffffff",
                    textDecoration: "none",
                    transition: "color 0.2s"
                }}>
                    Driver Incentive Program
                </Link>
            </h1>

            <div style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flex: "1"
            }}>
                <Link to="/" style={{
                    margin: "0 10px",
                    textDecoration: "none",
                    color: "#ffffff",
                    fontWeight: "500",
                    transition: "color 0.2s"
                }}>Home</Link>

                <Link to="/about" style={{
                    margin: "0 10px",
                    textDecoration: "none",
                    color: "#ffffff",
                    fontWeight: "500",
                    transition: "color 0.2s"
                }}>About</Link>

                {idToken && (userRole === "driver") && (
                    <Link to="/applications" style={{
                        margin: "0 10px",
                        textDecoration: "none",
                        color: "#ffffff",
                        fontWeight: "500",
                        transition: "color 0.2s"
                    }}>Applications</Link>
                )}

                {(userRole === "sponsor" || userRole === "admin") && (
                    <Link to="/points" style={{
                        margin: "0 10px",
                        textDecoration: "none",
                        color: "#ffffff",
                        fontWeight: "500",
                        transition: "color 0.2s"
                    }}>Manage Points</Link>
                )}

                {(userRole === "sponsor" || userRole === "admin") && (
                    <Link to="/sponsor-applications" style={{
                        margin: "0 10px",
                        textDecoration: "none",
                        color: "#ffffff",
                        fontWeight: "500",
                        transition: "color 0.2s"
                    }}>Applications</Link>
                )}

                {idToken && (
                    <Link to="/catalog" style={{
                        margin: "0 10px",
                        textDecoration: "none",
                        color: "#ffffff",
                        fontWeight: "500",
                        transition: "color 0.2s"
                    }}>Catalog</Link>
                )}
                
                {/* Admin-only Audit Logs Link */}
                {idToken && isAdmin && (
                    <Link to="/audit-logs" style={{
                        margin: "0 10px",
                        textDecoration: "none",
                        color: "#ffffff",
                        fontWeight: "500",
                        transition: "color 0.2s"
                    }}>Audit Logs</Link>
                )}

                <Link to="/help" style={{
                    margin: "0 10px",
                    textDecoration: "none",
                    color: "#ffffff",
                    fontWeight: "500",
                    transition: "color 0.2s"
                }}>Help</Link>
            </div>

            {/* User Profile */}
            <div style={{
                position: "relative",
                display: "flex",
                alignItems: "center",
                gap: "15px",
                flex: "1",
                justifyContent: "flex-end"
            }}>
                {/* Display driver points if user is a driver - with cart styling */}
                {idToken && isDriver && driverPoints !== null && (
                    <Link to="/profile" style={{
                        textDecoration: "none",
                        color: "#ffffff",
                        fontWeight: "500",
                        padding: "8px 15px",
                        borderRadius: "20px",
                        border: "1px solid #ffffff",
                        display: "flex",
                        alignItems: "center",
                        gap: "5px",
                        transition: "all 0.2s"
                    }}>
                        <span>Points: {driverPoints}</span>
                    </Link>
                )}
                
                {idToken && (
                    // If logged in, show the cart count
                    <Link to="/cart" style={{
                        textDecoration: "none",
                        color: "#ffffff",
                        fontWeight: "500",
                        padding: "8px 15px",
                        borderRadius: "20px",
                        border: "1px solid #ffffff",
                        display: "flex",
                        alignItems: "center",
                        gap: "5px",
                        transition: "all 0.2s"
                    }}>
                        <FaShoppingCart size={20} />
                        <span>{cartCount}</span> {/* Display the cart count */}
                    </Link>
                )}
                {!idToken &&(
                    <Link to="/login" style={{
                        textDecoration: "none",
                        color: "#ffffff",
                        fontWeight: "500",
                        padding: "8px 15px",
                        borderRadius: "20px",
                        border: "1px solid #ffffff",
                        transition: "all 0.2s"
                    }}>
                        Login
                    </Link>
                )}
                {!idToken &&(
                    <Link to="/account-creation" style={{
                        textDecoration: "none",
                        color: "white",
                        fontWeight: "500",
                        padding: "8px 15px",
                        borderRadius: "20px",
                        backgroundColor: "#F56600",
                        transition: "all 0.2s"
                    }}>
                        Sign Up
                    </Link>
                )}
                {idToken && (
                    <div>
                        <FaUserCircle
                            size={35}
                            color="#ffffff" // Changed to white
                            onClick={toggleDropdown}
                            style={{ cursor: "pointer" }}
                        />
                        {dropdownOpen && (
                            <div style={{
                                position: "absolute",
                                top: "45px",
                                right: 0,
                                backgroundColor: "white",
                                boxShadow: "0px 4px 15px rgba(0, 0, 0, 0.15)",
                                borderRadius: "8px",
                                width: "180px",
                                textAlign: "left",
                                padding: "10px",
                                zIndex: 101
                            }}>
                                <Link to="/profile" style={{
                                    display: "block",
                                    padding: "12px 15px",
                                    textDecoration: "none",
                                    color: "#333",
                                    borderRadius: "5px",
                                    transition: "background-color 0.2s",
                                    fontWeight: "500"
                                }}>Profile</Link>
                                <hr style={{ margin: "5px 0", border: "none", borderTop: "1px solid #eee" }} />
                                <button onClick={handleLogout} style={{
                                    width: "100%",
                                    background: "none",
                                    border: "none",
                                    color: "#d9534f",
                                    cursor: "pointer",
                                    padding: "12px 15px",
                                    textAlign: "left",
                                    borderRadius: "5px",
                                    fontWeight: "500",
                                    transition: "background-color 0.2s"
                                }}>Logout</button>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Mobile Menu */}
            {mobileMenuOpen && (
                <div style={{
                    position: "fixed",
                    top: "70px",
                    left: 0,
                    right: 0,
                    backgroundColor: "white",
                    boxShadow: "0 4px 10px rgba(0,0,0,0.1)",
                    padding: "20px",
                    zIndex: 99
                }}>
                    <Link to="/" style={{
                        display: "block",
                        padding: "15px 10px",
                        textDecoration: "none",
                        color: "#555",
                        fontWeight: "500",
                        borderBottom: "1px solid #eee"
                    }}>Home</Link>
                    <Link to="/about" style={{
                        display: "block",
                        padding: "15px 10px",
                        textDecoration: "none",
                        color: "#555",
                        fontWeight: "500",
                        borderBottom: "1px solid #eee"
                    }}>About</Link>
                    <Link to="/applications" style={{
                        display: "block",
                        padding: "15px 10px",
                        textDecoration: "none",
                        color: "#555",
                        fontWeight: "500",
                        borderBottom: "1px solid #eee"
                    }}>Applications</Link>
                    <Link to="/points" style={{
                        display: "block",
                        padding: "15px 10px",
                        textDecoration: "none",
                        color: "#555",
                        fontWeight: "500",
                        borderBottom: "1px solid #eee"
                    }}>Manage Points</Link>
                    {idToken && isAdmin && (
                        <Link to="/audit-logs" style={{
                            display: "block",
                            padding: "15px 10px",
                            textDecoration: "none",
                            color: "#555",
                            fontWeight: "500",
                            borderBottom: "1px solid #eee"
                        }}>Audit Logs</Link>
                    )}
                    {idToken && isDriver && driverPoints !== null && (
                        <div style={{
                            display: "flex",
                            alignItems: "center",
                            padding: "15px 10px",
                            color: "#555",
                            fontWeight: "500",
                            borderBottom: "1px solid #eee"
                        }}>
                            <span>Your Points: {driverPoints}</span>
                        </div>
                    )}
                    <Link to="/help" style={{
                        display: "block",
                        padding: "15px 10px",
                        textDecoration: "none",
                        color: "#555",
                        fontWeight: "500"
                    }}>Help</Link>
                </div>
            )}
        </div>
    );
};

export default Header;