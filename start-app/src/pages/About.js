import React from "react";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { Link } from "react-router-dom";
import myImage from '../images/trailer1.jpg';
import { useEffect, useState } from "react";

function About() {
    const [data, setData] = useState(null);
    const [aboutdata, setAboutData] = useState([]);
    const [errorMessage, setErrorMessage] = useState([]);
    const idToken = localStorage.getItem("IdToken");

    useEffect(() => {
        if (!idToken) {
            setErrorMessage("You must be logged in to access this page.");
            return;
        }

        //fetch("http://44.202.51.190:8000/api/about", {
        fetch("http://localhost:8000/api/about", {
            method: "GET",
            headers: {
                "Authorization": `Bearer ${idToken}`, // Send the token here
                "Content-Type": "application/json",
            },
        })
            .then(response => response.json())
            .then(data => setData(data))
            .catch(error => {
                console.error("Error:", error);
                setErrorMessage("An error occurred while fetching data.");
            });

        //fetch("http://44.202.51.190:8000/api/aboutdata/", {
        fetch("http://localhost:8000/api/aboutdata/", {
            method: "GET",
            headers: {
                "Authorization": `Bearer ${idToken}`, // Include token in header
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


    return (
        <div style={{
            minHeight: "100vh",
            fontFamily: "'Segoe UI', Roboto, 'Helvetica Neue', sans-serif",
            backgroundColor: "#f9f9f9",
            display: "flex",
            flexDirection: "column"
        }}>
            <Header />
            
            <div style={{ textAlign: "center", 
        padding: "20px", 
        }}>
            <div>
            <h1 style={{fontSize: "60px",color: "#333333"}}>About Page</h1>
            </div>

            <div style={{
                color: "#333333", 
                display: "flex", 
                justifyContent: "center", 
                gap: "20px", 
                marginBottom: "20px", 
                flexWrap: "wrap"}}>
            <div style={{
                    backgroundColor: "#fff",
                    borderRadius: "8px",
                    padding: "20px",
                    boxShadow: "0 4px 8px rgba(245, 102, 0, 1)",
                    width: "300px",
                    textAlign: "center"
                }}>
                    <p style= {{fontSize: "30px"}}><strong>Team #</strong><br></br>{aboutdata.teamNum}</p>
            </div>

            <div style={{
                    backgroundColor: "#fff",
                    borderRadius: "8px",
                    padding: "20px",
                    boxShadow: "0 4px 8px rgba(245, 102, 0, 1)",
                    width: "300px",
                    textAlign: "center"
                }}>
                    <p style={{fontSize:"30px"}}><strong>Version #</strong> <br></br>{aboutdata.versionNum}</p>
            </div>

                <div style={{
                    backgroundColor: "#fff",
                    borderRadius: "8px",
                    padding: "20px",
                    boxShadow: "0 4px 8px rgba(245, 102, 0, 1)",
                    width: "300px",
                    textAlign: "center"
                }}>
                    <p style={{fontSize:"30px"}}><strong>Release Date</strong> <br></br>{aboutdata.releaseDate}</p>
                </div>
                <div style={{
                    backgroundColor: "#fff",
                    borderRadius: "8px",
                    padding: "20px",
                    boxShadow: "0 4px 8px rgba(245, 102, 0, 1)",
                    width: "1025px",
                    textAlign: "left"
                }}><p style={{fontSize:"20px"}}><strong>Project Name:</strong> {aboutdata.productName}</p></div>
                <div style={{
                    backgroundColor: "#fff",
                    borderRadius: "8px",
                    padding: "20px",
                    boxShadow: "0 4px 8px rgba(245, 102, 0, 1)",
                    width: "1025px",
                    textAlign: "left",
                }}><p style={{fontSize:"20px"}}><strong>Product Description:</strong> {aboutdata.productDesc}</p></div>
            </div>
            <Link to="/">
                <button style={{
                    backgroundColor: "#F56600",
                    color: "#FFFFFF",
                    border: "none",
                    fontsize: "20px",
                    borderRadius: "5px",
                    padding: "10px 20px",
                    cursor: "pointer",
                    transition: "background-color 0.3 ease",
                }}
                onMouseEnter={(e) => e.target.style.backgroundColor = "#522D80"}
                onMouseLeave={(e) => e.target.style.backgroundColor = "#F56600"}
                >Home</button>
            </Link>

            <div style={{ 
                    position: "relative",  
                width: "80%",  
                maxWidth: "1025px",  
                margin: "0 auto"
                }}>
            <img 
                src={myImage} 
                alt="18 Wheeler Truck"
                style={{ 
                width: "100%",  
                height: "auto",
                borderRadius: "15px", 
                }}/>
                <p style={{
                position: "absolute",
                top: "20%",
                left: "50%",
                transform: "translate(-50%, -50%)",
                fontSize: "clamp(18px, 5vw, 60px)",
                color: "#333333",
                padding: "10px 20px",
                borderRadius: "8px",
                textAlign: "center",
                fontWeight: "bold",
                whiteSpace: "normal",
                maxWidth: "90%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center"
                }}>Python Charmers</p>
            </div>
            {data ? (
                <p>{data.message} - Connected to: {data.database}</p>
            ) : (
                <p>Loading....</p>
            )}
        </div>
            
            <Footer />
        </div>
    );
}

export default About;
