import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../components/Header";
import Footer from "../components/Footer";

function Profile() {
    const [userType, setUserType] = useState("");
    const [bio, setBio] = useState("");
    const [editBio, setEditBio] = useState(false);
    const [newBio, setNewBio] = useState("");
    const [profilePicture, setProfilePicture] = useState(null);
    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [phoneNumber, setPhoneNumber] = useState("");
    const [editFirstName, setEditFirstName] = useState(false);
    const [editLastName, setEditLastName] = useState(false);
    const [editPhoneNumber, setEditPhoneNumber] = useState(false);
    const [newFirstName, setNewFirstName] = useState("");
    const [newLastName, setNewLastName] = useState("");
    const [newPhoneNumber, setNewPhoneNumber] = useState("");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        const storedUserType = localStorage.getItem("userType") || "Driver";
        setUserType(storedUserType);

        const fetchProfileData = async () => {
            const username = localStorage.getItem("user");
            try {
                const response = await fetch(`http://44.202.51.190:8000/api/get-profile/${username}/`);
                //const response = await fetch(`http://localhost:8000/api/get-profile/${username}/`);
                if (response.ok) {
                    const data = await response.json();
                    setBio(data.prof_bio);
                    setProfilePicture(data.prof_pic_url);
                    setFirstName(data.prof_fname);
                    setLastName(data.prof_lname);
                    setPhoneNumber(data.prof_ph_number);
                } else {
                    setError("Failed to fetch profile data.");
                }
            } catch (err) {
                setError("An error occurred while fetching profile data.");
            } finally {
                setLoading(false);
            }
        };

        fetchProfileData();

        /*const storedBio = localStorage.getItem("userBio") || "No bio available.";
        setBio(storedBio);

        const storedProfilePicture = localStorage.getItem("profilePicture");
        if (storedProfilePicture) {
            setProfilePicture(storedProfilePicture);
        }*/
    }, []);


    const handleSaveBio = () => {
        setBio(newBio === "" ? null : newBio);
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

    const handleSaveProfile = async () => {
        const username = localStorage.getItem("user");
        const updatedData = {
            first_name: newFirstName || firstName,
            last_name: newLastName || lastName,
            phone_number: newPhoneNumber || phoneNumber,
            bio: newBio === "" ? null : newBio || bio
        };
    
        try {
            const response = await fetch(`http://44.202.51.190:8000/api/update-profile/${username}/`, {
            //const response = await fetch(`http://localhost:8000/api/update-profile/${username}/`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(updatedData),
            });
    
            if (response.ok) {
                setFirstName(newFirstName || firstName);
                setLastName(newLastName || lastName);
                setPhoneNumber(newPhoneNumber || phoneNumber);
                setBio(newBio || bio);
                setEditFirstName(false);
                setEditLastName(false);
                setEditPhoneNumber(false);
                setEditBio(false);
            } else {
                setError("Failed to save profile data.");
            }
        } catch (err) {
            setError("An error occurred while saving profile data.");
        }
    };

    if (loading) {
        return <div>Loading...</div>;
    }

    if (error) {
        return <div>{error}</div>;
    }

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
                    
                    <h2>Profile Information</h2>
                {/* First Name */}
                {editFirstName ? (
                    <div>
                        <input
                            type="text"
                            value={newFirstName}
                            onChange={(e) => setNewFirstName(e.target.value)}
                            placeholder="First Name"
                        />
                        <button onClick={handleSaveProfile}>Save</button>
                    </div>
                ) : (
                    <p>
                        <strong>First Name:</strong> {firstName}
                        <button onClick={() => setEditFirstName(true)}>Edit</button>
                    </p>
                )}

                {/* Last Name */}
                {editLastName ? (
                    <div>
                        <input
                            type="text"
                            value={newLastName}
                            onChange={(e) => setNewLastName(e.target.value)}
                            placeholder="Last Name"
                        />
                        <button onClick={handleSaveProfile}>Save</button>
                    </div>
                ) : (
                    <p>
                        <strong>Last Name:</strong> {lastName}
                        <button onClick={() => setEditLastName(true)}>Edit</button>
                    </p>
                )}

                {/* Phone Number */}
                {editPhoneNumber ? (
                    <div>
                        <input
                            type="text"
                            value={newPhoneNumber}
                            onChange={(e) => setNewPhoneNumber(e.target.value)}
                            placeholder="Phone Number"
                        />
                        <button onClick={handleSaveProfile}>Save</button>
                    </div>
                ) : (
                    <p>
                        <strong>Phone Number:</strong> {phoneNumber}
                        <button onClick={() => setEditPhoneNumber(true)}>Edit</button>
                    </p>
                )}

                    <h2>Bio</h2>
                    {editBio ? (
                        <div>
                            <textarea 
                                value={newBio} 
                                onChange={(e) => setNewBio(e.target.value)} 
                                rows="4"
                                style={{
                                    width: "100%",
                                    padding: "10px",
                                    borderRadius: "5px",
                                    border: "1px solid #ccc",
                                    resize: "none"
                                }}
                            />
                            <button onClick={handleSaveProfile} style={{
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
