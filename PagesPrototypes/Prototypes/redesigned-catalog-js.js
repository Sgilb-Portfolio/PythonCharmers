import React, { useEffect, useState } from "react";
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
    const [showSearchHistory, setShowSearchHistory] = useState(false);
    const [cart, setCart] = useState([]);

    const saveSearchHistory = (term) => {
        if (!term) return;
        
        let history = JSON.parse(localStorage.getItem("searchHistory")) || [];
        if (!history.includes(term)) {
            history.push(term);
            if (history.length > 5) {
                history.shift();  // Keep the last 5 searches
            }
            localStorage.setItem("searchHistory", JSON.stringify(history));
            setSearchHistory(history);
        }
    };
    
    const fetchData = () => {
        if (!searchTerm) return;
        
        setLoading(true);
        fetch(`http://localhost:8000/api/itunes-search/?term=${searchTerm}&media=${mediaType}&limit=${itemsPerPage}`)
        .then(response => response.json())
            .then(data => {
                if (data.results) {
                    setItems(data.results);
                    setError(null);
                } else {
                    setError("No results found");
                    setItems([]);
                }
                setLoading(false);
            })
            .catch(() => {
                setError("Failed to fetch data");
                setLoading(false);
            });
    };

    useEffect(() => {
        document.title = "Store | Driver Incentive Program";
        
        const history = JSON.parse(localStorage.getItem("searchHistory")) || [];
        setSearchHistory(history);
        
        const savedCart = JSON.parse(localStorage.getItem("cart")) || [];
        setCart(savedCart);
    }, []);

    const handleHistorySelect = (term) => {
        setSearchTerm(term);
        setShowSearchHistory(false);
        setTimeout(() => {
            fetchData();
        }, 100);
    };

    const handleItemsPerPageChange = (e) => {
        setItemsPerPage(parseInt(e.target.value));
    };

    const handleSearchButtonClick = () => {
        if (searchTerm) {
            fetchData();
            saveSearchHistory(searchTerm);
            setShowSearchHistory(false);
        }
    };

    const handleSearchInputChange = (e) => {
        setSearchTerm(e.target.value);
        if (e.target.value && searchHistory.length > 0) {
            setShowSearchHistory(true);
        } else {
            setShowSearchHistory(false);
        }
    };

    const handleSearchKeyPress = (e) => {
        if (e.key === 'Enter') {
            handleSearchButtonClick();
        }
    };

    const addToCart = (item) => {
        let updatedCart = [...cart];
        const existingItem = updatedCart.find(cartItem => cartItem.name === item.name);

        if (existingItem) {
            updatedCart = updatedCart.map(cartItem =>
                cartItem.name === item.name
                    ? { ...cartItem, quantity: cartItem.quantity + 1 }
                    : cartItem
            );
        } else {
            updatedCart.push({ ...item, quantity: 1 });
        }

        localStorage.setItem("cart", JSON.stringify(updatedCart));
        setCart(updatedCart);
    };

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
        maxWidth: "1200px",
        margin: "0 auto",
        width: "100%"
    };

    const pageTitle = {
        fontSize: "36px",
        color: "#333333",
        marginBottom: "30px",
        textAlign: "center"
    };

    const searchContainer = {
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        marginBottom: "30px",
        position: "relative"
    };

    const searchInputContainer = {
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        width: "100%",
        maxWidth: "600px"
    };

    const inputStyle = {
        padding: "12px",
        fontSize: "16px",
        borderRadius: "5px",
        border: "1px solid #ddd",
        width: "300px",
        marginRight: "10px"
    };

    const buttonStyle = {
        padding: "12px 20px",
        fontSize: "16px",
        backgroundColor: "#4CAF50",
        color: "white",
        border: "none",
        borderRadius: "5px",
        cursor: "pointer",
        fontWeight: "600",
        transition: "background-color 0.3s ease"
    };
    
    const selectStyle = {
        padding: "10px",
        fontSize: "16px",
        borderRadius: "5px",
        border: "1px solid #ddd",
        marginRight: "10px",
        marginBottom: "10px",
        backgroundColor: "white"
    };

    const searchHistoryContainer = {
        position: "absolute",
        top: "100%",
        width: "300px",
        backgroundColor: "#fff",
        border: "1px solid #ddd",
        maxHeight: "200px",
        overflowY: "auto",
        zIndex: 10,
        borderRadius: "5px",
        boxShadow: "0 8px 16px rgba(0,0,0,0.1)"
    };

    const searchHistoryItem = {
        padding: "10px",
        cursor: "pointer",
        borderBottom: "1px solid #ddd",
        transition: "background-color 0.2s"
    };

    const filterContainer = {
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        marginBottom: "20px",
        flexWrap: "wrap"
    };

    const productGrid = {
        display: "flex",
        flexWrap: "wrap",
        justifyContent: "center",
        gap: "20px",
        marginBottom: "30px"
    };

    const productCard = {
        border: "1px solid #ddd",
        borderRadius: "8px",
        padding: "15px",
        width: "250px",
        backgroundColor: "#fff",
        boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
        transition: "transform 0.2s, box-shadow 0.2s"
    };

    const productCardHover = {
        ...productCard,
        transform: "translateY(-5px)",
        boxShadow: "0 5px 15px rgba(0,0,0,0.15)"
    };

    const productImage = {
        width: "100%",
        height: "auto",
        marginBottom: "10px",
        borderRadius: "4px"
    };

    const productTitle = {
        fontSize: "18px",
        fontWeight: "bold",
        marginBottom: "5px",
        color: "#333333"
    };

    const productDetail = {
        fontSize: "14px",
        color: "#666666",
        margin: "5px 0"
    };

    const productPrice = {
        fontSize: "16px",
        fontWeight: "bold",
        color: "#F56600",
        margin: "10px 0"
    };

    const addToCartButton = {
        width: "100%",
        padding: "10px",
        backgroundColor: "#007bff",
        color: "white",
        border: "none",
        borderRadius: "5px",
        cursor: "pointer",
        fontWeight: "600",
        transition: "background-color 0.3s"
    };

    const loadingMessage = {
        textAlign: "center",
        padding: "20px",
        fontSize: "18px",
        color: "#666666"
    };

    const errorMessage = {
        textAlign: "center",
        padding: "20px",
        fontSize: "18px",
        color: "#d9534f"
    };

    return (
        <div style={pageContainer}>
            <Header />
            
            <main style={mainContent}>
                <h1 style={pageTitle}>Store (iTunes)</h1>

                <div style={searchContainer}>
                    <div style={searchInputContainer}>
                        <input
                            type="text"
                            value={searchTerm}
                            onChange={handleSearchInputChange}
                            onKeyPress={handleSearchKeyPress}
                            placeholder="Search for products"
                            style={inputStyle}
                            onFocus={() => {
                                if (searchTerm && searchHistory.length > 0) {
                                    setShowSearchHistory(true);
                                }
                            }}
                            onBlur={() => {
                                // Delayed to allow clicking on search history items
                                setTimeout(() => setShowSearchHistory(false), 200);
                            }}
                        />
                        <button 
                            onClick={handleSearchButtonClick}
                            style={buttonStyle}
                            onMouseEnter={(e) => e.target.style.backgroundColor = "#45a049"}
                            onMouseLeave={(e) => e.target.style.backgroundColor = "#4CAF50"}
                        >
                            Search
                        </button>
                    </div>

                    {showSearchHistory && searchHistory.length > 0 && (
                        <div style={searchHistoryContainer}>
                            {searchHistory.map((term, index) => (
                                <div
                                    key={index}
                                    onClick={() => handleHistorySelect(term)}
                                    style={searchHistoryItem}
                                    onMouseEnter={(e) => e.target.style.backgroundColor = "#f5f5f5"}
                                    onMouseLeave={(e) => e.target.style.backgroundColor = "#fff"}
                                >
                                    {term}
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                <div style={filterContainer}>
                    <select 
                        value={mediaType} 
                        onChange={(e) => setMediaType(e.target.value)}
                        style={selectStyle}
                    >
                        <option value="music">Music</option>
                        <option value="movie">Movie</option>
                        <option value="podcast">Podcast</option>
                        <option value="ebook">E-Book</option>
                    </select>

                    <select 
                        value={itemsPerPage} 
                        onChange={handleItemsPerPageChange}
                        style={selectStyle}
                    >
                        <option value={5}>5 items per page</option>
                        <option value={10}>10 items per page</option>
                        <option value={20}>20 items per page</option>
                        <option value={50}>50 items per page</option>
                    </select>
                </div>

                {loading && <p style={loadingMessage}>Loading...</p>}
                {error && <p style={errorMessage}>{error}</p>}

                {!loading && !error && items.length === 0 && (
                    <p style={{ textAlign: "center", padding: "20px" }}>
                        {searchTerm 
                            ? "No results found. Try a different search term." 
                            : "Enter a search term to start browsing products."}
                    </p>
                )}

                <div style={productGrid}>
                    {items.map((item, index) => (
                        <div 
                            key={index} 
                            style={productCard}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.transform = "translateY(-5px)";
                                e.currentTarget.style.boxShadow = "0 5px 15px rgba(0,0,0,0.15)";
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.transform = "none";
                                e.currentTarget.style.boxShadow = "0 2px 8px rgba(0,0,0,0.1)";
                            }}
                        >
                            <img src={item.image} alt={item.name} style={productImage} />
                            <h3 style={productTitle}>{item.name}</h3>
                            <p style={productDetail}>Creator: {item.creator}</p>
                            <p style={productDetail}>Type: {item.type}</p>
                            <p style={productPrice}>{(item.price * 100).toFixed(0)} Points</p>
                            <p style={productDetail}>Availability: {item.availability}</p>
                            <button 
                                onClick={() => addToCart(item)} 
                                style={addToCartButton}
                                onMouseEnter={(e) => e.target.style.backgroundColor = "#0069d9"}
                                onMouseLeave={(e) => e.target.style.backgroundColor = "#007bff"}
                            >
                                Add to Cart
                            </button>
                        </div>
                    ))}
                </div>