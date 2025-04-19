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
import Cart from "./pages/Cart";
import Purchase from "./pages/Purchase";
import RoleProtection from "./components/RoleProtection";
import Protection from "./components/Protection";
import AuditLogs from "./pages/AuditLogs";
import SponsorApplications from "./pages/SponsorApplications";
import SponsorEdit from "./pages/SponsorEdit";
import DriverSponsors from "./pages/DriverSponsors";

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
      <Route path="/about" element={<Protection><About /></Protection>} />
      <Route path="/login" element={<Login />} />
      <Route path="/account-creation" element={<Create />} />
      <Route path="/applications" element={<Protection><Applications /></Protection>} />
      <Route path="/help" element={<Help />} />
      <Route path="/reset-password" element={<ResetPassword />} />
      <Route path="/account-confirmation" element={<AccountConfirmation />} />
      <Route path="/profile" element={<Protection><Profile /></Protection>} />
      <Route path="/points" element={<RoleProtection allowedRoles={["admin","sponsor"]}><Points /></RoleProtection>} />
      <Route path="/catalog" element={<Protection><Catalog /></Protection>} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/cart" element={<Protection><Cart /></Protection>} />
      <Route path="/purchase" element={<Protection><Purchase /></Protection>} />
      <Route path="/audit-logs" element={<RoleProtection allowedRoles={["admin"]}><AuditLogs /></RoleProtection>}/>
      <Route path="/sponsor-applications" element={<RoleProtection allowedRoles={["admin","sponsor"]}><SponsorApplications /></RoleProtection>} />
      <Route path="/sponsor-edit" element={<RoleProtection allowedRoles={["admin","sponsor"]}><SponsorEdit /></RoleProtection>} />
      <Route path="/my-sponsors" element={<Protection><DriverSponsors /></Protection>} />
    </Routes>
  );
}

export default App;
