import React, { useEffect } from "react";
import { Routes, Route, useNavigate } from "react-router-dom";
import Home from "./pages/Home";
import About from "./pages/About";
import Login from "./pages/Login";
import Create from "./pages/Create";
import Applications from "./pages/Applications";
import Help from "./pages/Help";
import ResetPassword from "./components/ResetPassword";
import AccountConfirmation from "./pages/AccountConfirmation";
import Points from "./pages/Points";
import Profile from "./pages/Profile";
import Catalog from "./pages/Catalog";
import ForgotPassword from "./pages/ForgotPassword";

function App() {
  const navigate = useNavigate();
  const INACTIVITY_LIMIT = 1 * 60 * 1000;
  let inactivityTimer;

  useEffect(() => {
    const resetInactivityTimer = () => {
        clearTimeout(inactivityTimer);
        inactivityTimer = setTimeout(() => {
            handleLogout();
        }, INACTIVITY_LIMIT);
    };

    const handleLogout = () => {
        console.log("User logged out due to inactivity");
        localStorage.removeItem("IdToken");
        localStorage.removeItem("AccessToken");
        localStorage.removeItem("RefreshToken");
        localStorage.removeItem("userType");
        navigate("/login");
    };

    window.addEventListener("mousemove", resetInactivityTimer);
    window.addEventListener("keydown", resetInactivityTimer);
    window.addEventListener("click", resetInactivityTimer);

    resetInactivityTimer();

    return () => {
        window.removeEventListener("mousemove", resetInactivityTimer);
        window.removeEventListener("keydown", resetInactivityTimer);
        window.removeEventListener("click", resetInactivityTimer);
        clearTimeout(inactivityTimer);
    };
}, [navigate]);

  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/about" element={<About />} />
      <Route path="/login" element={<Login />} />
      <Route path="/account-creation" element={<Create />} />
      <Route path="/applications" element={<Applications />} />
      <Route path="/help" element={<Help />} />
      <Route path="/reset-password" element={<ResetPassword />} />
      <Route path="/account-confirmation" element={<AccountConfirmation />} />
      <Route path="/profile" element={<Profile />} />
      <Route path="/points" element={<Points />} />
      <Route path="/catalog" element={<Catalog />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
    </Routes>
  );
}

export default App;
