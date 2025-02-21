import React from "react";

const CheckBox = ({ label, onChange }) => {
    const handleCheckBoxChange = (e) => {
        onChange && onChange(e);
    };

    return (
        <div className="remember-forgot" 
        style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            fontSize: "14px",
            marginBottom: "10px"
        }}>
            <label style={{
                color: "#333333",
                display: "flex",
                alignItems: "center",
                gap: "1px",
                cursor: "pointer",
            }}>
                <input 
                    type="checkbox" 
                    style={{
                        width: "16px",
                        height: "16px", 
                        border: "2px solid #333333",
                        borderRadius: "3px",
                        outline: "none",
                        cursor: "pointer",
                        accentColor: "#522D80" // This controls the color when checked
                    }}
                    onChange={handleCheckBoxChange}
                />
                {label}
            </label>

            <button 
                style={{ 
                    color: "#F56600", 
                    textDecoration: "none", 
                    background: "none", 
                    border: "none", 
                    padding: "0", 
                    cursor: "pointer"
                }}
                onClick={(e) => e.preventDefault()} // Prevent default action for the button (optional)
            >
                Forgot Password?
            </button>
        </div>
    );
};

export default CheckBox;