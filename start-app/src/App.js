import React from "react";
import { Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import About from "./pages/About";
import Login from "./pages/Login";
import Create from "./pages/Create";
import Applications from "./pages/Applications";
import Help from "./pages/Help";
import ResetPassword from "./components/ResetPassword";
import AccountConfirmation from "./pages/AccountConfirmation";
import Profile from "./pages/Profile";

function App() {
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
    </Routes>
  );
}

export default App;
