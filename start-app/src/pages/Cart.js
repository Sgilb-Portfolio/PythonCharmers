import React, { useState, useEffect } from "react";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { useNavigate } from "react-router-dom"; 
import { FaTrash } from "react-icons/fa";

function Cart() {
    const navigate = useNavigate();
    const [cart, setCart] = useState([]);
    const [loading, setLoading] = useState(true);
    const [sponsors, setSponsors] = useState([]);
    const [selectedSponsor, setSelectedSponsor] = useState(null);
    const [loadingSponsors, setLoadingSponsors] = useState(true);
    const [ptAmt, setPtAmt] = useState(null)
    const user = localStorage.getItem("user");

    const fetchSponsors = async () => {
        try {
            const token = localStorage.getItem("IdToken");
            const response = await fetch(`http://localhost:8000/api/get-driver-sponsors/?username=${user}`, {
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
            const response = await fetch(`http://localhost:8000/api/cart/${user}?sponsor_id=${sponsorId}`);
            const data = await response.json();
            if (response.ok) {
                setCart(data.cart);
            } else {
                console.error("Failed to fetch cart:", data.error);
            }
        } catch (error) {
            console.error("Error fetching cart items:", error);
        } finally {
            setLoading(false);
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

    const handleRemoveItem = async (itemId) => {
        try {
            const response = await fetch(`http://localhost:8000/api/cart/${itemId}/remove/`, {
                method: "DELETE",
            });

            if (response.ok) {
                setCart(cart.filter((item) => item.cart_item_id !== itemId));
            } else {
                console.error("Failed to remove item.");
            }
        } catch (error) {
            console.error("Error removing item:", error);
        }
    };

    const handleIncreaseQuantity = async (itemId) => {
        try {
            const response = await fetch(`http://localhost:8000/api/cart/${itemId}/increase/`, {
                method: "PATCH",
            });

            if (response.ok) {
                const updatedItem = await response.json();
                setCart(cart.map((item) => item.cart_item_id === itemId ? updatedItem : item));
            } else {
                console.error("Failed to increase quantity.");
            }
        } catch (error) {
            console.error("Error increasing quantity:", error);
        }
    };

    const handleDecreaseQuantity = async (itemId) => {
        try {
            const response = await fetch(`http://localhost:8000/api/cart/${itemId}/decrease/`, {
                method: "PATCH",
            });

            if (response.ok) {
                const updatedItem = await response.json();
                setCart(cart.map((item) => item.cart_item_id === itemId ? updatedItem : item));
            } else {
                console.error("Failed to decrease quantity.");
            }
        } catch (error) {
            console.error("Error decreasing quantity:", error);
        }
    };

    const totalPoints = cart.reduce(
        (total, item) => total + (parseFloat(item.price) / parseFloat(ptAmt)) * item.quantity,
        0
    );
    
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
                                                    setPtAmt(sponsor.sponsor_pt_amt)
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
                        <>
                            <div style={{
                                padding: "20px",
                                flex: 1,
                                backgroundColor: "#fff",
                                maxWidth: "900px",
                                margin: "40px auto",
                                boxShadow: "0px 4px 20px rgba(0, 0, 0, 0.1)",
                                borderRadius: "8px"
                            }}>
                            <h2>Your Cart</h2>
                            <button onClick={() => setSelectedSponsor(null)}
                                style={{
                                    padding: "10px 20px",
                                    backgroundColor: "#007bff",
                                    color: "white",
                                    border: "none",
                                    borderRadius: "4px",
                                    cursor: "pointer",
                                }}
                            >
                                Change Sponsor
                            </button>
                            {cart.length === 0 ? (
                                <p>Your cart is empty. Start shopping!</p>
                            ) : (
                                <div>
                                    {cart.map((item) => (
                                        <div key={item.id} style={{
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
                                                    <div style={{ display: "flex", gap: "10px" }}>
                                                        <button onClick={() => handleDecreaseQuantity(item.cart_item_id)}>-</button>
                                                        <span>Quantity: {item.quantity}</span>
                                                        <button onClick={() => handleIncreaseQuantity(item.cart_item_id)}>+</button>
                                                    </div>
                                                </div>
                                            </div>

                                            <div>
                                                <FaTrash
                                                    size={20}
                                                    color="red"
                                                    style={{ cursor: "pointer" }}
                                                    onClick={() => handleRemoveItem(item.cart_item_id)}
                                                />
                                            </div>
                                        </div>
                                    ))}

                                    <div style={{
                                        display: "flex",
                                        justifyContent: "space-between",
                                        marginTop: "30px",
                                        fontSize: "18px"
                                    }}>
                                        <h3>Total: {totalPoints.toFixed(0)} Points</h3>
                                        <button
                                            style={{
                                                backgroundColor: "#F56600",
                                                color: "#fff",
                                                padding: "10px 20px",
                                                borderRadius: "20px",
                                                border: "none",
                                                cursor: "pointer",
                                                fontWeight: "bold",
                                                transition: "background-color 0.3s"
                                            }}
                                            onClick={() => navigate("/purchase", {
                                                state: {
                                                    selectedSponsor: selectedSponsor,
                                                    ptAmt: ptAmt
                                                }
                                            })}
                                        >
                                            Proceed to Purchase
                                        </button>
                                    </div>
                                </div>
                            )}
                            </div>
                        </>
                    )}
            </main>
            <Footer />
        </div>
    );
}

export default Cart;