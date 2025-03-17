import React from "react";
import { Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import About from "./pages/About";
import Login from "./pages/Login";
import Create from "./pages/Create";
<<<<<<< Updated upstream

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
=======
import Applications from "./pages/Applications";
import Help from "./pages/Help";
import ResetPassword from "./components/ResetPassword";
import AccountConfirmation from "./pages/AccountConfirmation";
import Points from "./pages/Points"

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
      <Route path="/points" element={<Points />} />
    </Routes>
>>>>>>> Stashed changes
  );
}

export default App;
