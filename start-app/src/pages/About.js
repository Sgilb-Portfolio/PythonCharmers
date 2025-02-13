import React from "react";
import { Link } from "react-router-dom";
import myImage from '../images/trailer1.jpg';

function About() {
    return (
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
                }}><p style= {{fontSize: "30px"}}><strong>Team #</strong><br></br> 06</p>
            </div>
            <div style={{
                    backgroundColor: "#fff",
                    borderRadius: "8px",
                    padding: "20px",
                    boxShadow: "0 4px 8px rgba(245, 102, 0, 1)",
                    width: "300px",
                    textAlign: "center"
                }}><p style={{fontSize:"30px"}}><strong>Version #</strong> <br></br>02</p></div>
                <div style={{
                    backgroundColor: "#fff",
                    borderRadius: "8px",
                    padding: "20px",
                    boxShadow: "0 4px 8px rgba(245, 102, 0, 1)",
                    width: "300px",
                    textAlign: "center"
                }}><p style={{fontSize:"30px"}}><strong>Release Date</strong> <br></br>02/13/2025</p></div>
                <div style={{
                    backgroundColor: "#fff",
                    borderRadius: "8px",
                    padding: "20px",
                    boxShadow: "0 4px 8px rgba(245, 102, 0, 1)",
                    width: "1025px",
                    textAlign: "left"
                }}><p style={{fontSize:"20px"}}><strong>Project Name:</strong> Good Driver Incentive Program</p></div>
                <div style={{
                    backgroundColor: "#fff",
                    borderRadius: "8px",
                    padding: "20px",
                    boxShadow: "0 4px 8px rgba(245, 102, 0, 1)",
                    width: "1025px",
                    textAlign: "left",
                }}><p style={{fontSize:"20px"}}><strong>Product Description:</strong> A web-based platform designed to incentivize and reward truck drivers for safe and efficient driving behaviors.</p></div>
            </div>
            <Link to="/">
                <button style={{
                    backgroundColor: "F56600",
                    color: "#FFFFFF",
                    border: "none",
                    fontsize: "20px",
                    borderRadius: "5px",
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
        </div>
    );
}

export default About;
