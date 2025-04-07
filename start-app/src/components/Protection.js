import React from "react";
import { Navigate } from "react-router-dom";

const Protection = ({ children }) => {
  const isLoggedIn = !!localStorage.getItem("IdToken");

  return isLoggedIn ? children : <Navigate to="/" />;
};

export default Protection;