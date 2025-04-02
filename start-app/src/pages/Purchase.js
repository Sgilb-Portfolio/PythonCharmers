import React, { useState, useEffect } from "react";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { useNavigate } from "react-router-dom"; 

function Purchase() {

    const navigate = useNavigate();
    const [purchaseComplete, setPurchaseComplete] = useState(false);
    const [cart, setCart] = useState(() => JSON.parse(localStorage.getItem("cart")) || []);
    const [userInfo, setUserInfo] = useState({
        name: "",
        address: ""
    });

    const totalPoints = cart.reduce(
        (total, item) => total + (item.price * 100) * item.quantity,
        0
    );

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setUserInfo({
            ...userInfo,
            [name]: value
        });
    };

    const handlePurchase = () => {
        if (!userInfo.name || !userInfo.address) {
            alert("Please fill out all fields.");
            return;
        }

        // to save purchase info for later
        console.log("Purchase completed:", { cart, userInfo });
        localStorage.removeItem("cart");
        setCart([]);
        setPurchaseComplete(true);

        setTimeout(() => {
            navigate("/");
        }, 3000);
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

                {cart.length === 0 ? (
                    <p>Your cart is empty.</p>
                ) : (
                    <div>
                        <div>
                            <h3>Items in Your Cart</h3>
                            {cart.map((item, index) => (
                                <div key={index} style={{
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
                                            <p><strong>{(item.price * 100).toFixed(0)} Points</strong> each</p>
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
                                    style={{ width: "100%", padding: "8px", margin: "10px 0", borderRadius: "5px", border: "1px solid #ccc" }}
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
                                    style={{ width: "100%", padding: "8px", margin: "10px 0", borderRadius: "5px", border: "1px solid #ccc" }}
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
                            }}>
                            Complete Purchase
                        </button>
                    </div>
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
            <Footer />
        </div>
    );
}

export default Purchase;