import React, { useEffect, useState } from "react";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { FaSpinner } from "react-icons/fa";

function DriverSponsors() {
    const [sponsors, setSponsors] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const user = localStorage.getItem("user");

    useEffect(() => {
        document.title = "My Sponsors";
        fetch(`http://localhost:8000/api/get-driver-sponsors/?username=${user}`)
            .then((res) => res.json())
            .then((data) => {
                setSponsors(data);
                setLoading(false);
            })
            .catch((err) => {
                setError("Failed to load sponsors.");
                setLoading(false);
            });
    }, [user]);

    return (
        <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", backgroundColor: "#f9f9f9" }}>
            <Header />
            <main style={{ flex: 1, padding: "40px 20px" }}>
                {error && (
                    <div style={{
                        position: "fixed", top: "20px", right: "20px",
                        padding: "15px 25px", backgroundColor: "#F44336",
                        color: "white", borderRadius: "8px", boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
                        zIndex: 1000, animation: "slideIn 0.3s ease-out forwards"
                    }}>
                        {error}
                    </div>
                )}

                <div style={{
                    maxWidth: "900px", margin: "0 auto", backgroundColor: "white",
                    borderRadius: "12px", boxShadow: "0 5px 20px rgba(0,0,0,0.1)", overflow: "hidden"
                }}>
                    <div style={{
                        padding: "25px 30px", borderBottom: "1px solid #eee",
                        display: "flex", justifyContent: "space-between", alignItems: "center"
                    }}>
                        <h2 style={{ fontSize: "28px", fontWeight: "700", color: "#333", margin: 0 }}>
                            My Sponsors
                        </h2>
                    </div>

                    {loading ? (
                        <div style={{ padding: "50px 0", textAlign: "center", color: "#666" }}>
                            <FaSpinner style={{
                                fontSize: "30px", animation: "spin 1s linear infinite",
                                marginBottom: "15px", color: "#F56600"
                            }} />
                            <p style={{ fontSize: "16px" }}>Loading your sponsors...</p>
                        </div>
                    ) : (
                        <ul style={{ listStyle: "none", padding: "20px" }}>
                            {sponsors.length === 0 ? (
                                <p style={{ fontSize: "18px", color: "#666" }}>You have not joined any sponsors yet.</p>
                            ) : (
                                sponsors.map((sponsor) => (
                                    <li key={sponsor.sponsor_id} style={{
                                        marginBottom: "20px", padding: "20px", backgroundColor: "#fafafa",
                                        border: "1px solid #ddd", borderRadius: "8px"
                                    }}>
                                        <h3 style={{ margin: 0, fontSize: "22px", color: "#333" }}>{sponsor.sponsor_name}</h3>
                                        <p><strong>Rules:</strong> {sponsor.sponsor_rules}</p>
                                        <p><strong>Point Amount:</strong> ${sponsor.sponsor_pt_amt}</p>
                                    </li>
                                ))
                            )}
                        </ul>
                    )}
                </div>
            </main>
            <Footer />

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

export default DriverSponsors;