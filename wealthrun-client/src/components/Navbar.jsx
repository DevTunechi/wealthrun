// src/components/Navbar.jsx
import React from "react";
import logo from "../assets/1.png";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { logout } from "../services/firebase";

export default function Navbar({ user }) {
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  return (
    <motion.nav
      initial={{ y: -30, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="bg-black text-yellow-400 p-4 shadow-lg"
    >
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <Link to="/" className="flex items-center space-x-2">
          <img src={logo} alt="WealthRun Logo" className="w-8 h-8 object-contain" />
          <span className="text-2xl font-bold">WealthRun</span>
        </Link>

        <div className="flex items-center space-x-6">
          <Link to="/" className="hover:text-yellow-300 transition">
            Home
          </Link>
          <Link to="/dashboard" className="hover:text-yellow-300 transition">
            Dashboard
          </Link>

          {!user ? (
            <>
              <Link to="/login" className="hover:text-yellow-300 transition">
                Login
              </Link>
              <Link to="/register" className="hover:text-yellow-300 transition">
                Register
              </Link>
            </>
          ) : (
            <>
              <span className="text-sm">{user.displayName || user.email}</span>
              <button
                onClick={handleLogout}
                className="bg-yellow-500 text-black px-3 py-1 rounded hover:bg-yellow-400 transition"
              >
                Logout
              </button>
            </>
          )}
        </div>
      </div>
    </motion.nav>
  );
}
