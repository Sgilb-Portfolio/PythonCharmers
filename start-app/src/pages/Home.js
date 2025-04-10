import React, { useState, useEffect, use } from "react";
import { Link, useNavigate } from "react-router-dom";
import HomePage1 from "../images/HomePage1.jpg";
import HomePage2 from "../images/HomePage2.jpg";
import HomePage3 from "../images/HomePage3.jpg";
import { FaArrowRight, FaArrowLeft } from "react-icons/fa";
import Header from "../components/Header";
import Footer from "../components/Footer";
import axios from "axios";

function Home() {
    const images = [HomePage1, HomePage2, HomePage3];
    const [currentIndex, setCurrentIndex] = useState(0);
    const [userRole, setUserRole] = useState("");
    const idToken = localStorage.getItem("IdToken") || null;
    const username = localStorage.getItem("username");
    const navigate = useNavigate();

    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentIndex((prevIndex) => (prevIndex + 1) % images.length);
        }, 5000);
        return () => clearInterval(interval);
    }, [images.length]);

    useEffect(() => {
        if (username) {
            axios.get(`/api/get-user-role/${username}/`)
                .then((res) => {
                    setUserRole(res.data.role);
                })
                .catch((err) => {
                    console.error(err);
                });
        }
    }, [username]);

    const nextSlide = () => {
        setCurrentIndex((prevIndex) => (prevIndex + 1) % images.length);
    };

    const prevSlide = () => {
        setCurrentIndex((prevIndex) => (prevIndex - 1 + images.length) % images.length);
    };

    return (
        <div style={{
            minHeight: "100vh",
            fontFamily: "'Segoe UI', Roboto, 'Helvetica Neue', sans-serif",
            backgroundColor: "#f9f9f9",
            color: "#333",
            display: "flex",
            flexDirection: "column"
        }}>
            <Header />

            <main style={{ flex: "1" }}>
                {/* Hero Section */}
                <div style={{
                    padding: "60px 20px",
                    maxWidth: "1200px",
                    margin: "0 auto",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    textAlign: "center"
                }}>
                    <h2 style={{
                        fontSize: "42px",
                        fontWeight: "700",
                        color: "#333",
                        marginBottom: "20px",
                        maxWidth: "800px"
                    }}>
                        Welcome to the Driver Incentive Program
                    </h2>
                    <p style={{
                        fontSize: "18px",
                        color: "#666",
                        maxWidth: "600px",
                        lineHeight: "1.6",
                        marginBottom: "40px"
                    }}>
                        Rewarding safe driving practices and encouraging excellence on the road.
                        Join our community of professional drivers today.
                    </p>

                    <div style={{
                        display: "flex",
                        gap: "20px",
                        marginBottom: "50px"
                    }}>
                        {!idToken && (
                            <Link to="/login" style={{
                                padding: "14px 30px",
                                backgroundColor: "#F56600",
                                color: "white",
                                textDecoration: "none",
                                borderRadius: "30px",
                                fontWeight: "600",
                                boxShadow: "0 4px 10px rgba(245, 102, 0, 0.3)",
                                transition: "transform 0.2s, box-shadow 0.2s"
                            }}>
                                Login
                            </Link>
                        )}
                        {!idToken && (
                            <Link to="/account-creation" style={{
                                padding: "14px 30px",
                                backgroundColor: "white",
                                color: "#F56600",
                                textDecoration: "none",
                                borderRadius: "30px",
                                fontWeight: "600",
                                border: "2px solid #F56600",
                                transition: "background-color 0.2s, color 0.2s"
                            }}>
                                Create Account
                            </Link>
                        )}
                    </div>

                    {/* Carousel */}
                    <div style={{
                        width: "100%",
                        maxWidth: "800px",
                        margin: "0 auto",
                        position: "relative",
                        borderRadius: "12px",
                        overflow: "hidden",
                        boxShadow: "0 10px 30px rgba(0,0,0,0.15)"
                    }}>
                        <img
                            src={images[currentIndex]}
                            alt={`Slide ${currentIndex}`}
                            style={{
                                width: "100%",
                                height: "400px",
                                objectFit: "cover",
                                transition: "opacity 0.5s ease-in-out"
                            }}
                        />

                        <button
                            onClick={prevSlide}
                            style={{
                                position: "absolute",
                                left: "15px",
                                top: "50%",
                                transform: "translateY(-50%)",
                                backgroundColor: "rgba(255,255,255,0.7)",
                                border: "none",
                                borderRadius: "50%",
                                width: "40px",
                                height: "40px",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                cursor: "pointer",
                                zIndex: 2
                            }}
                        >
                            <FaArrowLeft color="#333" />
                        </button>

                        <button
                            onClick={nextSlide}
                            style={{
                                position: "absolute",
                                right: "15px",
                                top: "50%",
                                transform: "translateY(-50%)",
                                backgroundColor: "rgba(255,255,255,0.7)",
                                border: "none",
                                borderRadius: "50%",
                                width: "40px",
                                height: "40px",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                cursor: "pointer",
                                zIndex: 2
                            }}
                        >
                            <FaArrowRight color="#333" />
                        </button>

                        <div style={{
                            position: "absolute",
                            bottom: "15px",
                            left: "50%",
                            transform: "translateX(-50%)",
                            display: "flex",
                            gap: "8px"
                        }}>
                            {images.map((_, index) => (
                                <div
                                    key={index}
                                    style={{
                                        width: "10px",
                                        height: "10px",
                                        borderRadius: "50%",
                                        backgroundColor: index === currentIndex ? "#F56600" : "rgba(255,255,255,0.7)",
                                        cursor: "pointer"
                                    }}
                                    onClick={() => setCurrentIndex(index)}
                                />
                            ))}
                        </div>
                    </div>
                </div>

                {/* Help Link */}
                <div style={{
                    marginTop: "40px",
                    padding: "30px",
                    backgroundColor: "#f0f0f0",
                    borderTop: "1px solid #e0e0e0",
                    textAlign: "center"
                }}>
                    <Link to="/help" style={{
                        fontSize: "18px",
                        color: "#F56600",
                        textDecoration: "none",
                        fontWeight: "600",
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "8px",
                        padding: "10px 20px",
                        borderRadius: "30px",
                        backgroundColor: "white",
                        boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                        transition: "transform 0.2s, box-shadow 0.2s"
                    }}>
                        Need help? Visit our Help & Support Page
                        <FaArrowRight size={14} />
                    </Link>
                </div>
                {idToken && (userRole === 'Sponsor' || userRole === 'Admin') && (
                <div style={{ textAlign: "center", marginTop: "40px" }}>
                    <Link to="/audit-logs" style={{
                        padding: "14px 30px",
                        backgroundColor: "#F56600",
                        color: "white",
                        textDecoration: "none",
                        borderRadius: "30px",
                        fontWeight: "600",
                        boxShadow: "0 4px 10px rgba(245, 102, 0, 0.3)",
                        transition: "transform 0.2s, box-shadow 0.2s"
                    }}>
                        View Audit Log Reports
                    </Link>
                </div>
            )}
            </main>

            <Footer />
        </div>
    );
}

export default Home;
