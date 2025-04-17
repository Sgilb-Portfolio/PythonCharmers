import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FaUserCircle, FaBars, FaTimes, FaShoppingCart } from "react-icons/fa";
import { useViewAs } from "../components/ViewAsContext"; // ✅ NEW

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

    const { viewAsRole, viewAsUserData, startImpersonation, stopImpersonation } = useViewAs(); // ✅
    const isImpersonating = viewAsRole === "driver";
    const isDriver = userRole === "driver" || isImpersonating;
    const username = isImpersonating ? viewAsUserData?.username : localStorage.getItem("user");

    const [driverPoints, setDriverPoints] = useState(null);

    useEffect(() => {
        if (isDriver && username) {
            fetchDriverPoints(username);
        }
    }, [isDriver, username]);

    const fetchDriverPoints = async (username) => {
        try {
            const response = await fetch(`http://localhost:8000/api/get-driver-points/${username}`);
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

    const handleImpersonate = () => {
        fetch(`http://localhost:8000/api/view-as-driver/60`, {
            headers: {
                Authorization: `Bearer ${idToken}`,
            },
        })
            .then(res => res.json())
            .then(data => {
                if (data.view_as === "driver") {
                    startImpersonation("driver", data.data);
                }
            })
            .catch(err => console.error("ViewAs error:", err));
    };

    return (
        <div style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            padding: "15px 30px",
            backgroundColor: "#003366",
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
                <Link to="/" style={linkStyle}>Home</Link>
                <Link to="/about" style={linkStyle}>About</Link>
                {idToken && <Link to="/applications" style={linkStyle}>Applications</Link>}
                {(userRole === "sponsor" || userRole === "admin") && (
                    <Link to="/points" style={linkStyle}>Manage Points</Link>
                )}
                {idToken && <Link to="/catalog" style={linkStyle}>Catalog</Link>}
                {idToken && isAdmin && (
                    <Link to="/audit-logs" style={linkStyle}>Audit Logs</Link>
                )}
                {idToken && (userRole === "sponsor" || userRole === "admin") && (
                    <Link to="/reports" style={linkStyle}>Reports</Link>
                )}
                <Link to="/help" style={linkStyle}>Help</Link>
            </div>

            <div style={{
                position: "relative",
                display: "flex",
                alignItems: "center",
                gap: "15px",
                flex: "1",
                justifyContent: "flex-end"
            }}>
                {/* ✅ Matching "View as Driver" and "Return" buttons */}
                {userRole === "sponsor" && !isImpersonating && (
                    <button onClick={handleImpersonate} style={whiteButton}>
                        View as Driver 60
                    </button>
                )}
                {isImpersonating && (
                    <button onClick={stopImpersonation} style={orangeButton}>
                        Return to Sponsor View
                    </button>
                )}

                {idToken && isDriver && driverPoints !== null && (
                    <Link to="/profile" style={whiteButton}>
                        <span>Points: {driverPoints}</span>
                    </Link>
                )}

                {idToken && (
                    <Link to="/cart" style={whiteButton}>
                        <FaShoppingCart size={20} />
                        <span>{cartCount}</span>
                    </Link>
                )}
                {!idToken && (
                    <Link to="/login" style={whiteButton}>
                        Login
                    </Link>
                )}
                {!idToken && (
                    <Link to="/account-creation" style={orangeButton}>
                        Sign Up
                    </Link>
                )}
                {idToken && (
                    <div>
                        <FaUserCircle
                            size={35}
                            color="#ffffff"
                            onClick={toggleDropdown}
                            style={{ cursor: "pointer" }}
                        />
                        {dropdownOpen && (
                            <div style={dropdownStyle}>
                                <Link to="/profile" style={dropdownItem}>Profile</Link>
                                <hr style={dividerStyle} />
                                <button onClick={handleLogout} style={logoutButton}>Logout</button>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

const linkStyle = {
    margin: "0 10px",
    textDecoration: "none",
    color: "#ffffff",
    fontWeight: "500",
    transition: "color 0.2s"
};

const whiteButton = {
    textDecoration: "none",
    color: "#ffffff",
    fontWeight: "500",
    padding: "8px 15px",
    borderRadius: "20px",
    border: "1px solid #ffffff",
    backgroundColor: "transparent",
    transition: "all 0.2s",
    display: "flex",
    alignItems: "center",
    gap: "5px",
    cursor: "pointer"
};

const orangeButton = {
    ...whiteButton,
    backgroundColor: "#F56600",
    border: "none"
};

const dropdownStyle = {
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
};

const dropdownItem = {
    display: "block",
    padding: "12px 15px",
    textDecoration: "none",
    color: "#333",
    borderRadius: "5px",
    transition: "background-color 0.2s",
    fontWeight: "500"
};

const logoutButton = {
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
};

const dividerStyle = {
    margin: "5px 0",
    border: "none",
    borderTop: "1px solid #eee"
};

export default Header;
