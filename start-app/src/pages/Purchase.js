import React, { useState, useEffect } from "react";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { useNavigate, useLocation } from "react-router-dom"; 

function Purchase() {

    const navigate = useNavigate();
    const location = useLocation();
    console.log("Received state:", location.state);
    const [cart, setCart] = useState([]);
    const [sponsors, setSponsors] = useState([]);
    const initialSponsor = location.state?.selectedSponsor;
    const initialPtAmt = location.state?.ptAmt;
    const [selectedSponsor, setSelectedSponsor] = useState(initialSponsor);
    const [ptAmt, setPtAmt] = useState(initialPtAmt);
    const [userInfo, setUserInfo] = useState({ name: "", address: "" });
    const [purchaseComplete, setPurchaseComplete] = useState(false);
    const [loadingSponsors, setLoadingSponsors] = useState(true);
    const [totalPoints, setTotalPoints] = useState(0);
    const user = localStorage.getItem("user");

    const fetchSponsors = async () => {
        try {
            const token = localStorage.getItem("IdToken"); 
            //const response = await fetch(`http://localhost:8000/api/get-driver-sponsors/?username=${user}`, {
            const response = await fetch(`http://44.202.51.190:8000/api/get-driver-sponsors/?username=${user}`, {
                headers: {
                    "Authorization": `Bearer ${token}`,
                },
            });
            const data = await response.json();
            if (response.ok && Array.isArray(data)) {
                setSponsors(data);
            } else {
                console.error("Unexpected sponsor format");
            }
        } catch (error) {
            console.error("Error fetching sponsors:", error);
        } finally {
            setLoadingSponsors(false);
        }
    };

    const fetchCartItems = async (sponsorId) => {
        try {
            //const response = await fetch(`http://localhost:8000/api/cart/${user}?sponsor_id=${sponsorId}`);
            const response = await fetch(`http://44.202.51.190:8000/api/cart/${user}?sponsor_id=${sponsorId}`);
            const data = await response.json();
            if (response.ok) {
                setCart(data.cart);
            } else {
                console.error("Failed to fetch cart:", data.error);
            }
        } catch (error) {
            console.error("Error fetching cart items:", error);
        }
    };

    useEffect(() => {
        fetchSponsors();
    }, []);

    useEffect(() => {
        if (selectedSponsor) {
            fetchCartItems(selectedSponsor);
        }
    }, [selectedSponsor]);

    useEffect(() => {
        console.log("Cart Data:", cart);
        console.log("ptAmt:", ptAmt);
        if (cart.length > 0 && ptAmt > 0) {
            const calculatedTotal = cart.reduce(
                (total, item) => total + (parseFloat(item.price) / parseFloat(ptAmt)) * item.quantity,
                0
            );
            setTotalPoints(calculatedTotal);
            console.log("Total Points:", totalPoints);
        }
    }, [cart, ptAmt]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setUserInfo({ ...userInfo, [name]: value });
    };

    const handlePurchase = async () => {
        if (!userInfo.name || !userInfo.address) {
            alert("Please fill out all fields.");
            return;
        }
    
        const payload = {
            username: user,
            sponsor_id: selectedSponsor,
            name: userInfo.name,
            address: userInfo.address,
            cart: cart
        };
    
        try {
            //const response = await fetch(`http://localhost:8000/api/complete-purchase/`, {
            const response = await fetch(`http://44.202.51.190:8000/api/complete-purchase/`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(payload)
            });
    
            if (response.ok) {
                setCart([]);
                setPurchaseComplete(true);
                setTimeout(() => navigate("/"), 3000);
            } else {
                console.error("Failed to complete purchase");
            }
        } catch (error) {
            console.error("Error during purchase:", error);
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
            <main style={{
                flex: "1",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "flex-start",
                padding: "40px 20px",
                marginTop: "70px"
            }}>
                {!selectedSponsor ? (
                    <>
                        <h2>Select a Sponsor</h2>
                        {loadingSponsors ? (
                            <p>Loading sponsors...</p>
                        ) : (
                            <ul style={{ listStyle: "none", padding: 0 }}>
                                {sponsors.map((sponsor) => (
                                    <li key={sponsor.sponsor_id} style={{ marginBottom: "10px" }}>
                                        <button
                                            onClick={() => {
                                                setSelectedSponsor(sponsor.sponsor_id);
                                                setPtAmt(sponsor.sponsor_pt_amt);
                                            }}
                                            style={{
                                                padding: "10px 20px",
                                                backgroundColor: "#007bff",
                                                color: "white",
                                                border: "none",
                                                borderRadius: "4px",
                                                cursor: "pointer",
                                            }}
                                        >
                                            {sponsor.sponsor_name}
                                        </button>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </>
                ) : (
                    <div style={{
                        padding: "20px",
                        flex: 1,
                        backgroundColor: "#fff",
                        maxWidth: "900px",
                        margin: "40px auto",
                        boxShadow: "0px 4px 20px rgba(0, 0, 0, 0.1)",
                        borderRadius: "8px"
                    }}>
                        <h2>Confirm Your Purchase</h2>
                        <button
                            onClick={() => setSelectedSponsor(null)}
                            style={{
                                padding: "10px 20px",
                                backgroundColor: "#007bff",
                                color: "white",
                                border: "none",
                                borderRadius: "4px",
                                cursor: "pointer",
                                marginBottom: "20px"
                            }}
                        >
                            Change Sponsor
                        </button>

                        {cart.length === 0 ? (
                            <p>Your cart is empty.</p>
                        ) : (
                            <>
                                <div>
                                    <h3>Items in Your Cart</h3>
                                    {cart.map((item) => (
                                        <div key={item.cart_item_id} style={{
                                            display: "flex",
                                            alignItems: "center",
                                            justifyContent: "space-between",
                                            marginBottom: "20px",
                                            padding: "10px",
                                            border: "1px solid #eee",
                                            borderRadius: "8px"
                                        }}>
                                            <div style={{ display: "flex", gap: "15px" }}>
                                                <img
                                                    src={item.image}
                                                    alt={item.name}
                                                    style={{ width: "80px", height: "auto", borderRadius: "8px" }}
                                                />
                                                <div>
                                                    <h3>{item.name}</h3>
                                                    <p>{item.creator}</p>
                                                    <p><strong>{(item.price / ptAmt).toFixed(0)} Points</strong> each</p>
                                                    <p>Availability: {item.availability}</p>
                                                    <p><strong>Quantity: {item.quantity}</strong></p>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                <h3>Total: {totalPoints.toFixed(0)} Points</h3>

                                <div style={{ marginTop: "30px" }}>
                                    <h3>Billing Information</h3>
                                    <label>
                                        Name:
                                        <input
                                            type="text"
                                            name="name"
                                            value={userInfo.name}
                                            onChange={handleInputChange}
                                            placeholder="Enter your name"
                                            style={{
                                                width: "100%",
                                                padding: "8px",
                                                margin: "10px 0",
                                                borderRadius: "5px",
                                                border: "1px solid #ccc"
                                            }}
                                        />
                                    </label>
                                    <label>
                                        Address:
                                        <input
                                            type="text"
                                            name="address"
                                            value={userInfo.address}
                                            onChange={handleInputChange}
                                            placeholder="Enter your address"
                                            style={{
                                                width: "100%",
                                                padding: "8px",
                                                margin: "10px 0",
                                                borderRadius: "5px",
                                                border: "1px solid #ccc"
                                            }}
                                        />
                                    </label>
                                </div>

                                <button
                                    onClick={handlePurchase}
                                    style={{
                                        backgroundColor: "#F56600",
                                        color: "#fff",
                                        padding: "10px 20px",
                                        borderRadius: "20px",
                                        border: "none",
                                        cursor: "pointer",
                                        fontWeight: "bold",
                                        marginTop: "20px",
                                        transition: "background-color 0.3s"
                                    }}
                                >
                                    Complete Purchase
                                </button>
                            </>
                        )}

                        {purchaseComplete && (
                            <div style={{
                                marginTop: "30px",
                                textAlign: "center",
                                fontSize: "18px",
                                color: "#28a745",
                                fontWeight: "bold"
                            }}>
                                <p>Thank you for your purchase!</p>
                            </div>
                        )}
                    </div>
                )}
            </main>
            <Footer />
        </div>
    );
}

export default Purchase;