import React from "react";
import { Navigate } from "react-router-dom";
import { useViewAs } from "../components/ViewAsContext";

const RoleProtection = ({ children, allowedRoles }) => {
    const { viewAsRole } = useViewAs();
    const userRole = localStorage.getItem("userRole");
    const effectiveRole = viewAsRole || userRole;

    if (!allowedRoles.includes(effectiveRole)) {
        return <Navigate to="/" />;
    }

    return children;
};

export default RoleProtection;
