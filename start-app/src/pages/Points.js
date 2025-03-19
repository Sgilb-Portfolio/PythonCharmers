import React, { useState, useEffect } from "react";

const Points = () => {
    const [drivers, setDrivers] = useState([]);
    const [pointInputs, setPointInputs] = useState({});
    const [message, setMessage] = useState("");

    // Fetch the list of drivers
    useEffect(() => {
        fetch("http://44.202.51.190:8000/api/get-points/")
            .then((response) => response.json())
            .then((data) => {
                console.log("Fetched drivers:", data); // Debugging
                setDrivers(Array.isArray(data) ? data : []); // Ensure it's an array
            })
            .catch((error) => console.error("Error fetching drivers:", error));
    }, []);

    // Handle input change for each driver
    const handleInputChange = (username, value) => {
        setPointInputs((prev) => ({
            ...prev,
            [username]: value,
        }));
    };

    // Handle updating points for a specific driver
    const handleUpdatePoints = async (username) => {
        const pointsToAdd = parseInt(pointInputs[username], 10);
        if (isNaN(pointsToAdd) || pointsToAdd < 0) {
            setMessage("Invalid point value.");
            return;
        }

        try {
            const response = await fetch("http://44.202.51.190:8000/api/update-points/", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ username, points: pointsToAdd }),
            });

            const data = await response.json();
            if (response.ok) {
                setDrivers((prevDrivers) =>
                    prevDrivers.map((driver) =>
                        driver.username === username
                            ? { ...driver, points: driver.points + pointsToAdd }
                            : driver
                    )
                );
                setMessage(`Successfully updated ${username}'s points!`);
                setPointInputs((prev) => ({ ...prev, [username]: "" }));
            } else {
                setMessage(data.error || "Failed to update points.");
            }
        } catch (error) {
            setMessage("An error occurred. Please try again.");
        }
    };

    return (
        <div style={{
            maxWidth: "600px",
            margin: "auto",
            padding: "20px",
            textAlign: "center"
        }}>
            <h1 style={{ fontSize: "28px", marginBottom: "20px" }}>Manage Driver Points</h1>

            {message && <p style={{ color: "green" }}>{message}</p>}

            <table style={{
                width: "100%",
                borderCollapse: "collapse",
                marginTop: "20px"
            }}>
                <thead>
                    <tr style={{ backgroundColor: "#f2f2f2" }}>
                        <th style={{ padding: "10px", border: "1px solid #ddd" }}>Username</th>
                        <th style={{ padding: "10px", border: "1px solid #ddd" }}>Current Points</th>
                        <th style={{ padding: "10px", border: "1px solid #ddd" }}>Add Points</th>
                    </tr>
                </thead>
                <tbody>
                    {drivers ? (
                        drivers.map((driver) => (
                            <tr key={driver.driver_username}>
                                <td style={{ padding: "10px", border: "1px solid #ddd" }}>{driver.driver_username}</td>
                                <td style={{ padding: "10px", border: "1px solid #ddd" }}>{driver.driver_points}</td>
                                <td style={{ padding: "10px", border: "1px solid #ddd" }}>
                                    <input
                                        type="number"
                                        min="0"
                                        value={pointInputs[driver.username] || ""}
                                        onChange={(e) => handleInputChange(driver.username, e.target.value)}
                                        style={{
                                            width: "60px",
                                            padding: "5px",
                                            marginRight: "5px",
                                        }}
                                    />
                                    <button
                                        onClick={() => handleUpdatePoints(driver.username)}
                                        style={{
                                            backgroundColor: "#f56600",
                                            color: "#fff",
                                            border: "none",
                                            padding: "5px 10px",
                                            cursor: "pointer",
                                            borderRadius: "5px",
                                        }}
                                    >
                                        Add
                                    </button>
                                </td>
                            </tr>
                        ))
                    ) : (
                        <tr>
                            <td colSpan="3" style={{ padding: "10px", textAlign: "center", border: "1px solid #ddd" }}>
                                No drivers found.
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
    );
};

export default Points;
