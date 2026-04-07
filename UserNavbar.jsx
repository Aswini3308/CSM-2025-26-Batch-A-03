// src/components/UserNavbar.jsx
import React, { useState } from "react";
import { motion } from "framer-motion";
import { LogOut, MapPin, Home, User, Menu, X, Plus } from "lucide-react";
import { NavLink, useNavigate } from "react-router-dom";

export default function UserNavbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const navigate = useNavigate();
  const userName = localStorage.getItem("userName") || "Field Officer";

  const handleLogout = () => {
    localStorage.clear();
    navigate("/login");
  };

  const navLinkClasses = ({ isActive }) =>
    `flex items-center space-x-2 transition font-medium ${
      isActive ? "text-white" : "text-white/80 hover:text-white"
    }`;

  return (
    <nav className="bg-black/60 backdrop-blur-xl border-b border-white/10 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
        {/* LOGO */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex items-center space-x-3"
        >
          <div className="w-10 h-10 bg-gradient-to-br from-cyan-400 to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
            <MapPin className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-xl font-bold text-white">RebuildTrack</h1>
        </motion.div>

        {/* DESKTOP MENU */}
        <div className="hidden md:flex items-center space-x-8">
          <NavLink to="/dashboard" className={navLinkClasses}>
            <Home className="w-4 h-4" />
            <span>Dashboard</span>
          </NavLink>
          <NavLink to="/add-project" className={navLinkClasses}>
            <Plus className="w-4 h-4" />
            <span>Add Project</span>
          </NavLink>
          <div className="flex items-center space-x-3">
            <User className="w-5 h-5 text-cyan-300" />
            <span className="text-white/90">{userName}</span>
          </div>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleLogout}
            className="bg-gradient-to-r from-red-500 to-red-600 text-white px-5 py-2 rounded-full flex items-center space-x-2 hover:shadow-lg transition"
          >
            <LogOut className="w-4 h-4" />
            <span>Logout</span>
          </motion.button>
        </div>

        {/* MOBILE TOGGLE */}
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="md:hidden text-white"
        >
          {mobileOpen ? (
            <X className="w-6 h-6" />
          ) : (
            <Menu className="w-6 h-6" />
          )}
        </button>
      </div>

      {/* MOBILE MENU */}
      {mobileOpen && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="md:hidden bg-black/80 backdrop-blur-xl border-t border-white/10"
        >
          <div className="px-6 py-4 space-y-3">
            <NavLink
              to="/dashboard"
              className="block text-white/80 hover:text-white flex items-center space-x-2"
              onClick={() => setMobileOpen(false)}
            >
              <Home className="w-4 h-4" />
              <span>Dashboard</span>
            </NavLink>
            <NavLink
              to="/add-project"
              className="block text-white/80 hover:text-white flex items-center space-x-2"
              onClick={() => setMobileOpen(false)}
            >
              <Plus className="w-4 h-4" />
              <span>Add Project</span>
            </NavLink>
            <div className="flex items-center space-x-3 py-2">
              <User className="w-5 h-5 text-cyan-300" />
              <span className="text-white/90">{userName}</span>
            </div>
            <button
              onClick={handleLogout}
              className="w-full bg-gradient-to-r from-red-500 to-red-600 text-white px-5 py-2 rounded-full flex items-center justify-center space-x-2 hover:shadow-lg transition"
            >
              <LogOut className="w-4 h-4" />
              <span>Logout</span>
            </button>
          </div>
        </motion.div>
      )}
    </nav>
  );
}
