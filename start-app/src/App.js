import React from "react";
import { Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import About from "./pages/About";
import Login from "./pages/Login";
import Create from "./pages/Create";
import Applications from "./pages/Applications";
import Help from "./pages/Help";

function App() {
  return (
      <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/login" element={<Login />} />
          <Route path="/account-creation" element={<Create />} />
          <Route path="/applications" element={<Applications />} />
          <Route path="/help" element={<Help />} />
      </Routes>
  );
}

export default App;
