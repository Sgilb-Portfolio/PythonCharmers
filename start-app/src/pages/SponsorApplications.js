import React, { useState, useEffect } from "react";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { FaSpinner } from "react-icons/fa";

function SponsorApplications() {
    const [applications, setApplications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const username = localStorage.getItem("user");

    useEffect(() => {
        document.title = "Sponsor Applications";
        fetch("http://localhost:8000/api/get-sponsor-applications/", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ username: username })
        })
            .then(res => res.json())
            .then(data => {
                setApplications(data);
                setLoading(false);
            })
            .catch(() => {
                setError("Failed to load applications.");
                setLoading(false);
            });
    }, [username]);

    const updateStatus = (appId, newStatus) => {
        fetch(`http://localhost:8000/api/update-application-status/`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ application_id: appId, status: newStatus }),
        })
            .then(res => res.json())
            .then(data => {
                if (data.message) {
                    setApplications(apps => apps.map(app =>
                        app.application_id === appId ? { ...app, status: newStatus } : app
                    ));
                } else {
                    alert(data.error || "Failed to update status.");
                }
            })
            .catch(() => alert("Network error."));
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

            <main style={{ flex: 1, padding: "40px 20px" }}>
                {error && (
                    <div style={{
                        position: "fixed",
                        top: "20px",
                        right: "20px",
                        padding: "15px 25px",
                        borderRadius: "8px",
                        backgroundColor: "#F44336",
                        color: "white",
                        boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
                        zIndex: 1000
                    }}>
                        {error}
                    </div>
                )}

                <div style={{
                    maxWidth: "1000px",
                    margin: "0 auto",
                    backgroundColor: "white",
                    borderRadius: "12px",
                    boxShadow: "0 5px 20px rgba(0,0,0,0.1)",
                    overflow: "hidden"
                }}>
                    <div style={{
                        padding: "25px 30px",
                        borderBottom: "1px solid #eee",
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center"
                    }}>
                        <h2 style={{
                            fontSize: "28px",
                            fontWeight: "700",
                            color: "#333",
                            margin: 0
                        }}>
                            Submitted Applications
                        </h2>
                    </div>

                    {loading ? (
                        <div style={{
                            padding: "50px 0",
                            textAlign: "center",
                            color: "#666"
                        }}>
                            <FaSpinner style={{
                                fontSize: "30px",
                                animation: "spin 1s linear infinite",
                                marginBottom: "15px",
                                color: "#F56600"
                            }} />
                            <p style={{ fontSize: "16px" }}>Loading applications...</p>
                        </div>
                    ) : (
                        <div style={{ padding: "20px" }}>
                            {applications.length === 0 ? (
                                <p style={{ textAlign: "center", color: "#888" }}>
                                    No applications found.
                                </p>
                            ) : (
                                <ul style={{ listStyle: "none", paddingLeft: 0 }}>
                                    {applications.map(app => (
                                        <li key={app.application_id} style={{
                                            padding: "15px",
                                            borderBottom: "1px solid #eee",
                                            display: "flex",
                                            justifyContent: "space-between",
                                            alignItems: "center"
                                        }}>
                                            <div>
                                                <p style={{ margin: "0 0 5px 0", fontWeight: "600" }}>
                                                    Driver: {app.driver}
                                                </p>
                                                <p style={{ margin: "0 0 5px 0" }}>
                                                    Sponsor: {app.sponsor}
                                                </p>
                                                <p style={{ margin: 0 }}>
                                                    Status: <strong>{app.status}</strong>
                                                </p>
                                            </div>
                                            <div>
                                                <button
                                                    onClick={() => updateStatus(app.application_id, "accepted")}
                                                    style={{
                                                        padding: "8px 14px",
                                                        backgroundColor: "#28a745",
                                                        color: "white",
                                                        border: "none",
                                                        borderRadius: "6px",
                                                        cursor: "pointer",
                                                        fontWeight: "500",
                                                        marginRight: "10px"
                                                    }}
                                                >
                                                    Accept
                                                </button>
                                                <button
                                                    onClick={() => updateStatus(app.application_id, "rejected")}
                                                    style={{
                                                        padding: "8px 14px",
                                                        backgroundColor: "#dc3545",
                                                        color: "white",
                                                        border: "none",
                                                        borderRadius: "6px",
                                                        cursor: "pointer",
                                                        fontWeight: "500"
                                                    }}
                                                >
                                                    Reject
                                                </button>
                                            </div>
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </div>
                    )}
                </div>
            </main>

            <Footer />

            <style jsx>{`
                @keyframes spin {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                }
            `}</style>
        </div>
    );
}

export default SponsorApplications;