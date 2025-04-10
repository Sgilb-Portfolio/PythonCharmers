import React, { useEffect, useState } from "react";
import { Info, X, ShoppingCart } from 'lucide-react';
import Header from "../components/Header";
import Footer from "../components/Footer";

function Catalog() {
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState("");
    const [mediaType, setMediaType] = useState("movie");
    const [itemsPerPage, setItemsPerPage] = useState(10);
    const [searchHistory, setSearchHistory] = useState([]);
    const [cart, setCart] = useState([]);
    const [expandedItem, setExpandedItem] = useState(null);

    const saveSearchHistory = (term) => {
        let history = JSON.parse(localStorage.getItem("searchHistory")) || [];
        if (!history.includes(term)) {
            history.push(term);
            if (history.length > 5) {
                history.shift();  // Keep the last 5 searches
            }
            localStorage.setItem("searchHistory", JSON.stringify(history));
        }
    };
    
    const fetchData = () => {
        if (!searchTerm) return;
        
        setLoading(true);
        //fetch(`http://44.202.51.190:8000/api/itunes-search/?term=${searchTerm}&media=${mediaType}&limit=${itemsPerPage}`)
        fetch(`http://127.0.0.1:8000/api/itunes-search/?term=${searchTerm}&media=${mediaType}&limit=${itemsPerPage}`)
        .then(response => response.json())
            .then(data => {
                if (data.results) {
                    setItems(data.results);
                    setError(null);
                } else {
                    setError("No results found");
                }
                setLoading(false);
            })
            .catch(() => {
                setError("Failed to fetch data");
                setLoading(false);
            });
    };

    useEffect(() => {
        const history = JSON.parse(localStorage.getItem("searchHistory")) || [];
        setSearchHistory(history);
        
        // Load cart from localStorage when component mounts
        const savedCart = JSON.parse(localStorage.getItem("cart")) || [];
        setCart(savedCart);
    }, []);

    const handleHistorySelect = (term) => {
        setSearchTerm(term);
        saveSearchHistory(term);
        fetchData();
    };

    const handleItemsPerPageChange = (e) => {
        setItemsPerPage(e.target.value);
    };

    const handleSearchButtonClick = () => {
        if (searchTerm) {
            fetchData();
            saveSearchHistory(searchTerm);
        }
    };

    const addToCart = (item) => {
        console.log("Adding item to cart:", item);
    
        setCart((prevCart) => {
            let updatedCart = [...prevCart]; // Copy current cart
    
            // Check if item already exists
            const existingItem = updatedCart.find(cartItem => cartItem.name === item.name);
    
            if (existingItem) {
                // Increase quantity if the item is already in the cart
                updatedCart = updatedCart.map(cartItem =>
                    cartItem.name === item.name
                        ? { ...cartItem, quantity: cartItem.quantity + 1 }
                        : cartItem
                );
            } else {
                // Add new item with quantity 1
                updatedCart.push({ ...item, quantity: 1 });
            }
    
            // Save to localStorage
            localStorage.setItem("cart", JSON.stringify(updatedCart));
    
            console.log("Updated Cart:", updatedCart);
            return updatedCart;
        });
        
        // Hide item details modal if open
        if (expandedItem !== null) {
            setExpandedItem(null);
        }
    };
    
    const showItemDetails = (index) => {
        setExpandedItem(index);
    };
    
    const hideItemDetails = () => {
        setExpandedItem(null);
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
                justifyContent: "center", 
                padding: "40px 20px",
                marginTop: "70px" // Add space for fixed header
            }}>
                <h1 style={{ fontSize: "48px", color: "#333333", marginBottom: "20px" }}>Store (Itunes)</h1>

                {/* Search Input and Button Container */}
                <div style={{ 
                    display: "flex", 
                    flexDirection: "column", // Stack input and button vertically
                    alignItems: "center", 
                    marginBottom: "20px",
                    position: "relative" // So the history dropdown can be positioned absolutely
                }}>
                    <div style={{ display: "flex", justifyContent: "center", alignItems: "center" }}>
                        <input
                            type="text"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            placeholder="Search for products"
                            style={{
                                padding: "10px",
                                fontSize: "16px",
                                borderRadius: "4px",
                                border: "1px solid #ddd",
                                width: "300px", // Set a fixed width for the input
                                marginRight: "10px", // Space between input and button
                            }}
                        />
                        <button 
                            onClick={handleSearchButtonClick}
                            style={{
                                padding: "10px 20px",
                                fontSize: "16px",
                                backgroundColor: "#4CAF50",
                                color: "white",
                                border: "none",
                                borderRadius: "4px",
                                cursor: "pointer",
                            }}>
                            Search
                        </button>
                    </div>

                    {/* Conditionally render Search History Dropdown */}
                    {searchTerm && searchHistory.length > 0 && (
                        <ul style={{
                            position: "absolute",
                            top: "100%", // Place the dropdown below the input
                            left: "0",
                            width: "300px", // Match input width
                            backgroundColor: "#fff",
                            border: "1px solid #ddd",
                            maxHeight: "200px",
                            overflowY: "auto",
                            padding: "0",
                            margin: "0",
                            boxShadow: "0 8px 16px rgba(0,0,0,0.1)",
                            zIndex: "10" // Add z-index to ensure it appears above other elements
                        }}>
                            {searchHistory.map((term, index) => (
                                <li
                                    key={index}
                                    onClick={() => handleHistorySelect(term)}
                                    style={{
                                        padding: "10px",
                                        cursor: "pointer",
                                        borderBottom: "1px solid #ddd",
                                    }}
                                >
                                    {term}
                                </li>
                            ))}
                        </ul>
                    )}
                </div>

                {/* Media Type and Items Per Page Filters */}
                <div style={{
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    marginBottom: "20px",
                    gap: "20px"
                }}>
                    <div>
                        <label htmlFor="mediaType" style={{ marginRight: "10px" }}>Media Type:</label>
                        <select 
                            id="mediaType"
                            value={mediaType} 
                            onChange={(e) => setMediaType(e.target.value)}
                            style={{
                                padding: "8px",
                                borderRadius: "4px",
                                border: "1px solid #ddd"
                            }}
                        >
                            <option value="music">Music</option>
                            <option value="movie">Movie</option>
                            <option value="podcast">Podcast</option>
                            <option value="ebook">E-Book</option>
                        </select>
                    </div>

                    <div>
                        <label htmlFor="itemsPerPage" style={{ marginRight: "10px" }}>Items Per Page:</label>
                        <select 
                            id="itemsPerPage"
                            value={itemsPerPage} 
                            onChange={handleItemsPerPageChange}
                            style={{
                                padding: "8px",
                                borderRadius: "4px",
                                border: "1px solid #ddd"
                            }}
                        >
                            <option value={5}>5</option>
                            <option value={10}>10</option>
                            <option value={20}>20</option>
                            <option value={50}>50</option>
                        </select>
                    </div>
                </div>

                {/* Loading and Error Handling */}
                {loading && <p>Loading...</p>}
                {error && <p style={{ color: "red" }}>{error}</p>}

                {/* Displaying Items - Improved version */}
                <div style={{
                    display: "flex",
                    flexWrap: "wrap",
                    justifyContent: "center",
                    overflowY: "auto", 
                    maxHeight: "600px",
                    width: "100%",
                    paddingBottom: "20px",
                }}>
                    {items.map((item, index) => (
                        <div key={index} style={{
                            border: "1px solid #ddd",
                            borderRadius: "8px",
                            padding: "16px",
                            margin: "12px",
                            width: "250px",
                            boxSizing: "border-box",
                            boxShadow: "0 2px 4px rgba(0,0,0,0.05)",
                            backgroundColor: "#fff",
                            transition: "transform 0.2s, box-shadow 0.2s",
                            display: "flex",
                            flexDirection: "column",
                            position: "relative",
                        }}>
                            <img 
                                src={item.image} 
                                alt={item.name} 
                                style={{ 
                                    width: "100%", 
                                    height: "160px", 
                                    objectFit: "cover",
                                    borderRadius: "4px",
                                    marginBottom: "12px" 
                                }} 
                            />
                            <h3 style={{ 
                                fontSize: "16px", 
                                marginTop: "0", 
                                marginBottom: "8px",
                                fontWeight: "600",
                                minHeight: "40px",
                                display: "-webkit-box",
                                WebkitLineClamp: "2",
                                WebkitBoxOrient: "vertical",
                                overflow: "hidden",
                                textOverflow: "ellipsis"
                            }}>
                                {item.name}
                            </h3>
                            <p style={{ 
                                fontSize: "14px", 
                                margin: "4px 0",
                                color: item.availability === "In Stock" ? "#2e7d32" : "#d32f2f",
                                fontWeight: "500"
                            }}>
                                Availability: {item.availability}
                            </p>
                            <p style={{ 
                                fontSize: "18px", 
                                fontWeight: "700", 
                                margin: "8px 0",
                                color: "#333"
                            }}>
                                {(item.price * 100).toFixed(0)} Points
                            </p>
                            <div style={{
                                display: "flex",
                                justifyContent: "space-between",
                                marginTop: "auto"
                            }}>
                                <button 
                                    onClick={() => showItemDetails(index)}
                                    style={{
                                        padding: "6px 10px",
                                        backgroundColor: "transparent",
                                        color: "#0277bd",
                                        border: "none",
                                        borderRadius: "4px",
                                        cursor: "pointer",
                                        display: "flex",
                                        alignItems: "center",
                                        fontSize: "14px"
                                    }}
                                >
                                    <span style={{ marginRight: "4px" }}>ℹ️</span> More Info
                                </button>
                                <button 
                                    onClick={() => addToCart(item)}
                                    style={{
                                        padding: "6px 14px",
                                        backgroundColor: "#007bff",
                                        color: "white",
                                        border: "none",
                                        borderRadius: "4px",
                                        cursor: "pointer",
                                        display: "flex",
                                        alignItems: "center",
                                        fontSize: "14px"
                                    }}
                                >
                                    <span style={{ marginRight: "4px" }}>🛒</span> Add
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
                
                {/* Item Details Modal */}
                {expandedItem !== null && items[expandedItem] && (
                    <div style={{
                        position: "fixed",
                        top: "0",
                        left: "0",
                        right: "0",
                        bottom: "0",
                        backgroundColor: "rgba(0, 0, 0, 0.5)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        zIndex: "1000"
                    }}>
                        <div style={{
                            backgroundColor: "white",
                            borderRadius: "8px",
                            maxWidth: "800px",
                            width: "90%",
                            maxHeight: "80vh",
                            overflow: "auto",
                            position: "relative"
                        }}>
                            <div style={{
                                display: "flex",
                                justifyContent: "space-between",
                                alignItems: "center",
                                borderBottom: "1px solid #eee",
                                padding: "16px 20px"
                            }}>
                                <h2 style={{ 
                                    margin: "0", 
                                    fontSize: "20px", 
                                    fontWeight: "600" 
                                }}>
                                    {items[expandedItem].name}
                                </h2>
                                <button
                                    onClick={hideItemDetails}
                                    style={{
                                        background: "transparent",
                                        border: "none",
                                        fontSize: "20px",
                                        cursor: "pointer",
                                        color: "#666"
                                    }}
                                >
                                    ✕
                                </button>
                            </div>
                            <div style={{
                                padding: "20px",
                                display: "flex",
                                flexDirection: "row",
                                flexWrap: "wrap"
                            }}>
                                <div style={{
                                    flex: "1 1 300px",
                                    marginRight: "20px",
                                    marginBottom: "20px"
                                }}>
                                    <img
                                        src={items[expandedItem].image}
                                        alt={items[expandedItem].name}
                                        style={{
                                            width: "100%",
                                            maxHeight: "300px",
                                            objectFit: "contain",
                                            borderRadius: "4px"
                                        }}
                                    />
                                </div>
                                <div style={{
                                    flex: "1 1 300px",
                                }}>
                                    <div style={{ marginBottom: "20px" }}>
                                        <p style={{ margin: "8px 0" }}>
                                            <span style={{ fontWeight: "600" }}>Creator:</span> {items[expandedItem].creator}
                                        </p>
                                        <p style={{ margin: "8px 0" }}>
                                            <span style={{ fontWeight: "600" }}>Type:</span> {items[expandedItem].type}
                                        </p>
                                        <p style={{ margin: "8px 0" }}>
                                            <span style={{ fontWeight: "600" }}>Price:</span> {(items[expandedItem].price * 100).toFixed(0)} Points
                                        </p>
                                        <p style={{ margin: "8px 0" }}>
                                            <span style={{ fontWeight: "600" }}>Availability:</span> 
                                            <span style={{
                                                color: items[expandedItem].availability === "In Stock" ? "#2e7d32" : "#d32f2f",
                                                fontWeight: "500",
                                                marginLeft: "4px"
                                            }}>
                                                {items[expandedItem].availability}
                                            </span>
                                        </p>
                                    </div>
                                    <button
                                        onClick={() => addToCart(items[expandedItem])}
                                        style={{
                                            width: "100%",
                                            padding: "12px",
                                            backgroundColor: "#007bff",
                                            color: "white",
                                            border: "none",
                                            borderRadius: "4px",
                                            cursor: "pointer",
                                            fontSize: "16px",
                                            display: "flex",
                                            alignItems: "center",
                                            justifyContent: "center"
                                        }}
                                    >
                                        <span style={{ marginRight: "8px" }}>🛒</span>
                                        Add to Cart
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </main>
            <Footer />
        </div>
    );
}

export default Catalog;