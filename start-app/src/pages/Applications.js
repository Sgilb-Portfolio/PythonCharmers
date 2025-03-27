import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Header from "../components/Header";
import Footer from "../components/Footer";

function Applications() {
    const [formData, setFormData] = useState({
        driverName: "",
        companyName: "",
        reason: "",
        date: "",
    });

    const [successMessage, setSuccessMessage] = useState("");

    useEffect(() => {
        document.title = "Sponsorship Application";
    }, []);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        const currDate = new Date().toLocaleString();
        const submittedData = { ...formData, date: currDate };
        console.log("Application Form:", submittedData);
        setFormData({ driverName: "", companyName: "", reason: "", date: "" });
        setSuccessMessage("Application submitted succesfully!");
        setTimeout(() => setSuccessMessage(""), 7000);
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
                {/* Your existing applications page content */}
                {/* ... */}
            </main>
            
            <Footer />
        </div>
    );
}

export default Applications;
