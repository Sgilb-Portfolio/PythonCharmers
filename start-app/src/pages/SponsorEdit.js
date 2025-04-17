import React, { useState, useEffect } from "react";
import Header from "../components/Header";
import Footer from "../components/Footer";

function SponsorEdit() {
    const [rules, setRules] = useState("");
    const [newRules, setNewRules] = useState("");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);
    const username = localStorage.getItem("user");

    useEffect(() => {
        const fetchRules = async () => {
            try {
                const response = await fetch(`http://localhost:8000/api/get-sponsor-details-by-account/?username=${username}`);
                if (response.ok) {
                    const data = await response.json();
                    setRules(data.sponsor_rules || "");
                    setNewRules(data.sponsor_rules || "");
                } else {
                    setError("Failed to load sponsor rules.");
                }
            } catch (err) {
                setError("Error fetching sponsor rules.");
            } finally {
                setLoading(false);
            }
        };
    
        fetchRules();
    }, []);

    const handleSaveRules = async () => {
        const username = localStorage.getItem("user");
        try {
            const response = await fetch(`http://localhost:8000/api/update-sponsor-rules/`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ username, rules: newRules }),
            });

            if (response.ok) {
                setRules(newRules);
                setSuccess("Rules updated successfully!");
                setTimeout(() => setSuccess(null), 3000);
            } else {
                setError("Failed to update rules.");
            }
        } catch (err) {
            setError("An error occurred while updating rules.");
        }
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
                <div style={{ maxWidth: "600px", margin: "0 auto", textAlign: "center" }}>
                    <h2>Sponsor Info</h2>

                    {loading ? (
                        <p>Loading...</p>
                    ) : (
                        <div>
                            <textarea
                                value={newRules}
                                onChange={(e) => setNewRules(e.target.value)}
                                rows="10"
                                maxLength="1000"
                                style={{
                                    width: "100%",
                                    padding: "10px",
                                    borderRadius: "5px",
                                    border: "1px solid #ccc",
                                    resize: "vertical"
                                }}
                            />
                            <button
                                onClick={handleSaveRules}
                                style={{
                                    marginTop: "15px",
                                    backgroundColor: "#F56600",
                                    color: "#fff",
                                    border: "none",
                                    padding: "10px 20px",
                                    borderRadius: "5px",
                                    cursor: "pointer",
                                    transition: "background-color 0.3s ease"
                                }}
                                onMouseEnter={(e) => e.target.style.backgroundColor = "#522D80"}
                                onMouseLeave={(e) => e.target.style.backgroundColor = "#F56600"}
                            >
                                Save Rules
                            </button>
                        </div>
                    )}

                    {success && <p style={{ color: "green", marginTop: "10px" }}>{success}</p>}
                    {error && <p style={{ color: "red", marginTop: "10px" }}>{error}</p>}
                </div>
            </main>

            <Footer />
        </div>
    );
}

export default SponsorEdit;