import React, { useState } from "react";
import { Link } from "react-router-dom";

function Help() {
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        message: ""
    });

    const [submitted, setSubmitted] = useState(false);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        setSubmitted(true);
        setTimeout(() => setSubmitted(false), 5000);
        setFormData({ name: "", email: "", message: "" });
    };

    return (
        <div style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            minHeight: "100vh",
            backgroundColor: "#ffffff"
        }}>
            <h1 style={{ fontSize: "60px", color: "#333333", marginBottom: "20px" }}>Help & Support</h1>

            <Link to="/">
                <button style={{
                    backgroundColor: "#F56600",
                    color: "#FFFFFF",
                    border: "none",
                    fontSize: "20px",
                    borderRadius: "5px",
                    padding: "10px 20px",
                    cursor: "pointer",
                    transition: "background-color 0.3s ease"
                }}
                    onMouseEnter={(e) => e.target.style.backgroundColor = "#522D80"}
                    onMouseLeave={(e) => e.target.style.backgroundColor = "#f56000"}
                >Home</button>
            </Link>

            <br />
            <div style={{
                backgroundColor: "#FFFFFF",
                padding: "30px",
                borderRadius: "5px",
                boxShadow: "0px 4px 10px rgba(245, 102, 0, 1",
                width: "400px",
                textAlign: "center"
            }}>
                <h2>Frequently Asked Questions (FAQ)</h2>
                <p><strong>Q: How do I reset my password?</strong></p>
                <p>A: Click "Forgot Password" on the login page and follow the instructions.</p>

                <p><strong>Q: How do I contact support?</strong></p>
                <p>A: Use the form below to send us a message!</p>

                <h2>Contact Us</h2>
                {submitted && <p style={{ color: "green" }}>Your message has been sent successfully!</p>}

                <form onSubmit={handleSubmit}>
                    <input
                        type="text"
                        name="name"
                        placeholder="Your Name"
                        value={formData.name}
                        onChange={handleChange}
                        required
                        style={{
                            width: "95%",
                            padding: "10px",
                            marginBottom: "10px",
                            borderRadius: "5px",
                            border: "1px solid #333333"
                        }}
                    />
                    <br />
                    <input
                        type="email"
                        name="email"
                        placeholder="Your Email"
                        value={formData.email}
                        onChange={handleChange}
                        required
                        style={{
                            width: "95%",
                            padding: "10px",
                            marginBottom: "10px",
                            borderRadius: "5px",
                            border: "1px solid #333333"
                        }}
                    />
                    <br />
                    <textarea
                        name="message"
                        placeholder="Your Message"
                        value={formData.message}
                        onChange={handleChange}
                        required
                        style={{
                            width: "95%",
                            padding: "10px",
                            marginBottom: "10px",
                            borderRadius: "5px",
                            border: "1px solid #333333"
                        }}
                    />
                    <br />
                    <button type="submit"
                        style={{
                            width: "100%",
                            backgroundColor: "#f56600",
                            color: "#FFFFFF",
                            border: "none",
                            padding: "10px",
                            fontSize: "18px",
                            borderRadius: "5px",
                            cursor: "pointer",
                            transition: "background-color 0.3s ease"
                        }}
                        onMouseEnter={(e) => e.target.style.backgroundColor = "#522D80"}
                        onMouseLeave={(e) => e.target.style.backgroundColor = "#F56600"}
                    >Submit</button>
                </form>
            </div>
        </div>
    );
}

export default Help;
