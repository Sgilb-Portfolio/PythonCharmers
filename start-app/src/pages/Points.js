import React, { useEffect, useState } from "react";
import { FaPlus, FaMinus, FaSpinner } from "react-icons/fa";
import Header from "../components/Header";
import Footer from "../components/Footer";

function Points() {
    const [drivers, setDrivers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [pointInputs, setPointInputs] = useState({});
    const [reasonInputs, setReasonInputs] = useState({}); // New state for reason dropdowns
    const [notification, setNotification] = useState({ show: false, message: "", type: "" });
    const [updating, setUpdating] = useState(null);

    // Define common reasons for point changes
    const commonReasons = [
        // Positive Reasons
        "On-time delivery excellence",
        "Fuel efficiency achievement",
        "Clean safety inspection",
        "Customer commendation",
        "Perfect attendance",
        "Vehicle maintenance diligence",
        "Mentor/training contribution",
        "Hazard avoidance recognition",
        "Long-term service milestone",
        // Negative Reasons
        "Late delivery",
        "Safety violation",
        "Customer complaint",
        "Excessive idling",
        "Missed check-in/paperwork",
        "Avoidable accident/incident",
        "Policy violation",
        "Training non-compliance",
        "Unauthorized route deviation",
        // Other
        "Other (specify in notes)"
    ];

    // API Gateway URL for the audit logging Lambda
    const API_BASE_URL = "https://8pk70542fj.execute-api.us-east-1.amazonaws.com/prod";
    const AUDIT_API_URL = `${API_BASE_URL}/audit-logs`;
    
    useEffect(() => {
        fetchDrivers();
    }, []);

    const fetchDrivers = async () => {
        try {
            const response = await fetch("http://44.202.51.190:8000/api/get-points/");
            // const response = await fetch("http://localhost:8000/api/get-points/");
            if (!response.ok) {
                throw new Error("Failed to fetch data");
            }
            const data = await response.json();
            setDrivers(data.drivers);
            setLoading(false);
        } catch (error) {
            setError(error.message);
            setLoading(false);
        }
    };

    // Handle input change for points
    const handleInputChange = (username, value) => {
        setPointInputs((prevInputs) => ({
            ...prevInputs,
            [username]: value,
        }));
    };

    // Handle select change for reasons
    const handleReasonChange = (username, value) => {
        setReasonInputs((prevReasons) => ({
            ...prevReasons,
            [username]: value,
        }));
    };

    // Show notification
    const showNotification = (message, type) => {
        setNotification({ show: true, message, type });
        setTimeout(() => {
            setNotification({ show: false, message: "", type: "" });
        }, 3000);
    };

    // Log audit event to AWS Lambda via API Gateway
    async function logAuditEvent(eventData) {
        try {
            const response = await fetch(AUDIT_API_URL, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    driver_username: eventData.username,
                    admin_user: "admin", // Replace with actual admin user from your auth system
                    previous_points: eventData.previousPoints,
                    points_change: eventData.pointsChange,
                    new_points: eventData.newPoints,
                    reason: eventData.reason, // Use the selected reason from state
                    event_type: "POINTS_UPDATE"
                })
            });
            
            if (!response.ok) {
                throw new Error("Failed to log audit event");
            }
            
            console.log("Audit log created successfully");
            return true;
        } catch (error) {
            console.error("Error logging audit event:", error);
            return false;
        }
    }
    
    // Handle updating points (add or subtract)
    const handleUpdatePoints = async (username) => {
        const pointsToChange = parseInt(pointInputs[username], 10);
        const selectedReason = reasonInputs[username];

        if (isNaN(pointsToChange) || pointsToChange === 0) {
            showNotification("Please enter a valid number (positive or negative).", "error");
            return;
        }

        // Check if a reason was selected
        if (!selectedReason) {
            showNotification("Please select a reason for the point change.", "error");
            return;
        }

        setUpdating(username);

        try {
            // Get current driver info for audit log
            const currentDriver = drivers.find(d => d.driver_username === username);
            const previousPoints = currentDriver ? currentDriver.driver_points : 0;
            
            const response = await fetch("http://44.202.51.190:8000/api/update-points/", {
            // const response = await fetch("http://localhost:8000/api/update-points/", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ username, points: pointsToChange }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || "Failed to update points.");
            }

            // Log the audit event after successful point update
            await logAuditEvent({
                username,
                previousPoints,
                pointsChange: pointsToChange,
                newPoints: data.new_points,
                reason: selectedReason
            });

            // Optimistic UI update
            setDrivers((prevDrivers) =>
                prevDrivers.map((driver) =>
                    driver.driver_username === username
                        ? { ...driver, driver_points: data.new_points }
                        : driver
                )
            );

            // Clear input fields
            setPointInputs((prevInputs) => ({
                ...prevInputs,
                [username]: "",
            }));
            setReasonInputs((prevReasons) => ({
                ...prevReasons,
                [username]: "", // Clear the reason after successful update
            }));

            showNotification(`Successfully updated ${username}'s points!`, "success");
        } catch (error) {
            showNotification(`Error: ${error.message}`, "error");
        } finally {
            setUpdating(null);
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
                {/* Notification */}
                {notification.show && (
                    <div style={{
                        position: "fixed",
                        top: "20px",
                        right: "20px",
                        padding: "15px 25px",
                        borderRadius: "8px",
                        backgroundColor: notification.type === "success" ? "#4CAF50" : "#F44336",
                        color: "white",
                        boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
                        zIndex: 1000,
                        animation: "slideIn 0.3s ease-out forwards"
                    }}>
                        {notification.message}
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
                            Driver Points Management
                        </h2>
                        <button
                            onClick={fetchDrivers}
                            style={{
                                padding: "10px 15px",
                                backgroundColor: "#f0f0f0",
                                border: "none",
                                borderRadius: "6px",
                                cursor: "pointer",
                                display: "flex",
                                alignItems: "center",
                                gap: "8px",
                                fontWeight: "500",
                                color: "#555"
                            }}
                        >
                            Refresh
                        </button>
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
                            <p style={{ fontSize: "16px" }}>Loading driver data...</p>
                        </div>
                    ) : error ? (
                        <div style={{
                            padding: "30px",
                            textAlign: "center",
                            color: "#d9534f"
                        }}>
                            <p style={{ fontSize: "16px", fontWeight: "500" }}>Error: {error}</p>
                            <button
                                onClick={fetchDrivers}
                                style={{
                                    marginTop: "15px",
                                    padding: "8px 16px",
                                    backgroundColor: "#f0f0f0",
                                    border: "none",
                                    borderRadius: "6px",
                                    cursor: "pointer",
                                    fontWeight: "500"
                                }}
                            >
                                Try Again
                            </button>
                        </div>
                    ) : (
                        <div style={{ overflowX: "auto" }}>
                            <table style={{
                                width: "100%",
                                borderCollapse: "collapse"
                            }}>
                                <thead>
                                    <tr style={{
                                        backgroundColor: "#F56600",
                                        color: "white"
                                    }}>
                                        <th style={{
                                            padding: "15px",
                                            textAlign: "left",
                                            fontWeight: "600"
                                        }}>Driver ID</th>
                                        <th style={{
                                            padding: "15px",
                                            textAlign: "left",
                                            fontWeight: "600"
                                        }}>Username</th>
                                        <th style={{
                                            padding: "15px",
                                            textAlign: "center",
                                            fontWeight: "600"
                                        }}>Current Points</th>
                                        <th style={{
                                            padding: "15px",
                                            textAlign: "center",
                                            fontWeight: "600"
                                        }}>Modify Points</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {drivers.length > 0 ? (
                                        drivers.map((driver, index) => (
                                            <tr
                                                key={driver.driver_id}
                                                style={{
                                                    backgroundColor: index % 2 === 0 ? "#f9f9f9" : "white",
                                                    transition: "background-color 0.2s"
                                                }}
                                            >
                                                <td style={{
                                                    padding: "15px",
                                                    borderBottom: "1px solid #eee"
                                                }}>{driver.driver_id}</td>
                                                <td style={{
                                                    padding: "15px",
                                                    borderBottom: "1px solid #eee",
                                                    fontWeight: "500"
                                                }}>{driver.driver_username}</td>
                                                <td style={{
                                                    padding: "15px",
                                                    borderBottom: "1px solid #eee",
                                                    textAlign: "center"
                                                }}>
                                                    <span style={{
                                                        fontWeight: "600",
                                                        color: "#F56600",
                                                        fontSize: "18px"
                                                    }}>
                                                        {driver.driver_points}
                                                    </span>
                                                </td>
                                                <td style={{
                                                    padding: "15px",
                                                    borderBottom: "1px solid #eee"
                                                }}>
                                                    <div style={{
                                                        display: "flex",
                                                        flexDirection: "column",
                                                        gap: "10px"
                                                    }}>
                                                        <div style={{
                                                            display: "flex",
                                                            alignItems: "center",
                                                            gap: "10px"
                                                        }}>
                                                            <div style={{
                                                                position: "relative",
                                                                display: "flex",
                                                                alignItems: "center"
                                                            }}>
                                                                <input
                                                                    type="number"
                                                                    value={pointInputs[driver.driver_username] || ""}
                                                                    onChange={(e) => handleInputChange(driver.driver_username, e.target.value)}
                                                                    placeholder="+/- Points"
                                                                    style={{
                                                                        width: "100px",
                                                                        padding: "10px 12px",
                                                                        border: "1px solid #ddd",
                                                                        borderRadius: "6px",
                                                                        fontSize: "14px",
                                                                        textAlign: "center"
                                                                    }}
                                                                />
                                                            </div>
                                                            <button
                                                                onClick={() => handleUpdatePoints(driver.driver_username)}
                                                                disabled={updating === driver.driver_username}
                                                                style={{
                                                                    padding: "10px 16px",
                                                                    backgroundColor: "#F56600",
                                                                    color: "white",
                                                                    border: "none",
                                                                    borderRadius: "6px",
                                                                    cursor: updating === driver.driver_username ? "wait" : "pointer",
                                                                    fontWeight: "500",
                                                                    display: "flex",
                                                                    alignItems: "center",
                                                                    gap: "8px",
                                                                    opacity: updating === driver.driver_username ? 0.7 : 1,
                                                                    transition: "background-color 0.2s, opacity 0.2s"
                                                                }}
                                                            >
                                                                {updating === driver.driver_username ? (
                                                                    <>
                                                                        <FaSpinner style={{
                                                                            animation: "spin 1s linear infinite"
                                                                        }} />
                                                                        Updating...
                                                                    </>
                                                                ) : (
                                                                    <>Update</>
                                                                )}
                                                            </button>
                                                        </div>
                                                        {/* Reason dropdown for audit logging */}
                                                        <select
                                                            id={`reason-${driver.driver_username}`}
                                                            value={reasonInputs[driver.driver_username] || ""}
                                                            onChange={(e) => handleReasonChange(driver.driver_username, e.target.value)}
                                                            style={{
                                                                width: "100%",
                                                                padding: "8px 12px",
                                                                border: !reasonInputs[driver.driver_username] && pointInputs[driver.driver_username] 
                                                                    ? "1px solid #F44336" // Highlight in red if a point value is entered but no reason selected
                                                                    : "1px solid #ddd",
                                                                borderRadius: "6px",
                                                                fontSize: "14px",
                                                                backgroundColor: "white"
                                                            }}
                                                            required
                                                        >
                                                            <option value="">Select reason for point change (required)</option>
                                                            <optgroup label="Positive Reasons">
                                                                <option value="On-time delivery excellence">On-time delivery excellence</option>
                                                                <option value="Fuel efficiency achievement">Fuel efficiency achievement</option>
                                                                <option value="Clean safety inspection">Clean safety inspection</option>
                                                                <option value="Customer commendation">Customer commendation</option>
                                                                <option value="Perfect attendance">Perfect attendance</option>
                                                                <option value="Vehicle maintenance diligence">Vehicle maintenance diligence</option>
                                                                <option value="Mentor/training contribution">Mentor/training contribution</option>
                                                                <option value="Hazard avoidance recognition">Hazard avoidance recognition</option>
                                                                <option value="Long-term service milestone">Long-term service milestone</option>
                                                            </optgroup>
                                                            <optgroup label="Negative Reasons">
                                                                <option value="Late delivery">Late delivery</option>
                                                                <option value="Safety violation">Safety violation</option>
                                                                <option value="Customer complaint">Customer complaint</option>
                                                                <option value="Excessive idling">Excessive idling</option>
                                                                <option value="Missed check-in/paperwork">Missed check-in/paperwork</option>
                                                                <option value="Avoidable accident/incident">Avoidable accident/incident</option>
                                                                <option value="Policy violation">Policy violation</option>
                                                                <option value="Training non-compliance">Training non-compliance</option>
                                                                <option value="Unauthorized route deviation">Unauthorized route deviation</option>
                                                            </optgroup>
                                                            <optgroup label="Other">
                                                                <option value="Other (specify in notes)">Other (specify in notes)</option>
                                                            </optgroup>
                                                        </select>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td
                                                colSpan="4"
                                                style={{
                                                    padding: "30px",
                                                    textAlign: "center",
                                                    color: "#666"
                                                }}
                                            >
                                                No drivers found in the system.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
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

export default Points;