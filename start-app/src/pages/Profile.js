import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../components/Header";
import Footer from "../components/Footer";

function Profile() {
    const [userType, setUserType] = useState("");
    const [bio, setBio] = useState("");
    const [editBio, setEditBio] = useState(false);
    const [profilePicture, setProfilePicture] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        const storedUserType = localStorage.getItem("userType") || "Driver";
        setUserType(storedUserType);

        const storedBio = localStorage.getItem("userBio") || "No bio available.";
        setBio(storedBio);

        const storedProfilePicture = localStorage.getItem("profilePicture");
        if (storedProfilePicture) {
            setProfilePicture(storedProfilePicture);
        }
    }, []);

    const handleLogout = () => {
        localStorage.removeItem("IdToken");
        localStorage.removeItem("AccessToken");
        localStorage.removeItem("RefreshToken");
        localStorage.removeItem("userType");
        localStorage.removeItem("userBio");
        localStorage.removeItem("profilePicture");
        navigate("/login");
    };

    const handleSaveBio = () => {
        localStorage.setItem("userBio", bio);
        setEditBio(false);
    };

    const handleProfilePictureChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                localStorage.setItem("profilePicture", reader.result);  // Store image in localStorage
                setProfilePicture(reader.result);  // Update the profile picture state
            };
            reader.readAsDataURL(file);  // Convert the image to base64 and load it
        }
    };

    const handleFileInputClick = () => {
        document.getElementById("fileInput").click();
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
                <div style={{ maxWidth: "600px", margin: "0 auto", textAlign: "center" }}>
                    <h2>Profile Picture</h2>
                    <div style={{
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                        marginBottom: "20px"
                    }}>
                        {profilePicture ? (
                            <img
                                src={profilePicture}
                                alt="Profile"
                                style={{ width: "150px", height: "150px", borderRadius: "50%" }}
                            />
                        ) : (
                            <div style={{
                                width: "150px",
                                height: "150px",
                                borderRadius: "50%",
                                backgroundColor: "#ccc"
                            }} />
                        )}
                    </div>

                    <input 
                        type="file" 
                        accept="image/*" 
                        onChange={handleProfilePictureChange} 
                        style={{ display: "none" }} 
                        id="fileInput" 
                    />
                    
                    <button
                        onClick={handleFileInputClick}
                        style={{
                            backgroundColor: "#F56600",
                            color: "#fff",
                            border: "none",
                            padding: "8px 15px",
                            borderRadius: "5px",
                            cursor: "pointer",
                            transition: "background-color 0.3s ease"
                        }}
                        onMouseEnter={(e) => e.target.style.backgroundColor = "#522D80"}
                        onMouseLeave={(e) => e.target.style.backgroundColor = "#F56600"}
                    >
                        Change Profile Picture
                    </button>
                    
                    <h2>Bio</h2>
                    {editBio ? (
                        <div>
                            <textarea 
                                value={bio} 
                                onChange={(e) => setBio(e.target.value)} 
                                rows="4"
                                style={{
                                    width: "100%",
                                    padding: "10px",
                                    borderRadius: "5px",
                                    border: "1px solid #ccc",
                                    resize: "none"
                                }}
                            />
                            <button onClick={handleSaveBio} style={{
                                marginTop: "10px",
                                backgroundColor: "#F56600",
                                color: "#fff",
                                border: "none",
                                padding: "8px 15px",
                                borderRadius: "5px",
                                cursor: "pointer",
                                transition: "background-color 0.3s ease"
                            }}
                                onMouseEnter={(e) => e.target.style.backgroundColor = "#522D80"}
                                onMouseLeave={(e) => e.target.style.backgroundColor = "#F56600"}
                            >Save</button>
                        </div>
                    ) : (
                        <div>
                            <p style={{ fontSize: "18px", color: "#555" }}>{bio}</p>
                            <button onClick={() => setEditBio(true)} style={{
                                backgroundColor: "#F56600",
                                color: "#fff",
                                border: "none",
                                padding: "8px 15px",
                                borderRadius: "5px",
                                cursor: "pointer",
                                transition: "background-color 0.3s ease"
                            }}
                                onMouseEnter={(e) => e.target.style.backgroundColor = "#522D80"}
                                onMouseLeave={(e) => e.target.style.backgroundColor = "#F56600"}
                            >Edit Bio</button>
                        </div>
                    )}
                </div>
            </main>

            <Footer />
        </div>
    );
}

export default Profile;
