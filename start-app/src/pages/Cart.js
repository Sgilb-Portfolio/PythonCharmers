import React, { useState, useEffect } from "react";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { useNavigate } from "react-router-dom"; 
import { FaTrash } from "react-icons/fa";

function Cart() {
    const navigate = useNavigate();
    const [cart, setCart] = useState([]);
    const [loading, setLoading] = useState(true);
    const user = localStorage.getItem("user");

    useEffect(() => {
        const fetchCartItems = async () => {
            try {
                const response = await fetch(`http://localhost:8000/api/cart/${user}`);
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

        fetchCartItems();
    }, [user]);

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
        (total, item) => total + (parseFloat(item.price) * 100) * item.quantity,
        0
    );

    if (loading) {
        return <p>Loading...</p>;
    }
    
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
                <h2>Your Cart</h2>

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
                                        <p><strong>{(item.price * 100).toFixed(0)} Points</strong> each</p>
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
                                onClick={() => navigate("/purchase")}
                            >
                                Proceed to Purchase
                            </button>
                        </div>
                    </div>
                )}
            </div>
            <Footer />
        </div>
    );
}

export default Cart;