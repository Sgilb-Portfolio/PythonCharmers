import React from "react";
import { Link } from "react-router-dom";
import { FaFacebook, FaTwitter, FaInstagram, FaLinkedin, FaEnvelope, FaPhone, FaMapMarkerAlt } from "react-icons/fa";

const Footer = () => {
    const currentYear = new Date().getFullYear();
    
    return (
        <footer style={{
            backgroundColor: "#333",
            color: "#fff",
            padding: "40px 0 20px",
            fontFamily: "'Segoe UI', Roboto, 'Helvetica Neue', sans-serif",
            width: "100%",
            marginBottom: 0,
            marginLeft: 0,
            marginRight: 0,
            boxSizing: "border-box"
        }}>
            <div style={{
                maxWidth: "1200px",
                margin: "0 auto",
                padding: "0 20px",
                display: "flex",
                flexWrap: "wrap",
                justifyContent: "space-between",
            }}>
                {/* Company Info */}
                <div style={{ flex: "1", minWidth: "250px", marginBottom: "30px" }}>
                    <h3 style={{ 
                        fontSize: "22px", 
                        fontWeight: "600", 
                        color: "#F56600", 
                        marginBottom: "15px" 
                    }}>
                        Driver Incentive Program
                    </h3>
                    <p style={{ lineHeight: "1.6", color: "#ccc", marginBottom: "20px" }}>
                        Rewarding safe driving practices and encouraging excellence on the road.
                    </p>
                    <div style={{ display: "flex", gap: "15px" }}>
                        <a href="#" style={{ color: "#fff", fontSize: "20px" }}><FaFacebook /></a>
                        <a href="#" style={{ color: "#fff", fontSize: "20px" }}><FaTwitter /></a>
                        <a href="#" style={{ color: "#fff", fontSize: "20px" }}><FaInstagram /></a>
                        <a href="#" style={{ color: "#fff", fontSize: "20px" }}><FaLinkedin /></a>
                    </div>
                </div>
                
                {/* Quick Links */}
                <div style={{ flex: "1", minWidth: "250px", marginBottom: "30px" }}>
                    <h3 style={{ fontSize: "18px", fontWeight: "600", marginBottom: "15px" }}>Quick Links</h3>
                    <ul style={{ listStyle: "none", padding: 0 }}>
                        <li style={{ marginBottom: "10px" }}>
                            <Link to="/" style={{ color: "#ccc", textDecoration: "none", transition: "color 0.2s" }}>Home</Link>
                        </li>
                        <li style={{ marginBottom: "10px" }}>
                            <Link to="/about" style={{ color: "#ccc", textDecoration: "none", transition: "color 0.2s" }}>About Us</Link>
                        </li>
                        <li style={{ marginBottom: "10px" }}>
                            <Link to="/applications" style={{ color: "#ccc", textDecoration: "none", transition: "color 0.2s" }}>Applications</Link>
                        </li>
                        <li style={{ marginBottom: "10px" }}>
                            <Link to="/points" style={{ color: "#ccc", textDecoration: "none", transition: "color 0.2s" }}>Manage Points</Link>
                        </li>
                        <li style={{ marginBottom: "10px" }}>
                            <Link to="/help" style={{ color: "#ccc", textDecoration: "none", transition: "color 0.2s" }}>Help & Support</Link>
                        </li>
                    </ul>
                </div>
                
                {/* Contact Info */}
                <div style={{ flex: "1", minWidth: "250px", marginBottom: "30px" }}>
                    <h3 style={{ fontSize: "18px", fontWeight: "600", marginBottom: "15px" }}>Contact Us</h3>
                    <ul style={{ listStyle: "none", padding: 0 }}>
                        <li style={{ marginBottom: "15px", display: "flex", alignItems: "center" }}>
                            <FaMapMarkerAlt style={{ marginRight: "10px", color: "#F56600" }} />
                            <span style={{ color: "#ccc" }}>123 University Drive, Clemson, SC 29634</span>
                        </li>
                        <li style={{ marginBottom: "15px", display: "flex", alignItems: "center" }}>
                            <FaPhone style={{ marginRight: "10px", color: "#F56600" }} />
                            <span style={{ color: "#ccc" }}>(123) 456-7890</span>
                        </li>
                        <li style={{ marginBottom: "15px", display: "flex", alignItems: "center" }}>
                            <FaEnvelope style={{ marginRight: "10px", color: "#F56600" }} />
                            <span style={{ color: "#ccc" }}>support@driverincentive.com</span>
                        </li>
                    </ul>
                </div>
            </div>
            
            {/* Copyright */}
            <div style={{
                borderTop: "1px solid #555",
                marginTop: "20px",
                paddingTop: "20px",
                textAlign: "center",
                color: "#aaa",
                fontSize: "14px"
            }}>
                <p>© {currentYear} Driver Incentive Program. All rights reserved.</p>
                <div style={{ marginTop: "10px" }}>
                    <Link to="/privacy" style={{ color: "#aaa", textDecoration: "none", margin: "0 10px" }}>Privacy Policy</Link>
                    <Link to="/terms" style={{ color: "#aaa", textDecoration: "none", margin: "0 10px" }}>Terms of Service</Link>
                </div>
            </div>
        </footer>
    );
};

export default Footer;