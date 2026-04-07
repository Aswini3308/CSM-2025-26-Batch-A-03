// src/pages/Login.jsx
import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  Mail,
  Lock,
  AlertCircle,
  CheckCircle,
  Loader2,
  ChevronDown,
  X,
  RotateCw,
  ArrowLeft,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

export default function Login() {
  const [role, setRole] = useState("user");
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [showDropdown, setShowDropdown] = useState(false);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [forgotEmail, setForgotEmail] = useState("");
  const [forgotNewPassword, setForgotNewPassword] = useState("");
  const [forgotLoading, setForgotLoading] = useState(false);
  const [forgotSuccess, setForgotSuccess] = useState(false);
  const [forgotError, setForgotError] = useState("");
  const navigate = useNavigate();

  const api = axios.create({ baseURL: "http://localhost:8080" });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setErrors({ ...errors, [e.target.name]: "" });
  };

  const handleHome = () => {
    navigate("/");
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.email.trim()) newErrors.email = "Email is required";
    if (!formData.password) newErrors.password = "Password is required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    setSuccess(false);
    setErrors({});

    try {
      let response;

      if (role === "admin") {
        // ADMIN: form-urlencoded
        const params = new URLSearchParams();
        params.append("email", formData.email);
        params.append("password", formData.password);

        response = await api.post("/api/admin/login", params, {
          headers: { "Content-Type": "application/x-www-form-urlencoded" },
        });
      } else {
        // USER: form-urlencoded (because of @RequestParam)
        const params = new URLSearchParams();
        params.append("email", formData.email);
        params.append("password", formData.password);

        response = await api.post("/api/users/login", params, {
          headers: { "Content-Type": "application/x-www-form-urlencoded" },
        });
      }

      setSuccess(true);

      if (role === "user") {
        localStorage.setItem("userId", response.data.UserId);
        localStorage.setItem("role", "user");
      } else {
        localStorage.setItem("role", "admin");
        localStorage.setItem("adminName", response.data.name);
      }

      setTimeout(() => {
        navigate(role === "admin" ? "/admin-dashboard" : "/dashboard");
      }, 1500);
    } catch (err) {
      const msg =
        err.response?.data?.error ||
        err.response?.data?.Error ||
        err.response?.data?.message ||
        "Login failed. Please try again.";
      setErrors({ submit: msg });
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    if (!forgotEmail || !forgotNewPassword) {
      setForgotError("Both fields are required");
      return;
    }

    setForgotLoading(true);
    setForgotError("");
    setForgotSuccess(false);

    try {
      await api.put("/api/users/forgot-password", null, {
        params: { email: forgotEmail, password: forgotNewPassword },
      });

      setForgotSuccess(true);
      setTimeout(() => {
        setShowForgotModal(false);
        setForgotEmail("");
        setForgotNewPassword("");
      }, 2000);
    } catch (err) {
      setForgotError(err.response?.data?.Error || "Failed to reset password");
    } finally {
      setForgotLoading(false);
    }
  };

  return (
    <>
      {/* BACKGROUND */}
      <div
        className="fixed inset-0 -z-10 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: "url(/geolocation.avif)" }}
      />
      <div className="fixed inset-0 -z-10 bg-black/50" />

      <div className="min-h-screen flex items-center justify-center p-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md"
        >
          <ArrowLeft
            className="w-10 h-10 text-white cursor-pointer hover:text-cyan-300 transition"
            onClick={handleHome} // correct: function reference, not call
          />
          <div className="bg-white/10 backdrop-blur-xl rounded-3xl p-8 border border-white/20 shadow-2xl">
            <div className="text-center mb-8">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 200 }}
                className="w-20 h-20 bg-gradient-to-br from-cyan-400 to-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4"
              >
                <Lock className="w-10 h-10 text-white" />
              </motion.div>
              <h1 className="text-3xl font-bold text-white">Welcome Back</h1>
              <p className="text-white/70 mt-2">Login to RebuildTrack</p>
            </div>

            {/* ROLE DROPDOWN */}
            <div className="mb-6">
              <label className="block text-white/90 font-medium mb-2">
                Login As
              </label>
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setShowDropdown(!showDropdown)}
                  className="w-full px-4 py-3 bg-white/10 border border-white/30 rounded-xl text-white flex items-center justify-between hover:border-cyan-400 transition"
                >
                  <span className="flex items-center space-x-3">
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm ${
                        role === "admin" ? "bg-red-500" : "bg-cyan-500"
                      }`}
                    >
                      {role === "admin" ? "A" : "U"}
                    </div>
                    <span className="font-medium">
                      {role === "admin" ? "Administrator" : "Field Officer"}
                    </span>
                  </span>
                  <ChevronDown
                    className={`w-5 h-5 transition ${
                      showDropdown ? "rotate-180" : ""
                    }`}
                  />
                </button>

                {showDropdown && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="absolute top-full mt-2 w-full bg-white/20 backdrop-blur-md rounded-xl border border-white/30 overflow-hidden z-10"
                  >
                    <button
                      onClick={() => {
                        setRole("user");
                        setShowDropdown(false);
                      }}
                      className="w-full px-4 py-3 text-left text-white hover:bg-white/10 flex items-center space-x-3"
                    >
                      <div className="w-8 h-8 bg-cyan-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
                        U
                      </div>
                      <span className="font-medium">Field Officer</span>
                    </button>
                    <button
                      onClick={() => {
                        setRole("admin");
                        setShowDropdown(false);
                      }}
                      className="w-full px-4 py-3 text-left text-white hover:bg-white/10 flex items-center space-x-3"
                    >
                      <div className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
                        A
                      </div>
                      <span className="font-medium">Administrator</span>
                    </button>
                  </motion.div>
                )}
              </div>
            </div>

            {/* SUCCESS */}
            {success && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="mb-6 p-4 bg-green-500/20 border border-green-400/50 rounded-xl flex items-center space-x-3 text-green-300"
              >
                <CheckCircle className="w-5 h-5" />
                <p className="font-medium">Login successful! Redirecting...</p>
              </motion.div>
            )}

            {/* ERROR */}
            {errors.submit && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="mb-6 p-4 bg-red-500/20 border border-red-400/50 rounded-xl flex items-center space-x-3 text-red-300"
              >
                <AlertCircle className="w-5 h-5" />
                <p className="font-medium">{errors.submit}</p>
              </motion.div>
            )}

            {/* FORM */}
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <div className="relative">
                  <Mail className="absolute left-3 top-3.5 w-5 h-5 text-white/50" />
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className={`w-full pl-11 pr-4 py-3 bg-white/10 border ${
                      errors.email ? "border-red-400" : "border-white/30"
                    } rounded-xl text-white placeholder-white/40 focus:outline-none focus:border-cyan-400 transition`}
                    placeholder={
                      role === "admin" ? "admin@gmail.com" : "mario@usrc.it"
                    }
                  />
                </div>
                {errors.email && (
                  <p className="mt-1 text-red-300 text-sm">{errors.email}</p>
                )}
              </div>

              <div>
                <div className="relative">
                  <Lock className="absolute left-3 top-3.5 w-5 h-5 text-white/50" />
                  <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    className={`w-full pl-11 pr-4 py-3 bg-white/10 border ${
                      errors.password ? "border-red-400" : "border-white/30"
                    } rounded-xl text-white placeholder-white/40 focus:outline-none focus:border-cyan-400 transition`}
                    placeholder="••••••••"
                  />
                </div>
                {errors.password && (
                  <p className="mt-1 text-red-300 text-sm">{errors.password}</p>
                )}
              </div>

              {role === "user" && (
                <div className="text-right">
                  <button
                    type="button"
                    onClick={() => setShowForgotModal(true)}
                    className="text-cyan-300 hover:text-cyan-200 text-sm font-medium transition"
                  >
                    Forgot Password?
                  </button>
                </div>
              )}

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                disabled={loading}
                className="w-full mt-6 bg-gradient-to-r from-cyan-400 to-blue-600 text-white font-bold py-4 rounded-xl hover:shadow-xl transition flex items-center justify-center space-x-2 disabled:opacity-70"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Logging in...</span>
                  </>
                ) : (
                  <span>
                    Login as{" "}
                    {role === "admin" ? "Administrator" : "Field Officer"}
                  </span>
                )}
              </motion.button>
            </form>

            <p className="text-center mt-6 text-white/70">
              Don't have an account?{" "}
              <a
                href="/register"
                className="text-cyan-300 hover:text-cyan-200 font-medium transition"
              >
                Register here
              </a>
            </p>
          </div>
        </motion.div>
      </div>

      {/* FORGOT PASSWORD MODAL */}
      {showForgotModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-6">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white/10 backdrop-blur-xl rounded-3xl p-8 border border-white/20 shadow-2xl max-w-md w-full"
          >
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-white flex items-center space-x-2">
                <RotateCw className="w-6 h-6" />
                <span>Reset Password</span>
              </h2>
              <button
                onClick={() => {
                  setShowForgotModal(false);
                  setForgotError("");
                  setForgotSuccess(false);
                }}
                className="text-white/70 hover:text-white"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {forgotSuccess ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="p-4 bg-green-500/20 border border-green-400/50 rounded-xl flex items-center space-x-3 text-green-300"
              >
                <CheckCircle className="w-5 h-5" />
                <p className="font-medium">Password reset successfully!</p>
              </motion.div>
            ) : (
              <form onSubmit={handleForgotPassword} className="space-y-5">
                <div>
                  <label className="block text-white/90 font-medium mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    value={forgotEmail}
                    onChange={(e) => setForgotEmail(e.target.value)}
                    className="w-full px-4 py-3 bg-white/10 border border-white/30 rounded-xl text-white placeholder-white/40 focus:outline-none focus:border-cyan-400"
                    placeholder="your@email.com"
                  />
                </div>

                <div>
                  <label className="block text-white/90 font-medium mb-2">
                    New Password
                  </label>
                  <input
                    type="password"
                    value={forgotNewPassword}
                    onChange={(e) => setForgotNewPassword(e.target.value)}
                    className="w-full px-4 py-3 bg-white/10 border border-white/30 rounded-xl text-white placeholder-white/40 focus:outline-none focus:border-cyan-400"
                    placeholder="••••••••"
                  />
                </div>

                {forgotError && (
                  <p className="text-red-300 text-sm">{forgotError}</p>
                )}

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="submit"
                  disabled={forgotLoading}
                  className="w-full bg-gradient-to-r from-cyan-400 to-blue-600 text-white font-bold py-3 rounded-xl hover:shadow-xl transition flex items-center justify-center space-x-2 disabled:opacity-70"
                >
                  {forgotLoading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      <span>Resetting...</span>
                    </>
                  ) : (
                    <span>Reset Password</span>
                  )}
                </motion.button>
              </form>
            )}
          </motion.div>
        </div>
      )}
    </>
  );
}
