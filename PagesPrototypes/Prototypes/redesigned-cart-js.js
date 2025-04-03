import React, { useState, useEffect } from "react";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { useNavigate } from "react-router-dom"; 
import { FaTrash } from "react-icons/fa";

function Cart() {
    const navigate = useNavigate();
    const [cart, setCart] = useState([]);
    
    useEffect(() => {
        document.title = "Cart | Driver Incentive Program";
        
        // Load cart from localStorage
        const savedCart = JSON.parse(localStorage.getItem("cart")) || [];
        setCart(savedCart);
    }, []);

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
    
    // Common styles for consistent design
    const pageContainer = {
        minHeight: "100vh",
        fontFamily: "'Segoe UI', Roboto, 'Helvetica Neue', sans-serif",
        backgroundColor: "#f9f9f9",
        display: "flex",
        flexDirection: "column"
    };

    const mainContent = {
        flex: "1",
        padding: "40px 20px",
        maxWidth: "1000px",
        margin: "0 auto",
        width: "100%"
    };

    const pageTitle = {
        fontSize: "36px",
        color: "#333333",
        marginBottom: "30px",
        textAlign: "center"
    };

    const cartContainer = {
        backgroundColor: "#FFFFFF",
        borderRadius: "8px",
        boxShadow: "0 4px 10px rgba(0, 0, 0, 0.1)",
        padding: "25px",
        marginBottom: "30px"
    };

    const cartItemStyle = {
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        marginBottom: "20px",
        padding: "15px",
        border: "1px solid #eee",
        borderRadius: "8px",
        transition: "box-shadow 0.2s ease"
    };

    const cartItemLeftSection = {
        display: "flex", 
        gap: "15px"
    };
    
    const itemImage = {
        width: "80px", 
        height: "auto", 
        borderRadius: "8px", 
        objectFit: "cover"
    };
    
    const itemDetails = {
        display: "flex", 
        flexDirection: "column", 
        justifyContent: "space-between"
    };
    
    const itemName = {
        fontSize: "18px", 
        fontWeight: "bold", 
        marginBottom: "5px",
        color: "#333333"
    };
    
    const itemCreator = {
        fontSize: "14px", 
        color: "#666666",
        marginBottom: "5px"
    };
    
    const itemPrice = {
        fontSize: "16px", 
        fontWeight: "bold", 
        color: "#F56600",
        marginBottom: "5px"
    };
    
    const itemAvailability = {
        fontSize: "14px", 
        color: "#666666",
        marginBottom: "10px"
    };
    
    const quantityControls = {
        display: "flex", 
        alignItems: "center", 
        gap: "10px"
    };
    
    const quantityButton = {
        width: "28px",
        height: "28px",
        borderRadius: "50%",
        border: "1px solid #ddd",
        background: "#f5f5f5",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        cursor: "pointer",
        fontSize: "16px",
        userSelect: "none",
        transition: "background-color 0.2s"
    };

    const removeButton = {
        cursor: "pointer",
        color: "#dc3545",
        background: "none",
        border: "none",
        padding: "8px",
        borderRadius: "50%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        transition: "background-color 0.2s"
    };

    const cartFooter = {
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        marginTop: "20px",
        paddingTop: "20px",
        borderTop: "1px solid #eee",
        flexWrap: "wrap"
    };

    const totalText = {
        fontSize: "20px",
        fontWeight: "bold",
        color: "#333333"
    };

    const primaryButton = {
        backgroundColor: "#F56600",
        color: "#FFFFFF",
        padding: "12px 25px",
        borderRadius: "25px",
        border: "none",
        fontWeight: "bold",
        cursor: "pointer",
        fontSize: "16px",
        transition: "background-color 0.3s"
    };

    const emptyCartMessage = {
        textAlign: "center",
        fontSize: "18px",
        color: "#666666",
        padding: "30px 0"
    };

    return (
        <div style={pageContainer}>
            <Header />
            
            <main style={mainContent}>
                <h1 style={pageTitle}>Your Cart</h1>
                
                <div style={cartContainer}>
                    {cart.length === 0 ? (
                        <div style={emptyCartMessage}>
                            <p>Your cart is empty. Start shopping!</p>
                            <button 
                                style={{
                                    ...primaryButton, 
                                    marginTop: "20px"
                                }}
                                onClick={() => navigate("/catalog")}
                                onMouseEnter={(e) => e.target.style.backgroundColor = "#522D80"}
                                onMouseLeave={(e) => e.target.style.backgroundColor = "#F56600"}
                            >
                                Browse Products
                            </button>
                        </div>
                    ) : (
                        <div>
                            {cart.map((item, index) => (
                                <div 
                                    key={index} 
                                    style={cartItemStyle}
                                    onMouseEnter={(e) => e.currentTarget.style.boxShadow = "0 4px 8px rgba(0,0,0,0.1)"}
                                    onMouseLeave={(e) => e.currentTarget.style.boxShadow = "none"}
                                >
                                    <div style={cartItemLeftSection}>
                                        <img src={item.image} alt={item.name} style={itemImage} />
                                        <div style={itemDetails}>
                                            <h3 style={itemName}>{item.name}</h3>
                                            <p style={itemCreator}>{item.creator}</p>
                                            <p style={itemPrice}>{(item.price * 100).toFixed(0)} Points each</p>
                                            <p style={itemAvailability}>Availability: {item.availability}</p>
                                            <div style={quantityControls}>
                                                <button 
                                                    style={quantityButton}
                                                    onClick={() => handleDecreaseQuantity(index)}
                                                    onMouseEnter={(e) => e.target.style.backgroundColor = "#e9e9e9"}
                                                    onMouseLeave={(e) => e.target.style.backgroundColor = "#f5f5f5"}
                                                >
                                                    -
                                                </button>
                                                <span>Quantity: {item.quantity}</span>
                                                <button 
                                                    style={quantityButton}
                                                    onClick={() => handleIncreaseQuantity(index)}
                                                    onMouseEnter={(e) => e.target.style.backgroundColor = "#e9e9e9"}
                                                    onMouseLeave={(e) => e.target.style.backgroundColor = "#f5f5f5"}
                                                >
                                                    +
                                                </button>
                                            </div>
                                        </div>
                                    </div>

                                    <button 
                                        style={removeButton}
                                        onClick={() => handleRemoveItem(index)}
                                        onMouseEnter={(e) => e.target.style.backgroundColor = "#ffeeee"}
                                        onMouseLeave={(e) => e.target.style.backgroundColor = "transparent"}
                                        title="Remove item"
                                    >
                                        <FaTrash size={18} />
                                    </button>
                                </div>
                            ))}

                            <div style={cartFooter}>
                                <h3 style={totalText}>Total: {totalPoints.toFixed(0)} Points</h3>
                                <button
                                    style={primaryButton}
                                    onClick={() => navigate("/purchase")}
                                    onMouseEnter={(e) => e.target.style.backgroundColor = "#522D80"}
                                    onMouseLeave={(e) => e.target.style.backgroundColor = "#F56600"}
                                >
                                    Proceed to Purchase
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </main>
            
            <Footer />
        </div>
    );
}

export default Cart;