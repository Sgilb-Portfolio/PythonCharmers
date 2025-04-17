import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { FaSpinner } from "react-icons/fa";
import Header from "../components/Header";
import Footer from "../components/Footer";

function Applications() {
    const [sponsors, setSponsors] = useState([]);
    const [selectedSponsor, setSelectedSponsor] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const user = localStorage.getItem("user");
    const [myApplications, setMyApplications] = useState([]);

    useEffect(() => {
        document.title = "Sponsorship Application";
        setLoading(true);
        fetch("http://localhost:8000/api/get-sponsors/")
            .then((res) => res.json())
            .then((data) => {
                setSponsors(data);
                setLoading(false);
            })
            .catch((err) => {
                setError("Failed to fetch sponsors");
                setLoading(false);
            });
    }, []);

    useEffect(() => {
        if (!user) return;
    
        fetch("http://localhost:8000/api/get-driver-applications/", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ username: user }),
        })
        .then((res) => res.json())
        .then((data) => {
            setMyApplications(data);
        })
        .catch((err) => {
            console.error("Failed to fetch driver applications", err);
        });
    }, [user]);

    const handleMoreInfo = (sponsor_id) => {
        if (selectedSponsor && selectedSponsor.sponsor_id === sponsor_id) {
            setSelectedSponsor(null);
        } else {
            fetch(`http://localhost:8000/api/get-sponsor-details/${sponsor_id}/`)
                .then((res) => res.json())
                .then((data) => setSelectedSponsor(data));
        }
    };

    const handleApply = (sponsor_id) => {
        const applicationData = {
            username: user,
            sponsor_id: sponsor_id,
            status: "pending",
        };
        fetch("http://localhost:8000/api/apply-sponsor/", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(applicationData),
        })
        .then(async (response) => {
            const data = await response.json();
            if (response.ok) {
                alert(data.message || "Application submitted successfully!");
                window.location.reload();
            } else {
                alert(data.error || "An error occurred while submitting the application.");
            }
            console.log(data);
        })
        .catch((error) => {
            alert("Network error. Please try again.");
            console.error("Error:", error);
        });
    };

    const handleJoinSponsor = (applicationId) => {
        fetch("http://localhost:8000/api/confirm-join-sponsor/", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ application_id: applicationId, username: user }),
        })
        .then(async (res) => {
            const data = await res.json();
            if (res.ok) {
                alert(data.message || "You’ve joined the sponsor!");
                setMyApplications(prev =>
                    prev.map(app =>
                        app.application_id === applicationId
                            ? { ...app, status: "joined" }
                            : app
                    )
                );
            } else {
                alert(data.error || "Failed to join sponsor.");
            }
        })
        .catch((err) => {
            console.error("Error joining sponsor:", err);
            alert("Network error.");
        });
    };

    const handleCancelApplication = (sponsorName) => {
        if (!window.confirm("Are you sure you want to cancel this application?")) return;
    
        fetch("http://localhost:8000/api/cancel-application/", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ sponsor_name: sponsorName, username: user }),
        })
        .then(async (res) => {
            const data = await res.json();
            if (res.ok) {
                alert(data.message || "Application canceled.");
                setMyApplications(prev =>
                    prev.map(app =>
                        app.sponsor_name === sponsorName && app.status !== "canceled"
                            ? { ...app, status: "canceled" }
                            : app
                    )
                );
            } else {
                alert(data.error || "Failed to cancel.");
            }
        })
        .catch((err) => {
            console.error("Error canceling application:", err);
            alert("Network error.");
        });
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
                {/* Notification */}
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
                        zIndex: 1000,
                        animation: "slideIn 0.3s ease-out forwards"
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
                            Sponsorship Applications
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
                            <p style={{ fontSize: "16px" }}>Loading sponsor data...</p>
                        </div>
                    ) : (
                        <div style={{ padding: "20px" }}>
                            <ul style={{ listStyle: "none", paddingLeft: "0" }}>
                                {sponsors.map((sponsor) => (
                                    <li key={sponsor.sponsor_id} style={{ marginBottom: "20px" }}>
                                        <div>
                                            <span style={{
                                                fontSize: "20px",
                                                fontWeight: "700",
                                                color: "#333"
                                            }}>
                                                {sponsor.sponsor_name}
                                            </span>
                                            <button
                                                onClick={() => handleMoreInfo(sponsor.sponsor_id)}
                                                style={{
                                                    padding: "8px 14px",
                                                    backgroundColor: "#F56600",
                                                    color: "white",
                                                    border: "none",
                                                    borderRadius: "6px",
                                                    cursor: "pointer",
                                                    fontWeight: "500",
                                                    marginLeft: "10px"
                                                }}
                                            >
                                                {selectedSponsor?.sponsor_id === sponsor.sponsor_id ? "Hide Info" : "More Info"}
                                            </button>
                                            <button
                                                onClick={() => handleApply(sponsor.sponsor_id)}
                                                style={{
                                                    padding: "8px 14px",
                                                    backgroundColor: "#28a745",
                                                    color: "white",
                                                    border: "none",
                                                    borderRadius: "6px",
                                                    cursor: "pointer",
                                                    fontWeight: "500",
                                                    marginLeft: "10px"
                                                }}
                                            >
                                                Apply
                                            </button>
                                        </div>
                                        {selectedSponsor?.sponsor_id === sponsor.sponsor_id && (
                                            <div style={{
                                                marginTop: "10px",
                                                padding: "15px",
                                                backgroundColor: "#fff",
                                                border: "1px solid #eee",
                                                borderRadius: "8px",
                                                boxShadow: "0 4px 8px rgba(0,0,0,0.1)"
                                            }}>
                                                <p><strong>Rules:</strong> {selectedSponsor.sponsor_rules}</p>
                                                <p><strong>Point Amount:</strong> ${selectedSponsor.sponsor_pt_amt}</p>
                                            </div>
                                        )}
                                    </li>
                                ))}
                            </ul>

                            {myApplications.length > 0 && (
                                <div style={{
                                    marginTop: "40px",
                                    paddingTop: "20px",
                                    borderTop: "2px solid #eee"
                                }}>
                                    <h3 style={{
                                        fontSize: "24px",
                                        fontWeight: "600",
                                        marginBottom: "20px",
                                        color: "#333"
                                    }}>
                                        My Submitted Applications
                                    </h3>
                                    <ul style={{ listStyle: "none", paddingLeft: 0 }}>
                                        {myApplications.map((app, index) => (
                                            <li key={index} style={{
                                                marginBottom: "15px",
                                                padding: "15px",
                                                border: "1px solid #ddd",
                                                borderRadius: "8px",
                                                backgroundColor: "#fafafa"
                                            }}>
                                                <p><strong>Sponsor:</strong> {app.sponsor_name}</p>
                                                <p><strong>Status:</strong> <span style={{
                                                    color:
                                                        app.status === "pending"
                                                            ? "#f57c00"
                                                            : app.status === "accepted"
                                                            ? "#28a745"
                                                            : "#dc3545",
                                                    fontWeight: "600"
                                                }}>{app.status}</span></p>
                                                {(app.status === "accepted" || app.status === "pending") && (
                                                    <div style={{ marginTop: "10px" }}>
                                                        {app.status === "accepted" && (
                                                            <button
                                                                onClick={() => handleJoinSponsor(app.application_id)}
                                                                style={{
                                                                    padding: "8px 16px",
                                                                    backgroundColor: "#007bff",
                                                                    color: "white",
                                                                    border: "none",
                                                                    borderRadius: "6px",
                                                                    cursor: "pointer",
                                                                    fontWeight: "500",
                                                                    marginRight: "10px"
                                                                }}
                                                            >
                                                                Join Sponsor
                                                            </button>
                                                        )}
                                                        <button
                                                            onClick={() => handleCancelApplication(app.sponsor_name)}
                                                            style={{
                                                                padding: "8px 16px",
                                                                backgroundColor: "#dc3545",
                                                                color: "white",
                                                                border: "none",
                                                                borderRadius: "6px",
                                                                cursor: "pointer",
                                                                fontWeight: "500"
                                                            }}
                                                        >
                                                            Cancel Application
                                                        </button>
                                                    </div>
                                                )}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}

                        </div>
                    )}

                    

                </div>
            </main>

            <Footer />

            {/* Add necessary CSS animations */}
            <style jsx>{`
                @keyframes spin {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                }
                @keyframes slideIn {
                    0% { transform: translateX(100%); opacity: 0; }
                    100% { transform: translateX(0); opacity: 1; }
                }
            `}</style>
        </div>
    );
}

export default Applications;
