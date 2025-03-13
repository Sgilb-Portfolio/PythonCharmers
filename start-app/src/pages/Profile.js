import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";

function Profile() {
    const [userType, setUserType] = useState("");
    const [showModal, setShowModal] = useState(false);
    const [oldPassword, setOldPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const navigate = useNavigate();

    useEffect(() => {
        const storedUserType = localStorage.getItem("userType") || "Driver";
        setUserType(storedUserType);
    }, []);

    const handleLogout = () => {
        localStorage.removeItem("IdToken");
        localStorage.removeItem("AccessToken");
        localStorage.removeItem("RefreshToken");
        localStorage.removeItem("userType");
        navigate("/login");
    };

    const handleOpenModal = () => setShowModal(true);
    const handleCloseModal = () => {
        setShowModal(false);
        setOldPassword("");
        setNewPassword("");
        setConfirmPassword("");
    };

    const handleSavePassword = () => {
        console.log("New password set (not implemented yet)");
        handleCloseModal();
    };

    return (
        <div style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            minHeight: "100vh",
            background: "linear-gradient(to right, #f56600, #522D80)",
            color: "#fff"
        }}>
            <div style={{
                backgroundColor: "#FFFFFF",
                padding: "40px",
                borderRadius: "10px",
                boxShadow: "0px 4px 15px rgba(0, 0, 0, 0.2)",
                textAlign: "center",
                width: "400px"
            }}>
                <h1 style={{ fontSize: "32px", color: "#333333", marginBottom: "10px" }}>Profile</h1>
                <hr style={{ border: "1px solid #f56600", marginBottom: "20px" }} />
                <p style={{ fontSize: "20px", color: "#555555", marginBottom: "20px" }}>
                    User Type: <strong>{userType}</strong>
                </p>

                {/* Buttons */}
                <div style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
                    
                    {/* Home Button */}
                    <Link to="/">
                        <button style={buttonStyle}>Home</button>
                    </Link>

                    {/* Change Password Button */}
                    <button style={buttonStyle} onClick={handleOpenModal}>
                        Change Password
                    </button>

                    {/* Logout Button */}
                    <button onClick={handleLogout} style={logoutButtonStyle}>
                        Logout
                    </button>
                </div>
            </div>

            {/* Password Change Modal */}
            {showModal && (
                <div style={modalOverlay}>
                    <div style={modalStyle}>
                        <h2 style={{ color: "#333", marginBottom: "15px" }}>Change Password</h2>
                        <hr style={{ border: "1px solid #f56600", marginBottom: "15px" }} />

                        {/* Old Password */}
                        <input 
                            type="password" 
                            placeholder="Old Password" 
                            value={oldPassword} 
                            onChange={(e) => setOldPassword(e.target.value)}
                            style={inputStyle}
                        />

                        {/* New Password */}
                        <input 
                            type="password" 
                            placeholder="New Password" 
                            value={newPassword} 
                            onChange={(e) => setNewPassword(e.target.value)}
                            style={inputStyle}
                        />

                        {/* Confirm Password */}
                        <input 
                            type="password" 
                            placeholder="Confirm New Password" 
                            value={confirmPassword} 
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            style={inputStyle}
                        />

                        {/* Buttons */}
                        <div style={{ display: "flex", justifyContent: "space-between", marginTop: "15px" }}>
                            <button style={cancelButtonStyle} onClick={handleCloseModal}>Cancel</button>
                            <button style={buttonStyle} onClick={handleSavePassword}>Save</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

/* Styles */
const buttonStyle = {
    backgroundColor: "#f56600",
    color: "#FFFFFF",
    border: "none",
    fontSize: "18px",
    borderRadius: "5px",
    padding: "10px 20px",
    cursor: "pointer",
    width: "100%",
    transition: "0.3s ease",
    onMouseEnter: (e) => (e.target.style.backgroundColor = "#522D80"),
    onMouseLeave: (e) => (e.target.style.backgroundColor = "#f56600"),
};

const logoutButtonStyle = {
    ...buttonStyle,
    backgroundColor: "#FF0000",
    onMouseEnter: (e) => (e.target.style.backgroundColor = "#990000"),
    onMouseLeave: (e) => (e.target.style.backgroundColor = "#FF0000"),
};

const modalOverlay = {
    position: "fixed",
    top: "0",
    left: "0",
    width: "100%",
    height: "100%",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
};

const modalStyle = {
    backgroundColor: "#fff",
    padding: "30px",
    borderRadius: "10px",
    width: "350px",
    boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.2)",
    textAlign: "center",
};

const inputStyle = {
    width: "100%",
    padding: "10px",
    margin: "8px 0",
    borderRadius: "5px",
    border: "1px solid #ccc",
    fontSize: "16px",
};

const cancelButtonStyle = {
    backgroundColor: "#555",
    color: "#FFFFFF",
    border: "none",
    fontSize: "16px",
    borderRadius: "5px",
    padding: "10px 20px",
    cursor: "pointer",
    transition: "0.3s ease",
    onMouseEnter: (e) => (e.target.style.backgroundColor = "#333"),
    onMouseLeave: (e) => (e.target.style.backgroundColor = "#555"),
}

export default Profile;
