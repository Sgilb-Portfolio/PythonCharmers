import React, { useState } from "react";
import { Link } from "react-router-dom";
import Header from "../components/Header";
import Footer from "../components/Footer";

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
        <div style={pageStyle}>
            <Header />

            <main style={mainStyle}>
                <h1 style={headingStyle}>Help & Support</h1>
                <p style={subTextStyle}>
                    Need assistance? Fill out the form below and our support team will get back to you shortly.
                </p>

                <div style={formContainerStyle}>
                    {submitted ? (
                        <div style={successMessageStyle}>
                            Thank you! Your message has been received.
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit}>
                            <input
                                type="text"
                                name="name"
                                placeholder="Your Name"
                                value={formData.name}
                                onChange={handleChange}
                                required
                                style={inputStyle}
                            />
                            <input
                                type="email"
                                name="email"
                                placeholder="Your Email"
                                value={formData.email}
                                onChange={handleChange}
                                required
                                style={inputStyle}
                            />
                            <select
                                name="userType"
                                value={formData.userType}
                                onChange={handleChange}
                                required
                                style={{
                                    ...inputStyle,
                                    color: formData.userType ? "#000" : "#888"
                                }}
                            >
                                <option value="" disabled>
                                    Select user type
                                </option>
                                <option value="Driver">Driver</option>
                                <option value="Sponsor">Sponsor</option>
                            </select>
                            <textarea
                                name="message"
                                placeholder="How can we help you?"
                                value={formData.message}
                                onChange={handleChange}
                                required
                                rows="5"
                                style={{
                                    ...inputStyle,
                                    resize: "none",
                                    height: "120px"
                                }}
                            />
                            <input
                                type="submit"
                                value="Submit"
                                style={submitButtonStyle}
                                onMouseEnter={(e) => e.target.style.backgroundColor = "#522D80"}
                                onMouseLeave={(e) => e.target.style.backgroundColor = "#F56600"}
                            />
                        </form>
                    )}
                </div>
            </main>

            <Footer />
        </div>
    );
}

// Style
const pageStyle = {
    minHeight: "100vh",
    fontFamily: "'Segoe UI', Roboto, 'Helvetica Neue', sans-serif",
    backgroundColor: "#f9f9f9",
    display: "flex",
    flexDirection: "column"
};

const mainStyle = {
    flex: "1",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    padding: "40px 20px"
};

const headingStyle = {
    fontSize: "42px",
    color: "#333",
    marginBottom: "10px"
};

const subTextStyle = {
    maxWidth: "600px",
    color: "#666",
    fontSize: "16px",
    marginBottom: "30px",
    textAlign: "center",
    lineHeight: "1.5"
};

const formContainerStyle = {
    backgroundColor: "#ffffff",
    padding: "30px",
    borderRadius: "10px",
    boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
    width: "400px",
    textAlign: "center"
};

const inputStyle = {
    width: "100%",
    padding: "12px",
    marginBottom: "15px",
    borderRadius: "6px",
    border: "1px solid #ccc",
    fontSize: "16px"
};

const submitButtonStyle = {
    width: "100%",
    backgroundColor: "#f56600",
    color: "#ffffff",
    border: "none",
    padding: "12px",
    fontSize: "18px",
    borderRadius: "6px",
    cursor: "pointer",
    transition: "background-color 0.3s ease"
};

const successMessageStyle = {
    color: "#28a745",
    fontSize: "16px",
    marginBottom: "20px"
};

export default Help;
