import React,{ useState } from "react";
import { motion } from "framer-motion";
import { User, Mail, Lock, AlertCircle, CheckCircle, Loader2, BackpackIcon, BaggageClaim, BaggageClaimIcon, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

export default function Register() {
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();

  // AXIOS INSTANCE (Reusable)
  const api = axios.create({
    baseURL: "http://localhost:8080",
    headers: { "Content-Type": "application/json" },
  });

  const validateForm = () => {
    const newErrors = {};

    if (!formData.username.trim()) newErrors.username = "Username is required";
    if (!formData.email.trim()) newErrors.email = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = "Email is invalid";

    if (!formData.password) newErrors.password = "Password is required";
    else if (formData.password.length < 6) newErrors.password = "Password must be 6+ characters";

    if (formData.password !== formData.confirmPassword)
      newErrors.confirmPassword = "Passwords do not match";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setErrors({ ...errors, [e.target.name]: "" });
  };

  const handleHome = () => {
    navigate("/");
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    setSuccess(false);
    setErrors({});

    try {
      const response = await api.post("/api/users/register", {
        username: formData.username,
        email: formData.email,
        password: formData.password,
      });

      // Success
      setSuccess(true);
      setTimeout(() => navigate("/login"), 2000);
    } catch (err) {
      // Enhanced error handling
      const errorMsg =
        err.response?.data?.Error ||
        err.response?.data?.error ||
        err.message ||
        "Registration failed. Please try again.";

      setErrors({ submit: errorMsg });
    } finally {
      setLoading(false);
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
          {/* CARD */}
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
                <User className="w-10 h-10 text-white"/>
              </motion.div>
              <h1 className="text-3xl font-bold text-white">Create Account</h1>
              <p className="text-white/70 mt-2">Join RebuildTrack as a Field Officer</p>
            </div>

            {/* SUCCESS MESSAGE */}
            {success && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="mb-6 p-4 bg-green-500/20 border border-green-400/50 rounded-xl flex items-center space-x-3 text-green-300"
              >
                <CheckCircle className="w-5 h-5" />
                <p className="font-medium">Registration successful! Redirecting...</p>
              </motion.div>
            )}

            {/* ERROR MESSAGE */}
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
              {/* USERNAME */}
              <div>
                <label className="block text-white/90 font-medium mb-2">Username</label>
                <div className="relative">
                  <User className="absolute left-3 top-3.5 w-5 h-5 text-white/50" />
                  <input
                    type="text"
                    name="username"
                    value={formData.username}
                    onChange={handleChange}
                    className={`w-full pl-11 pr-4 py-3 bg-white/10 border ${
                      errors.username ? "border-red-400" : "border-white/30"
                    } rounded-xl text-white placeholder-white/40 focus:outline-none focus:border-cyan-400 transition`}
                    placeholder="Mario Rossi"
                  />
                </div>
                {errors.username && (
                  <p className="mt-1 text-red-300 text-sm">{errors.username}</p>
                )}
              </div>

              {/* EMAIL */}
              <div>
                <label className="block text-white/90 font-medium mb-2">Email</label>
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
                    placeholder="mario@usrc.it"
                  />
                </div>
                {errors.email && <p className="mt-1 text-red-300 text-sm">{errors.email}</p>}
              </div>

              {/* PASSWORD */}
              <div>
                <label className="block text-white/90 font-medium mb-2">Password</label>
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

              {/* CONFIRM PASSWORD */}
              <div>
                <label className="block text-white/90 font-medium mb-2">Confirm Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3.5 w-5 h-5 text-white/50" />
                  <input
                    type="password"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    className={`w-full pl-11 pr-4 py-3 bg-white/10 border ${
                      errors.confirmPassword ? "border-red-400" : "border-white/30"
                    } rounded-xl text-white placeholder-white/40 focus:outline-none focus:border-cyan-400 transition`}
                    placeholder="••••••••"
                  />
                </div>
                {errors.confirmPassword && (
                  <p className="mt-1 text-red-300 text-sm">{errors.confirmPassword}</p>
                )}
              </div>

              {/* SUBMIT BUTTON */}
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                disabled={loading}
                className="w-full mt-8 bg-gradient-to-r from-cyan-400 to-blue-600 text-white font-bold py-4 rounded-xl hover:shadow-xl transition flex items-center justify-center space-x-2 disabled:opacity-70"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Creating Account...</span>
                  </>
                ) : (
                  <span>Create Account</span>
                )}
              </motion.button>
            </form>

            {/* LOGIN LINK */}
            <p className="text-center mt-6 text-white/70">
              Already have an account?{" "}
              <a href="/login" className="text-cyan-300 hover:text-cyan-200 font-medium transition">
                Login here
              </a>
            </p>
          </div>
        </motion.div>
      </div>
    </>
  );
}