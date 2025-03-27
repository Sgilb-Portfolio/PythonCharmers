import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import ebayLogo from "../images/ebay.png";
import cushionImg from "../images/seatcushion.jpg";
import dashCamImg from "../images/dashcam.jpg";
import cbRadioImg from "../images/cbradio.jpg";
import fridgeImg from "../images/truckfridge.jpg";
import chargerImg from "../images/truckphonecharger.jpg";

function Catalog() {
    const [sortBy, setSortBy] = useState("name");
    const [ascending, setAscending] = useState(true);
    const [hoveredItem, setHoveredItem] = useState(null);
    const [searchQuery, setSearchQuery] = useState("");
    const [searchHistory, setSearchHistory] = useState([]);
    const [showSearchHistory, setShowSearchHistory] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(3);
    
    const pageSizeOptions = [1, 3, 5, 10, 15, 20];

    const items = [
        { name: "Seat Cushion", points: 2000, image: cushionImg, description: "A comfortable seat cushion for long drives." },
        { name: "Dash Cam", points: 12000, image: dashCamImg, description: "High-resolution dash cam to record your trips." },
        { name: "CB Radio", points: 4000, image: cbRadioImg, description: "Reliable CB radio for truck communication." },
        { name: "Truck Mini Fridge", points: 15000, image: fridgeImg, description: "Compact fridge to keep your food and drinks cold." },
        { name: "Truck Phone Charger", points: 5000, image: chargerImg, description: "Fast-charging phone adapter for trucks." }
    ];

    // Handle search submission
    const handleSearch = () => {
        if (searchQuery.trim() !== "" && !searchHistory.includes(searchQuery)) {
            setSearchHistory(prev => [searchQuery, ...prev.slice(0, 4)]);
        }
    };

    // Handle search query change
    const handleSearchChange = (e) => {
        setSearchQuery(e.target.value);
        setShowSearchHistory(true);
    };

    // Handle search history item click
    const handleHistoryItemClick = (item) => {
        setSearchQuery(item);
        setShowSearchHistory(false);
    };

    // Handle items per page change
    const handleItemsPerPageChange = (newSize) => {
        setItemsPerPage(newSize);
        setCurrentPage(1); // Reset to first page when changing items per page
    };

    // Sort items
    const sortedItems = [...items].sort((a, b) => {
        if (sortBy === "name") {
            return ascending ? a.name.localeCompare(b.name) : b.name.localeCompare(a.name);
        } else {
            return ascending ? a.points - b.points : b.points - a.points;
        }
    });

    // Filter items based on search query
    const filteredItems = sortedItems.filter(item =>
        item.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    // Pagination logic
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = filteredItems.slice(indexOfFirstItem, indexOfLastItem);

    // Close search history dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = () => {
            setShowSearchHistory(false);
        };
        
        document.addEventListener('click', handleClickOutside);
        return () => {
            document.removeEventListener('click', handleClickOutside);
        };
    }, []);

    return (
        <div style={containerStyle}>
            <h1 style={titleStyle}>Catalog</h1>

            <Link to="/">
                <button style={buttonStyle}
                    onMouseEnter={(e) => e.target.style.backgroundColor = "#522D80"}
                    onMouseLeave={(e) => e.target.style.backgroundColor = "#F56600"}>
                    Home
                </button>
            </Link>

            <br />
            <div style={catalogContainerStyle}>
                <h2>Products</h2>
                <img src={ebayLogo} alt="ebay" style={logoStyle} />

                {/* Search Bar with History */}
                <div style={searchContainerStyle} onClick={(e) => e.stopPropagation()}>
                    <div style={searchInputContainerStyle}>
                        <input 
                            type="text" 
                            placeholder="Search products..." 
                            value={searchQuery} 
                            onChange={handleSearchChange}
                            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                            onClick={(e) => {
                                e.stopPropagation();
                                setShowSearchHistory(true);
                            }}
                            style={searchStyle}
                        />
                        <button 
                            onClick={() => {
                                handleSearch();
                                setShowSearchHistory(false);
                            }}
                            style={searchButtonStyle}
                            onMouseEnter={(e) => e.target.style.backgroundColor = "#522D80"}
                            onMouseLeave={(e) => e.target.style.backgroundColor = "#F56600"}
                        >
                            Search
                        </button>
                    </div>
                    
                    {showSearchHistory && searchHistory.length > 0 && (
                        <div style={searchHistoryContainerStyle}>
                            {searchHistory.map((item, index) => (
                                <div 
                                    key={index} 
                                    style={searchHistoryItemStyle}
                                    onMouseEnter={(e) => e.target.style.backgroundColor = "#f0f0f0"}
                                    onMouseLeave={(e) => e.target.style.backgroundColor = "#ffffff"}
                                >
                                    <span 
                                        style={searchHistoryTextStyle}
                                        onClick={() => handleHistoryItemClick(item)}
                                    >
                                        {item}
                                    </span>
                                    <button 
                                        style={deleteHistoryButtonStyle}
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setSearchHistory(prev => prev.filter((_, i) => i !== index));
                                        }}
                                        onMouseEnter={(e) => e.target.style.color = "#F56600"}
                                        onMouseLeave={(e) => e.target.style.color = "#999"}
                                    >
                                        ×
                                    </button>
                                </div>
                            ))}
                            {searchHistory.length > 0 && (
                                <div style={clearHistoryContainerStyle}>
                                    <button 
                                        style={clearHistoryButtonStyle}
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setSearchHistory([]);
                                        }}
                                        onMouseEnter={(e) => e.target.style.backgroundColor = "#522D80"}
                                        onMouseLeave={(e) => e.target.style.backgroundColor = "#F56600"}
                                    >
                                        Clear All History
                                    </button>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Items Per Page Selector */}
                <div style={itemsPerPageContainerStyle}>
                    <span style={itemsPerPageLabelStyle}>Items per page: </span>
                    {pageSizeOptions.map(size => (
                        <button 
                            key={size}
                            onClick={() => handleItemsPerPageChange(size)}
                            style={{
                                ...pageSizeButtonStyle,
                                backgroundColor: itemsPerPage === size ? "#522D80" : "#F56600"
                            }}
                            onMouseEnter={(e) => {
                                if (itemsPerPage !== size) {
                                    e.target.style.backgroundColor = "#522D80";
                                }
                            }}
                            onMouseLeave={(e) => {
                                if (itemsPerPage !== size) {
                                    e.target.style.backgroundColor = "#F56600";
                                }
                            }}
                        >
                            {size}
                        </button>
                    ))}
                </div>

                {/* Sorting Buttons */}
                <div style={sortButtonContainer}>
                    <button 
                        style={buttonStyle} 
                        onClick={() => { setSortBy("name"); setAscending(true); }}
                        onMouseEnter={(e) => e.target.style.backgroundColor = "#522D80"}
                        onMouseLeave={(e) => e.target.style.backgroundColor = "#F56600"}
                    >
                        Sort by Name ⬆️
                    </button>
                    <button 
                        style={buttonStyle} 
                        onClick={() => { setSortBy("points"); setAscending(true); }}
                        onMouseEnter={(e) => e.target.style.backgroundColor = "#522D80"}
                        onMouseLeave={(e) => e.target.style.backgroundColor = "#F56600"}
                    >
                        Sort by Points ⬆️
                    </button>
                    <button 
                        style={buttonStyle} 
                        onClick={() => { setSortBy("name"); setAscending(false); }}
                        onMouseEnter={(e) => e.target.style.backgroundColor = "#522D80"}
                        onMouseLeave={(e) => e.target.style.backgroundColor = "#F56600"}
                    >
                        Sort by Name ⬇️
                    </button>
                    <button 
                        style={buttonStyle} 
                        onClick={() => { setSortBy("points"); setAscending(false); }}
                        onMouseEnter={(e) => e.target.style.backgroundColor = "#522D80"}
                        onMouseLeave={(e) => e.target.style.backgroundColor = "#F56600"}
                    >
                        Sort by Points ⬇️
                    </button>
                </div>

                {/* Items Table */}
                <table style={tableStyle}>
                    <thead>
                        <tr style={headerRowStyle}>
                            <th style={tableHeaderStyle}>Picture</th>
                            <th style={tableHeaderStyle}>Product Name</th>
                            <th style={tableHeaderStyle}>Points</th>
                        </tr>
                    </thead>
                    <tbody>
                        {currentItems.map((item, index) => (
                            <tr key={index} style={rowStyle(index)}>
                                <td style={tableCellStyle}>
                                    <img src={item.image} alt={item.name} style={imageStyle} />
                                </td>
                                <td 
                                    style={tableCellStyle}
                                    onMouseEnter={() => setHoveredItem(index)}
                                    onMouseLeave={() => setHoveredItem(null)}
                                >
                                    {item.name}
                                    {hoveredItem === index && (
                                        <div style={tooltipStyle}>{item.description}</div>
                                    )}
                                </td>
                                <td style={tableCellStyle}><strong>{item.points} pts</strong></td>
                            </tr>
                        ))}
                    </tbody>
                </table>

                {/* Pagination Controls */}
                <div style={paginationStyle}>
                    <button 
                        onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))} 
                        disabled={currentPage === 1}
                        style={{
                            ...buttonStyle,
                            backgroundColor: currentPage === 1 ? "#999999" : "#F56600", // Grey for disabled, orange for enabled
                            cursor: currentPage === 1 ? "not-allowed" : "pointer"
                        }}
                        onMouseEnter={(e) => !e.target.disabled && (e.target.style.backgroundColor = "#522D80")}
                        onMouseLeave={(e) => !e.target.disabled && (e.target.style.backgroundColor = "#F56600")}
                    >
                        Previous
                    </button>
                    <span style={pageTextStyle}>Page {currentPage} of {Math.max(1, Math.ceil(filteredItems.length / itemsPerPage))}</span>
                    <button 
                        onClick={() => setCurrentPage(prev => Math.min(prev + 1, Math.ceil(filteredItems.length / itemsPerPage)))} 
                        disabled={currentPage === Math.ceil(filteredItems.length / itemsPerPage) || filteredItems.length === 0}
                        style={{
                            ...buttonStyle,
                            backgroundColor: (currentPage === Math.ceil(filteredItems.length / itemsPerPage) || filteredItems.length === 0) ? "#999999" : "#F56600", // Grey for disabled, orange for enabled
                            cursor: (currentPage === Math.ceil(filteredItems.length / itemsPerPage) || filteredItems.length === 0) ? "not-allowed" : "pointer"
                        }}
                        onMouseEnter={(e) => !e.target.disabled && (e.target.style.backgroundColor = "#522D80")}
                        onMouseLeave={(e) => !e.target.disabled && (e.target.style.backgroundColor = "#F56600")}
                    >
                        Next
                    </button>
                </div>
            </div>
        </div>
    );
}

// Styles
const containerStyle = { display: "flex", flexDirection: "column", alignItems: "center", minHeight: "100vh", backgroundColor: "#ffffff" };
const titleStyle = { fontSize: "60px", color: "#333333", marginBottom: "20px" };
const catalogContainerStyle = { backgroundColor: "#FFFFFF", padding: "30px", borderRadius: "5px", boxShadow: "0px 4px 10px rgba(245, 102, 0, 1)", width: "600px", textAlign: "center" };
const logoStyle = { position: "absolute", top: "10px", left: "10px", width: "150px", height: "auto" };
const sortButtonContainer = { display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "10px", marginBottom: "15px", textAlign: "center" };
const tableStyle = { width: "100%", borderCollapse: "collapse", marginTop: "20px" };
const headerRowStyle = { backgroundColor: "#F56600", color: "#fff", textAlign: "center" };
const tableHeaderStyle = { padding: "12px", fontSize: "18px", borderBottom: "2px solid #fff", textAlign: "center" };
const tableCellStyle = { padding: "12px", fontSize: "16px", textAlign: "center", position: "relative" };
const imageStyle = { width: "70px", height: "70px", objectFit: "cover" };
const rowStyle = (index) => ({ borderBottom: "1px solid #ddd", backgroundColor: index % 2 === 0 ? "#f9f9f9" : "#fff" });
const buttonStyle = { backgroundColor: "#F56600", color: "#FFFFFF", border: "none", fontSize: "18px", borderRadius: "5px", padding: "10px 15px", cursor: "pointer", transition: "background-color 0.3s ease" };
const tooltipStyle = { position: "absolute", bottom: "-30px", left: "50%", transform: "translateX(-50%)", backgroundColor: "#333", color: "#fff", padding: "5px 10px", borderRadius: "5px", fontSize: "14px", whiteSpace: "nowrap", zIndex: 1 };

// Search-related styles
const searchContainerStyle = { position: "relative", width: "100%", marginBottom: "15px" };
const searchInputContainerStyle = { display: "flex", width: "100%" };
const searchStyle = { padding: "10px", fontSize: "16px", width: "80%", border: "1px solid #ccc", borderRadius: "5px 0 0 5px" };
const searchButtonStyle = { ...buttonStyle, borderRadius: "0 5px 5px 0", padding: "10px", width: "20%" };
const searchHistoryContainerStyle = { position: "absolute", width: "80%", maxHeight: "150px", overflowY: "auto", backgroundColor: "#fff", border: "1px solid #ccc", borderTop: "none", borderRadius: "0 0 5px 5px", zIndex: 5 };
const searchHistoryItemStyle = { display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 10px", textAlign: "left", transition: "background-color 0.2s ease" };
const searchHistoryTextStyle = { cursor: "pointer", flex: 1 };
const deleteHistoryButtonStyle = { backgroundColor: "transparent", border: "none", color: "#999", fontSize: "18px", fontWeight: "bold", cursor: "pointer", marginLeft: "5px", padding: "0 5px" };
const clearHistoryContainerStyle = { padding: "8px 10px", borderTop: "1px solid #eee", textAlign: "center" };
const clearHistoryButtonStyle = { ...buttonStyle, fontSize: "12px", padding: "5px 10px" };

// Items per page styles
const itemsPerPageContainerStyle = { display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "15px", gap: "5px", flexWrap: "wrap" };
const itemsPerPageLabelStyle = { fontWeight: "bold", marginRight: "5px" };
const pageSizeButtonStyle = { ...buttonStyle, padding: "5px 10px", fontSize: "14px", minWidth: "30px" };

const paginationStyle = { marginTop: "15px", display: "flex", justifyContent: "center", alignItems: "center", gap: "10px" };
const pageTextStyle = { fontSize: "16px", fontWeight: "bold" };

export default Catalog;