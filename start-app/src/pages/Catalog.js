import React, { useEffect, useState } from "react";
import Header from "../components/Header";
import Footer from "../components/Footer";

function Catalog() {
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState();
    const [mediaType, setMediaType] = useState("movie");
    const [itemsPerPage, setItemsPerPage] = useState(10);
    const [searchHistory, setSearchHistory] = useState([]);
    const [cart, setCart] = useState([]);
    const [sponsors, setSponsors] = useState([]);
    const [selectedCatalog, setSelectedCatalog] = useState(null);
    const [loadingCatalogs, setLoadingCatalogs] = useState(true);
    const user = localStorage.getItem("user");
    const [currSponsor, setCurrSponsor] = useState(null);

    const saveSearchHistory = (term) => {
        let history = JSON.parse(localStorage.getItem("searchHistory")) || [];
        if (!history.includes(term)) {
            history.push(term);
            if (history.length > 5) {
                history.shift();
            }
            localStorage.setItem("searchHistory", JSON.stringify(history));
        }
    };

    const fetchSponsors = async () => {
        const token = localStorage.getItem("IdToken");
        const user = localStorage.getItem("user");
    
        if (!token || !user) {
            alert("You must be logged in to view sponsor catalogs."); 
            return;
        }
    
        try {
            //const response = await fetch(`http://localhost:8000/api/get-driver-sponsors/?username=${user}`, {
            const response = await fetch(`http://44.202.51.190:8000/api/get-driver-sponsors/?username=${user}`, {
                headers: {
                    "Authorization": `Bearer ${token}`,
                },
            });
    
            const data = await response.json();
    
            if (response.ok) {
                if (Array.isArray(data)) {
                    setSponsors(data);
                } else {
                    setError("Unexpected response format.");
                }
                setLoadingCatalogs(false);
            } else {
                setError(data.error || "Failed to load sponsor catalogs.");
                setLoadingCatalogs(false);
            }
        } catch (error) {
            console.error("Network error:", error);
            setError("Failed to load sponsor catalogs.");
            setLoadingCatalogs(false);
        }
    };
    
    const fetchCatalogItems = async (catalogId) => {
        setLoading(true);

        try {
            //const response = await fetch(`http://localhost:8000/api/get-sponsor-catalog-items/${catalogId}/`, {
            const response = await fetch(`http://44.202.51.190:8000/api/get-sponsor-catalog-items/${catalogId}/`, {
                headers: {
                    "Authorization": `Bearer ${localStorage.getItem("IdToken")}`,
                },
            });
            const data = await response.json();
            if (data.items) {
                setItems(data.items);
                setCurrSponsor(catalogId);
                setError(null);
            } else {
                setError("No items found.");
            }
            setLoading(false);
        } catch (error) {
            setError("Failed to fetch catalog items.");
            setLoading(false);
        }
    };

    useEffect(() => {
        const history = JSON.parse(localStorage.getItem("searchHistory")) || [];
        setSearchHistory(history);
        fetchSponsors();
        const savedCart = JSON.parse(localStorage.getItem("cart")) || [];
        setCart(savedCart);
    }, []);

    useEffect(() => {
        if (selectedCatalog) {
            fetchCatalogItems(selectedCatalog);
        }
    }, [selectedCatalog]);

    const handleHistorySelect = (term) => {
        setSearchTerm(term);
        saveSearchHistory(term);
    };

    const handleItemsPerPageChange = (e) => {
        setItemsPerPage(e.target.value);
    };

    const handleSearchButtonClick = () => {
        if (selectedCatalog) {
            fetchCatalogItems(selectedCatalog);
            saveSearchHistory(searchTerm);
        }
    };

    const addToCart = async (item) => {
    
        if (!user) {
            alert("You must be logged in to add items to the cart.");
            return;
        }
    
        // Create the cart item payload
        const cartItem = {
            account_username: user,
            sponsor_id: currSponsor,
            catalog_item_id: item.item_id,
            cart_item_quantity: 1,
        };
    
        try {
            //const response = await fetch("http://localhost:8000/api/add-to-cart/", {
            const response = await fetch("http://44.202.51.190:8000/api/add-to-cart/", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${localStorage.getItem("IdToken")}`,
                },
                body: JSON.stringify(cartItem),
            });
    
            const data = await response.json();
    
            if (response.ok) {
                setCart((prevCart) => {
                    const updatedCart = [...prevCart];
                    const existingItem = updatedCart.find(cartItem => cartItem.catalog_item_id === item.item_id);
                    if (existingItem) {
                        updatedCart.map(cartItem =>
                            cartItem.catalog_item_id === item.item_id
                                ? { ...cartItem, quantity: cartItem.quantity + 1 }
                                : cartItem
                        );
                    } else {
                        updatedCart.push({ ...cartItem, quantity: 1 });
                    }
                    localStorage.setItem("cart", JSON.stringify(updatedCart));
                    return updatedCart;
                });
    
                alert("Item added to cart.");
            } else {
                alert("Failed to add item to cart. Please try again.");
            }
        } catch (error) {
            console.error("Error adding item to cart:", error);
            alert("An error occurred while adding the item to the cart.");
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
                {!selectedCatalog ? (
                    <>
                        <h1 style={{ fontSize: "36px", marginBottom: "20px" }}>Select a Sponsor Catalog</h1>
                        {loadingCatalogs ? (
                            <p>Loading catalogs...</p>
                        ) : error ? (
                            <p>{error}</p>
                        ) : sponsors.length === 0 ? (
                            <p>No sponsors available.</p>
                        ) : (
                            <ul style={{ listStyle: "none", padding: 0 }}>
                                {sponsors.map((sponsor) => (
                                    <li key={sponsor.sponsor_id} style={{ marginBottom: "10px" }}>
                                        <button
                                            onClick={() => setSelectedCatalog(sponsor.sponsor_id)}
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
                        <h1 style={{ fontSize: "36px", color: "#333", marginBottom: "20px" }}>
                            Catalog for Sponsor
                        </h1>

                        {/* Search Input */}
                        <div style={{
                            display: "flex",
                            flexDirection: "column",
                            alignItems: "center",
                            marginBottom: "20px",
                            position: "relative"
                        }}>
                            <div style={{ display: "flex" }}>
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
                                        width: "300px",
                                        marginRight: "10px",
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
                                    }}
                                >
                                    Search
                                </button>
                            </div>

                            {/* Search History */}
                            {searchTerm && searchHistory.length > 0 && (
                                <ul style={{
                                    position: "absolute",
                                    top: "100%",
                                    left: "0",
                                    width: "300px",
                                    backgroundColor: "#fff",
                                    border: "1px solid #ddd",
                                    maxHeight: "200px",
                                    overflowY: "auto",
                                    margin: "0",
                                    padding: "0",
                                    boxShadow: "0 8px 16px rgba(0,0,0,0.1)",
                                    zIndex: 2
                                }}>
                                    {searchHistory.map((term, index) => (
                                        <li
                                            key={index}
                                            onClick={() => handleHistorySelect(term)}
                                            style={{
                                                padding: "10px",
                                                cursor: "pointer",
                                                borderBottom: "1px solid #ddd"
                                            }}
                                        >
                                            {term}
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </div>

                        {/* Media Type Dropdown */}
                        <select value={mediaType} onChange={(e) => setMediaType(e.target.value)} style={{
                            padding: "8px",
                            marginBottom: "20px",
                            fontSize: "16px"
                        }}>
                            <option value="music">Music</option>
                            <option value="movie">Movie</option>
                            <option value="podcast">Podcast</option>
                            <option value="ebook">E-Book</option>
                        </select>

                        {/* Catalog Items Grid */}
                        {loading ? (
                            <p>Loading catalog items...</p>
                        ) : error ? (
                            <p>{error}</p>
                        ) : (
                            <div style={{
                                display: "flex",
                                flexWrap: "wrap",
                                justifyContent: "center",
                                gap: "20px",
                                width: "100%"
                            }}>
                                {items.map((item) => (
                                    <div key={item.item_id} style={{
                                        border: "1px solid #ddd",
                                        backgroundColor: "#fff",
                                        borderRadius: "8px",
                                        padding: "16px",
                                        width: "250px",
                                        boxShadow: "0 4px 12px rgba(0, 0, 0, 0.05)"
                                    }}>
                                        <img src={item.image} alt={item.name} style={{ width: "100%", borderRadius: "6px" }} />
                                        <h3>{item.name}</h3>
                                        <p><strong>Creator:</strong> {item.creator}</p>
                                        <p><strong>Type:</strong> {item.type}</p>
                                        <p><strong>Price:</strong> {(item.price * 100).toFixed(0)} Points</p>
                                        <p><strong>Availability:</strong> {item.availability}</p>
                                        <button onClick={() => addToCart(item)} style={{
                                            padding: "10px 15px",
                                            marginTop: "10px",
                                            backgroundColor: "#007bff",
                                            color: "white",
                                            border: "none",
                                            borderRadius: "4px",
                                            cursor: "pointer"
                                        }}>
                                            Add to Cart
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </>
                )}
            </main>

            <Footer />
        </div>
    );
}

export default Catalog;
