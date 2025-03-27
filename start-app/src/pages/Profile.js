import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import Header from "../components/Header";
import Footer from "../components/Footer";

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
            minHeight: "100vh",
            fontFamily: "'Segoe UI', Roboto, 'Helvetica Neue', sans-serif",
            backgroundColor: "#f9f9f9",
            display: "flex",
            flexDirection: "column"
        }}>
            <Header />
            
            <main style={{ flex: "1", padding: "40px 20px" }}>
                {/* Your existing profile page content */}
                {/* ... */}
            </main>
            
            <Footer />
        </div>
    );
}

export default Profile;
