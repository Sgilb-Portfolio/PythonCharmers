import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";

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
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            minHeight: "100vh",
            backgroundColor: "#ffffff"
        }}>
            <h1 style={{ fontSize: "50px", color: "#333333", marginBottom: "20px" }}>Sponsorship Application</h1>

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
            <br />

            <div style={{
                backgroundColor: "#FFFFFF",
                padding: "30px",
                borderRadius: "5px",
                boxShadow: "0px 4px 10px rgba(245, 102, 0, 1)",
                width: "400px",
                textAlign: "center"
            }}>
                <form onSubmit={handleSubmit}>
                    <label style={{ display: "block", textAlign: "left", fontWeight: "bold", marginBottom: "5px" }}>Driver Name:</label>
                    <input type="text" name="driverName" value={formData.driverName} onChange={handleChange} required
                        style={{
                            width: "95%",
                            padding: "10px",
                            marginBottom: "10px",
                            borderRadius: "5px",
                            border: "1px solid #333333"
                        }} />
                    
                    <label style={{ display: "block", textAlign: "left", fontWeight: "bold", marginBottom: "5px" }}>Company Name:</label>
                    <input type="text" name="companyName" value={formData.companyName} onChange={handleChange} required
                        style={{
                            width: "95%",
                            padding: "10px",
                            marginBottom: "10px",
                            borderRadius: "5px",
                            border: "1px solid #333333"
                        }} />

                    <label style={{ display: "block", textAlign: "left", fontWeight: "bold", marginBottom: "5px" }}>Reason for Sponsorship:</label>
                    <textarea name="reason" value={formData.reason} onChange={handleChange} required
                        style={{
                            width: "95%",
                            padding: "10px",
                            marginBottom: "10px",
                            borderRadius: "5px",
                            border: "1px solid #333333",
                            resize: "none",
                            height: "80px"
                        }} />

                    {formData.date && <p style={{ color: "#333333", fontWeight: "bold" }}><strong>Submitted on:</strong> {formData.date}</p>}

                    <input type="submit" value="Submit Application"
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
                        onMouseLeave={(e) => e.target.style.backgroundColor = "#F56600"} />
                </form>
                {successMessage && (
                    <p style={{
                        marginTop: "10px",
                        color: "green",
                        fontWeight: "bold",
                        backgroundColor: "#E6FFE6",
                        padding: "10px",
                        borderRadius: "5px"
                    }}>
                        {successMessage}
                    </p>
                )}
            </div>
        </div>
    );
}

export default Applications;
