import React from "react";
import { Navigate } from "react-router-dom";

const RoleProtection = ({ children, allowedRoles }) => {
    const userRole = localStorage.getItem("userRole");

    if (!allowedRoles.includes(userRole)) {
        return <Navigate to="/" />;
    }

    return children;
};

export default RoleProtection;