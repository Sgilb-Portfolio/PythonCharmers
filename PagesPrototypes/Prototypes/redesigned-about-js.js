import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Header from "../components/Header";
import Footer from "../components/Footer";

function About() {
    const [data, setData] = useState(null);
    const [aboutdata, setAboutData] = useState({});
    const [errorMessage, setErrorMessage] = useState("");
    const idToken = localStorage.getItem("IdToken");

    useEffect(() => {
        document.title = "About | Driver Incentive Program";

        if (!idToken) {
            setErrorMessage("You must be logged in to access this page.");
            return;
        }

        fetch("http://localhost:8000/api/about", {
            method: "GET",
            headers: {
                "Authorization": `Bearer ${idToken}`,
                "Content-Type": "application/json",
            },
        })
            .then(response => response.json())
            .then(data => setData(data))
            .catch(error => {
                console.error("Error:", error);
                setErrorMessage("An error occurred while fetching data.");
            });

        fetch("http://localhost:8000/api/aboutdata/", {
            method: "GET",
            headers: {
                "Authorization": `Bearer ${idToken}`,
                "Content-Type": "application/json",
            },
        })
            .then(response => response.json())
            .then(data => setAboutData(data))
            .catch(error => {
                console.error("Error fetching data:", error);
                setErrorMessage("An error occurred while fetching about data.");
            });
    }, [idToken]);

    // Common styles for consistent design
    const pageContainer = {
        minHeight: "100vh",
        fontFamily: "'Segoe UI', Roboto, 'Helvetica Neue', sans-serif",
        backgroundColor: "#f9f9f9",
        display: "flex",
        flexDirection: "column"
    };

    const mainContent = {
        flex: "1",
        padding: "40px 20px",
        maxWidth: "1200px",
        margin: "0 auto",
        width: "100%"
    };

    const pageTitle = {
        fontSize: "36px",
        color: "#333333",
        marginBottom: "30px",
        textAlign: "center"
    };

    const infoCardContainer = {
        display: "flex",
        justifyContent: "center",
        gap: "20px",
        marginBottom: "30px",
        flexWrap: "wrap"
    };

    const infoCard = {
        backgroundColor: "#fff",
        borderRadius: "8px",
        padding: "25px",
        boxShadow: "0 4px 8px rgba(245, 102, 0, 0.3)",
        width: "300px",
        textAlign: "center"
    };

    const infoCardTitle = {
        fontSize: "24px",
        fontWeight: "bold",
        marginBottom: "10px",
        color: "#333333"
    };

    const infoCardValue = {
        fontSize: "20px",
        color: "#333333"
    };

    const infoCardFull = {
        backgroundColor: "#fff",
        borderRadius: "8px",
        padding: "20px",
        boxShadow: "0 4px 8px rgba(245, 102, 0, 0.3)",
        width: "100%",
        marginBottom: "20px",
        textAlign: "left"
    };

    const buttonStyle = {
        backgroundColor: "#F56600",
        color: "#FFFFFF",
        border: "none",
        padding: "10px 20px",
        fontSize: "16px",
        fontWeight: "600",
        borderRadius: "5px",
        cursor: "pointer",
        transition: "background-color 0.3s ease",
        display: "inline-block",
        textDecoration: "none",
        textAlign: "center",
        marginTop: "20px"
    };

    const buttonContainer = {
        textAlign: "center",
        marginTop: "20px",
        marginBottom: "30px"
    };

    const imageContainer = {
        position: "relative",
        width: "80%",
        maxWidth: "800px",
        margin: "0 auto",
        borderRadius: "8px",
        overflow: "hidden",
        boxShadow: "0 4px 8px rgba(0, 0, 0, 0.2)"
    };

    const image = {
        width: "100%",
        height: "auto",
        borderRadius: "8px",
    };

    const imageOverlay = {
        position: "absolute",
        top: "20%",
        left: "50%",
        transform: "translate(-50%, -50%)",
        fontSize: "clamp(18px, 5vw, 40px)",
        color: "#333333",
        padding: "10px 20px",
        borderRadius: "8px",
        textAlign: "center",
        fontWeight: "bold",
        backgroundColor: "rgba(255, 255, 255, 0.7)"
    };

    const loadingMessage = {
        textAlign: "center",
        fontSize: "16px",
        color: "#666666",
        marginTop: "20px"
    };

    return (
        <div style={pageContainer}>
            <Header />

            <main style={mainContent}>
                <h1 style={pageTitle}>About</h1>

                <div style={infoCardContainer}>
                    <div style={infoCard}>
                        <p style={infoCardTitle}>Team #</p>
                        <p style={infoCardValue}>{aboutdata.teamNum || "Loading..."}</p>
                    </div>

                    <div style={infoCard}>
                        <p style={infoCardTitle}>Version #</p>
                        <p style={infoCardValue}>{aboutdata.versionNum || "Loading..."}</p>
                    </div>

                    <div style={infoCard}>
                        <p style={infoCardTitle}>Release Date</p>
                        <p style={infoCardValue}>{aboutdata.releaseDate || "Loading..."}</p>
                    </div>
                </div>

                <div style={infoCardFull}>
                    <p style={{ fontSize: "18px" }}>
                        <strong>Project Name:</strong> {aboutdata.productName || "Loading..."}
                    </p>
                </div>

                <div style={infoCardFull}>
                    <p style={{ fontSize: "18px" }}>
                        <strong>Product Description:</strong> {aboutdata.productDesc || "Loading..."}
                    </p>
                </div>

                <div style={buttonContainer}>
                    <Link to="/" style={buttonStyle}
                        onMouseEnter={(e) => e.target.style.backgroundColor = "#522D80"}
                        onMouseLeave={(e) => e.target.style.backgroundColor = "#F56600"}>
                        Home
                    </Link>
                </div>

                <div style={imageContainer}>
                    <img
                        src="/images/trailer1.jpg"
                        alt="18 Wheeler Truck"
                        style={image}
                    />
                    <p style={imageOverlay}>Python Charmers</p>
                </div>

                {data ? (
                    <p style={{ textAlign: "center", marginTop: "20px" }}>
                        {data.message} - Connected to: {data.database}
                    </p>
                ) : (
                    <p style={loadingMessage}>Loading...</p>
                )}

                {errorMessage && (
                    <p style={{ color: "red", textAlign: "center", marginTop: "20px" }}>
                        {errorMessage}
                    </p>
                )}
            </main>

            <Footer />
        </div>
    );
}

export default About;