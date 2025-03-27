import React from "react";
import Header from "../components/Header";
import Footer from "../components/Footer";

function About() {
    return (
        <div style={{
            minHeight: "100vh",
            fontFamily: "'Segoe UI', Roboto, 'Helvetica Neue', sans-serif",
            backgroundColor: "#f9f9f9",
            display: "flex",
            flexDirection: "column"
        }}>
            <Header />
            
            <main style={{ 
                flex: "1", 
                display: "flex", 
                flexDirection: "column",
                alignItems: "center", 
                justifyContent: "center", 
                padding: "40px 20px",
                marginTop: "70px" // Add space for fixed header
            }}>
                <h1 style={{ fontSize: "48px", color: "#333333", marginBottom: "20px" }}>About Us</h1>

                <div style={{
                    backgroundColor: "#FFFFFF",
                    padding: "30px",
                    borderRadius: "8px",
                    boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.1)",
                    maxWidth: "800px",
                    textAlign: "left",
                    marginBottom: "30px"
                }}>
                    <h2 style={{ color: "#522D80", marginBottom: "15px" }}>Our Mission</h2>
                    <p style={{ lineHeight: "1.6", marginBottom: "20px" }}>
                        The Driver Incentive Program is dedicated to promoting safe driving practices and rewarding 
                        professional drivers who demonstrate excellence on the road. Our mission is to create a 
                        culture of safety and responsibility in the transportation industry.
                    </p>
                    
                    <h2 style={{ color: "#522D80", marginBottom: "15px" }}>How It Works</h2>
                    <p style={{ lineHeight: "1.6", marginBottom: "20px" }}>
                        Drivers earn points for safe driving practices, completing training programs, and maintaining 
                        accident-free records. These points can be redeemed for various rewards including gift cards, 
                        merchandise, and special recognition.
                    </p>
                    
                    <h2 style={{ color: "#522D80", marginBottom: "15px" }}>Our Team</h2>
                    <p style={{ lineHeight: "1.6", marginBottom: "20px" }}>
                        Our program is managed by a dedicated team of safety professionals, transportation experts, 
                        and technology specialists who are committed to making our roads safer for everyone.
                    </p>
                    
                    <h2 style={{ color: "#522D80", marginBottom: "15px" }}>Contact Us</h2>
                    <p style={{ lineHeight: "1.6" }}>
                        Have questions about the Driver Incentive Program? We're here to help! Contact our support 
                        team at support@driverincentive.com or call us at (123) 456-7890.
                    </p>
                </div>
            </main>
            
            <Footer />
        </div>
    );
}

export default About;
