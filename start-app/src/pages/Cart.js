import React, { useState } from "react";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { useNavigate } from "react-router-dom"; 
import { FaTrash } from "react-icons/fa";

function Cart() {

    const navigate = useNavigate();
    const [cart, setCart] = useState(() => JSON.parse(localStorage.getItem("cart")) || []);

    const handleRemoveItem = (index) => {
        const newCart = cart.filter((_, i) => i !== index);
        setCart(newCart);
        localStorage.setItem("cart", JSON.stringify(newCart));
    };

    const handleIncreaseQuantity = (index) => {
        const newCart = [...cart];
        newCart[index].quantity += 1;
        setCart(newCart);
        localStorage.setItem("cart", JSON.stringify(newCart));
    };

    const handleDecreaseQuantity = (index) => {
        const newCart = [...cart];
        if (newCart[index].quantity > 1) {
            newCart[index].quantity -= 1;
            setCart(newCart);
            localStorage.setItem("cart", JSON.stringify(newCart));
        }
    };

    const totalPoints = cart.reduce(
        (total, item) => total + (item.price * 100) * item.quantity,
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
                                        <p>Availability: {item.availability}</p>
                                        <div style={{ display: "flex", gap: "10px" }}>
                                            <button onClick={() => handleDecreaseQuantity(index)}>-</button>
                                            <span>Quantity: {item.quantity}</span>
                                            <button onClick={() => handleIncreaseQuantity(index)}>+</button>
                                        </div>
                                    </div>
                                </div>

                                <div>
                                    <FaTrash
                                        size={20}
                                        color="red"
                                        style={{ cursor: "pointer" }}
                                        onClick={() => handleRemoveItem(index)}
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