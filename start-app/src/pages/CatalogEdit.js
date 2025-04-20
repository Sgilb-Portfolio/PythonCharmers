import React, { useEffect, useState } from "react";
import Header from "../components/Header";
import Footer from "../components/Footer";

function CatalogEdit() {
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState();
    const [mediaType, setMediaType] = useState("movie");
    const [itemsPerPage, setItemsPerPage] = useState(10);
    const [searchHistory, setSearchHistory] = useState([]);
    const [cart, setCart] = useState([]);
    const user = localStorage.getItem("user");

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
        setLoading(true);
        fetch(`http://44.202.51.190:8000/api/itunes-search/?term=${searchTerm}&media=${mediaType}&limit=${itemsPerPage}`)
        //fetch(`http://localhost:8000/api/itunes-search/?term=${searchTerm}&media=${mediaType}&limit=${itemsPerPage}`)
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
        fetchData();
        saveSearchHistory(searchTerm);
    };

    const saveToSponsorCatalog = async (item) => {
        console.log("Saving item to sponsor catalog:", item);
    
        const token = localStorage.getItem("IdToken");
        if (!token) {
            alert("You must be logged in to save catalog items.");
            return;
        }
        const availability = item.availability && item.availability.toLowerCase() === "available" ? true : false;
    
        try {
            //const response = await fetch("http://localhost:8000/api/sponsor-catalog-add/", {
            const response = await fetch("http://44.202.51.190:8000/api/sponsor-catalog-add/", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({
                    username: user,
                    name: item.name,
                    creator: item.creator,
                    type: item.type,
                    price: item.price,
                    availability: availability,
                    image_url: item.image
                })
            });
    
            const data = await response.json();
    
            if (response.ok) {
                alert("Item added to sponsor catalog!");
            } else {
                console.error("Error:", data);
                alert("Failed to save item.");
            }
        } catch (error) {
            console.error("Network error:", error);
            alert("Network error occurred.");
        }
    };
    
    // Load cart from localStorage when component mounts
    useEffect(() => {
        const savedCart = JSON.parse(localStorage.getItem("cart")) || [];
        setCart(savedCart);
    }, []);

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
                            boxShadow: "0 8px 16px rgba(0,0,0,0.1)"
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

                {/* Media Type Select */}
                <select value={mediaType} onChange={(e) => setMediaType(e.target.value)}>
                    <option value="music">Music</option>
                    <option value="movie">Movie</option>
                    <option value="podcast">Podcast</option>
                    <option value="ebook">E-Book</option>
                </select>

                {/* Items Per Page Dropdown */}
                <select value={itemsPerPage} onChange={handleItemsPerPageChange}>
                    <option value={5}>5</option>
                    <option value={10}>10</option>
                    <option value={20}>20</option>
                    <option value={50}>50</option>
                </select>

                {/* Loading and Error Handling */}
                {loading && <p>Loading...</p>}
                {error && <p>{error}</p>}

                {/* Displaying Items */}
                <div style={{
                    display: "flex",
                    flexWrap: "wrap",
                    overflowY: "auto", // Enable vertical scrolling
                    maxHeight: "600px", // Set the max height for the items container
                    width: "100%",
                    paddingBottom: "20px", // Add padding to the bottom if needed
                }}>
                    {items.map((item, index) => (
                        <div key={index} style={{
                            border: "1px solid #ddd",
                            padding: "10px",
                            margin: "10px",
                            width: "250px",
                            boxSizing: "border-box", // Ensure padding and borders are included in width
                        }}>
                            <img src={item.image} alt={item.name} style={{ width: "100%" }} />
                            <h3>{item.name}</h3>
                            <p>Creator: {item.creator}</p>
                            <p>Type: {item.type}</p>
                            <p>Price: {(item.price * 100).toFixed(0)} Points</p>
                            <p>Availability: {item.availability}</p>
                            <button onClick={() => saveToSponsorCatalog(item)} style={{
                                padding: "8px 12px",
                                backgroundColor: "#007bff",
                                color: "white",
                                border: "none",
                                borderRadius: "4px",
                                cursor: "pointer",
                                marginTop: "10px"
                            }}>
                                Save to Sponsor Catalog
                            </button>
                        </div>
                    ))}
                </div>
            </main>
            <Footer />
        </div>
    );
}

export default CatalogEdit;
