// src/pages/AddProject.jsx
import React from "react";
import { motion } from "framer-motion";
import UserNavbar from "../components/UserNavbar";

export default function AddProject() {
  return (
    <>
      <div className="fixed inset-0 -z-10 bg-cover bg-center bg-no-repeat" style={{ backgroundImage: "url(/geolocation.avif)" }} />
      <div className="fixed inset-0 -z-10 bg-black/60" />
      <div className="min-h-screen text-white">
        <UserNavbar />
        <div className="max-w-7xl mx-auto px-6 py-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-10"
          >
            <h1 className="text-5xl font-bold mb-3">Add New Project</h1>
            <p className="text-xl text-white/70">Click on the map to set location</p>
          </motion.div>
          <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-8 border border-white/20 text-center">
            <p className="text-white/70">Map + Form Coming in Next Step!</p>
          </div>
        </div>
      </div>
    </>
  );
}