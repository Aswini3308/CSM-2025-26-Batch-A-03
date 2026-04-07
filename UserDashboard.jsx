// src/components/UserDashboard.jsx
import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  useMapEvents,
  Polygon,
  FeatureGroup,
} from "react-leaflet";
import { EditControl } from "react-leaflet-draw";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "leaflet-draw/dist/leaflet.draw.css";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import {
  MapPin,
  HardHat,
  Clock,
  CheckCircle,
  Plus,
  Edit,
  Upload,
  MessageSquare,
  User,
  LogOut,
  Loader2,
  Trash2,
  Save,
  X,
  Eye,
  EyeOff,
  Send,
  Building2,
  AlertCircle,
  FileText,
  Shield,
  BarChart3,
  Calendar,
  Mail,
  Map,
  ChevronDown,
  Users,
  DollarSign,
  Target,
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  Activity,
  Watch,
  Bot,
  Minimize2,
  Maximize2,
} from "lucide-react";

// Fix Leaflet default icon
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

// Gemini API Configuration
const GEMINI_API_KEY = "AIzaSyBKPvsAbGf4XFxnmGpnDFhGT2WwLM6QBUY";
const GEMINI_API_URL =
  "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent";

export default function UserDashboard() {
  /* =============================================
   *  STATE
   * ============================================= */
  const [activeTab, setActiveTab] = useState("dashboard");
  const [projects, setProjects] = useState([]);
  const [selectedProject, setSelectedProject] = useState(null);
  const [expandedProject, setExpandedProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [drawingMode, setDrawingMode] = useState(null);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [delayedProjects, setDelayedProjects] = useState([]);
  const [selectedDelayProject, setSelectedDelayProject] = useState(null);
  const [delayReason, setDelayReason] = useState("");
  const [showDelayModal, setShowDelayModal] = useState(false);
  const [timelineData, setTimelineData] = useState(null);
  const [showTimelineModal, setShowTimelineModal] = useState(false);

  const [commentInputs, setCommentInputs] = useState({});

  const [location, setLocation] = useState(null);
  const [form, setForm] = useState({
    title: "",
    location: "",
    description: "",
    status: "IN_PROGRESS",
    manpowerRequired: "",
    manpowerAssigned: "",
    budget: "",
    expenses: "",
    estimatedDays: "",
  });

  const [profile, setProfile] = useState(null);
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileSaving, setProfileSaving] = useState(false);
  const [showPasswordFields, setShowPasswordFields] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [profileEdit, setProfileEdit] = useState({
    username: "",
    email: "",
    password: "",
  });

  /* =============================================
   *  CHATBOT STATE
   * ============================================= */
  const [chatOpen, setChatOpen] = useState(false);
  const [chatMinimized, setChatMinimized] = useState(false);
  const [chatMessages, setChatMessages] = useState([
    {
      id: 1,
      text: "Hi! I'm your project assistant. Ask me anything about your projects!",
      sender: "bot",
      timestamp: new Date(),
    },
  ]);
  const [chatInput, setChatInput] = useState("");
  const [chatLoading, setChatLoading] = useState(false);
  const chatMessagesEndRef = useRef(null);
  const chatInputRef = useRef(null);

  const navigate = useNavigate();
  const userId = localStorage.getItem("userId");
  const api = axios.create({ baseURL: "http://localhost:8080" });

  /* =============================================
   *  EFFECTS
   * ============================================= */
  useEffect(() => {
    if (userId) {
      fetchProjects();
      fetchProfile();
      fetchDelayedProjects();
    } else {
      navigate("/login");
    }
  }, [userId, navigate]);

  useEffect(() => {
    scrollChatToBottom();
  }, [chatMessages]);

  useEffect(() => {
    if (chatOpen && !chatMinimized) {
      chatInputRef.current?.focus();
    }
  }, [chatOpen, chatMinimized]);

  /* =============================================
   *  CHATBOT FUNCTIONS
   * ============================================= */
  const scrollChatToBottom = () => {
    chatMessagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const formatProjectDataForPrompt = () => {
    if (!projects || projects.length === 0) {
      return "No projects available.";
    }

    return JSON.stringify(
      projects.map((project) => ({
        id: project.id,
        title: project.title,
        description: project.description,
        location: project.location,
        latitude: project.latitude,
        longitude: project.longitude,
        status: project.status,
        approved: project.approved,
        manpowerRequired: project.manpowerRequired,
        manpowerAssigned: project.manpowerAssigned,
        budget: project.budget,
        expenses: project.expenses,
        estimatedDays: project.estimatedDays,
        daysSpent: project.daysSpent,
        completionPercentage: project.completionPercentage,
        createdAt: project.createdAt,
        startedAt: project.startedAt,
        expectedCompletionDate: project.expectedCompletionDate,
        actualCompletionDate: project.actualCompletionDate,
        delayStatus: project.delayStatus,
        delayReason: project.delayReason,
        delayDays: project.delayDays,
        commentsCount: project.comments?.length || 0,
        delayUpdates: project.delayUpdates || [],
      })),
      null,
      2
    );
  };

  const generatePrompt = (userQuestion) => {
    const projectData = formatProjectDataForPrompt();

    return `You are a helpful project assistant for a reconstruction project management system called RebuildTrack.
You have access to the following project data for user ID ${userId} (${
      profile?.username || "User"
    }):

${projectData}

Please answer the following question based ONLY on this project data. 
If the question cannot be answered from the provided data, politely say so.
Keep responses concise, friendly, and informative. Use bullet points for lists when appropriate.
Format numbers appropriately (currency as $, percentages as %, etc.).

User Question: ${userQuestion}

Answer:`;
  };

  const sendMessageToGemini = async (userMessage) => {
    setChatLoading(true);

    try {
      const prompt = generatePrompt(userMessage);

      const response = await fetch(GEMINI_API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-goog-api-key": GEMINI_API_KEY,
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: prompt,
                },
              ],
            },
          ],
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 800,
          },
        }),
      });

      if (!response.ok) {
        throw new Error(`API request failed: ${response.status}`);
      }

      const data = await response.json();

      const botResponse =
        data.candidates?.[0]?.content?.parts?.[0]?.text ||
        "I'm sorry, I couldn't process that request.";

      return botResponse;
    } catch (error) {
      console.error("Gemini API Error:", error);
      return "I'm having trouble connecting right now. Please try again later.";
    } finally {
      setChatLoading(false);
    }
  };

  const handleChatSend = async () => {
    if (!chatInput.trim() || chatLoading) return;

    // Add user message
    const userMessageObj = {
      id: Date.now(),
      text: chatInput,
      sender: "user",
      timestamp: new Date(),
    };
    setChatMessages((prev) => [...prev, userMessageObj]);
    setChatInput("");

    // Get bot response
    const botResponseText = await sendMessageToGemini(chatInput);

    // Add bot message
    const botMessageObj = {
      id: Date.now() + 1,
      text: botResponseText,
      sender: "bot",
      timestamp: new Date(),
    };
    setChatMessages((prev) => [...prev, botMessageObj]);
  };

  const handleChatKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleChatSend();
    }
  };

  const formatChatTimestamp = (date) => {
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  /* =============================================
   *  FETCH DATA
   * ============================================= */
  const fetchProjects = async () => {
    try {
      const res = await api.get(`/api/projects/user/${userId}`);
      setProjects(res.data);
    } catch (err) {
      console.error("Failed to fetch projects:", err);
      alert("Failed to load projects.");
    } finally {
      setLoading(false);
    }
  };

  const fetchDelayedProjects = async () => {
    try {
      const res = await api.get("/api/projects/delayed-projects");
      setDelayedProjects(res.data);
    } catch (err) {
      console.error("Failed to fetch delayed projects:", err);
    }
  };

  const fetchTimelineData = async (projectId) => {
    try {
      const res = await api.get(`/api/projects/${projectId}/timeline`);
      setTimelineData(res.data);
      setShowTimelineModal(true);
    } catch (err) {
      alert("Failed to fetch timeline data");
    }
  };

  const fetchProfile = async () => {
    if (!userId) return;
    setProfileLoading(true);
    try {
      const res = await api.get(`/api/users/profile/${userId}`);
      const userProfile = res.data["User profile"];
      setProfile(userProfile);
      setProfileEdit({
        username: userProfile.username,
        email: userProfile.email,
        password: "",
      });
    } catch (err) {
      console.error("Failed to load profile:", err);
      alert("Session expired. Please log in again.");
      handleLogout();
    } finally {
      setProfileLoading(false);
    }
  };

  /* =============================================
   *  PROFILE UPDATE
   * ============================================= */
  const handleProfileUpdate = async () => {
    if (!profileEdit.username.trim() || !profileEdit.email.trim()) {
      alert("Username and email are required.");
      return;
    }

    setProfileSaving(true);
    try {
      const payload = {
        username: profileEdit.username.trim(),
        email: profileEdit.email.trim(),
      };
      if (showPasswordFields && profileEdit.password.trim()) {
        payload.password = profileEdit.password;
      }

      const res = await api.put(`/api/users/update-profile/${userId}`, payload);
      const updated = res.data["UpdatedProfile"];
      setProfile(updated);
      localStorage.setItem("userName", updated.username);
      setProfileEdit({
        username: updated.username,
        email: updated.email,
        password: "",
      });
      setShowPasswordFields(false);
      alert("Profile updated successfully!");
    } catch (err) {
      alert(err.response?.data?.Error || "Failed to update profile.");
    } finally {
      setProfileSaving(false);
    }
  };

  /* =============================================
   *  MAP HANDLERS
   * ============================================= */
  const handleMapClick = (e) => {
    const { lat, lng } = e.latlng;
    setLocation({ lat, lng });
    setForm((prev) => ({
      ...prev,
      location: `${lat.toFixed(6)}, ${lng.toFixed(6)}`,
    }));
  };

  function MapClickHandler() {
    useMapEvents({ click: handleMapClick });
    return null;
  }

  // Custom marker with status-based colors
  const customIcon = (status) => {
    const colors = {
      NOT_STARTED: "#ef4444",
      IN_PROGRESS: "#f59e0b",
      COMPLETED: "#10b981",
    };

    return L.divIcon({
      className: "custom-marker",
      html: `
        <div style="
          background: ${colors[status] || "#6b7280"}; 
          width: 32px; 
          height: 32px; 
          border-radius: 50%; 
          border: 3px solid white; 
          box-shadow: 0 4px 12px rgba(0,0,0,0.3);
          position: relative;
          animation: pulse 2s infinite;
        ">
          <div style="
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            width: 12px;
            height: 12px;
            background: white;
            border-radius: 50%;
          "></div>
        </div>
        <style>
          @keyframes pulse {
            0% { transform: scale(1); }
            50% { transform: scale(1.1); }
            100% { transform: scale(1); }
          }
        </style>`,
      iconSize: [32, 32],
      iconAnchor: [16, 32],
      popupAnchor: [0, -32],
    });
  };

  const parseGeoJson = (geoJsonString) => {
    try {
      return geoJsonString ? JSON.parse(geoJsonString) : null;
    } catch (error) {
      console.error("Error parsing GeoJSON:", error);
      return null;
    }
  };

  const getAllPolygonCoordinates = (geoJson) => {
    if (!geoJson) return [];
    const polys = [];

    const add = (geom) => {
      if (geom?.type === "Polygon" && Array.isArray(geom.coordinates?.[0])) {
        polys.push(geom.coordinates[0].map(([lng, lat]) => [lat, lng]));
      }
    };

    if (geoJson.type === "Feature") add(geoJson.geometry);
    else if (geoJson.type === "FeatureCollection")
      geoJson.features.forEach((f) => add(f.geometry));

    return polys;
  };

  /* =============================================
   *  DRAWN POLYGON SAVE
   * ============================================= */
  const saveDrawnPolygon = async (projectId, geoJson) => {
    try {
      const res = await api.put(`/api/projects/update-geojson/${projectId}`, {
        geoJson: JSON.stringify(geoJson),
      });
      const updated = res.data.project;
      setProjects((prev) =>
        prev.map((p) => (p.id === updated.id ? updated : p))
      );
      if (selectedProject?.id === projectId) setSelectedProject(updated);
    } catch (err) {
      alert("Failed to save area. Please try again.");
    }
  };

  /* =============================================
   *  DELAY REPORTING
   * ============================================= */
  const handleReportDelay = async () => {
    if (!delayReason.trim()) {
      alert("Please provide a reason for the delay");
      return;
    }

    try {
      await api.post(
        `/api/projects/${selectedDelayProject.id}/report-delay/${userId}`,
        {
          reason: delayReason,
        }
      );
      alert("Delay reported successfully");
      setShowDelayModal(false);
      setDelayReason("");
      fetchDelayedProjects();
      fetchProjects();
    } catch (err) {
      alert("Failed to report delay");
    }
  };

  const getDelayStatusColor = (status) => {
    switch (status) {
      case "ON_TRACK":
        return "text-green-400";
      case "SLIGHTLY_DELAYED":
        return "text-yellow-400";
      case "DELAYED":
        return "text-orange-400";
      case "CRITICALLY_DELAYED":
        return "text-red-400";
      case "COMPLETED":
        return "text-blue-400";
      default:
        return "text-gray-400";
    }
  };

  const getDelayStatusIcon = (status) => {
    switch (status) {
      case "ON_TRACK":
        return <TrendingUp className="w-4 h-4" />;
      case "SLIGHTLY_DELAYED":
        return <Activity className="w-4 h-4" />;
      case "DELAYED":
        return <AlertTriangle className="w-4 h-4" />;
      case "CRITICALLY_DELAYED":
        return <AlertCircle className="w-4 h-4" />;
      case "COMPLETED":
        return <CheckCircle className="w-4 h-4" />;
      default:
        return <Clock className="w-4 h-4" />;
    }
  };

  /* =============================================
   *  UPDATE PROJECT STATUS API
   * ============================================= */
  const handleUpdateStatus = async (projectId, newStatus) => {
    if (!userId) {
      alert("User not authenticated");
      return;
    }

    setUpdatingStatus(true);
    try {
      const response = await api.put(
        `/api/projects/${projectId}/status?userId=${userId}&status=${newStatus}`
      );

      const updatedProject = response.data;

      setProjects((prev) =>
        prev.map((p) => (p.id === projectId ? updatedProject : p))
      );

      if (selectedProject?.id === projectId) {
        setSelectedProject(updatedProject);
      }

      alert(
        `Project status updated to ${newStatus.replace("_", " ")} successfully!`
      );
      fetchDelayedProjects();
    } catch (err) {
      console.error("Status update error:", err);
      const errorMessage =
        err.response?.data?.message ||
        err.response?.data?.error ||
        "Failed to update project status";
      alert(errorMessage);
    } finally {
      setUpdatingStatus(false);
    }
  };

  /* =============================================
   *  PROJECT CRUD
   * ============================================= */
  const handleCreateProject = async () => {
    if (!form.title || !form.location) {
      alert("Title and location are required.");
      return;
    }
    setSaving(true);
    try {
      const projectData = {
        title: form.title,
        description: form.description,
        location: form.location,
        latitude: location.lat,
        longitude: location.lng,
        status: form.status,
        manpowerRequired: parseInt(form.manpowerRequired) || 0,
        manpowerAssigned: parseInt(form.manpowerAssigned) || 0,
        budget: parseFloat(form.budget) || 0,
        expenses: parseFloat(form.expenses) || 0,
        estimatedDays: parseInt(form.estimatedDays) || 0,
        createdBy: { id: userId },
      };

      await api.post(`/api/projects/create/${userId}`, projectData);
      resetForm();
      fetchProjects();
      setActiveTab("my-projects");
      alert("Project created successfully!");
    } catch (err) {
      console.error("Create error:", err);
      alert("Failed to create project.");
    } finally {
      setSaving(false);
    }
  };

  const handleUpdateProject = async () => {
    if (!selectedProject) return;
    setSaving(true);
    try {
      const res = await api.put(
        `/api/projects/update/${selectedProject.id}/${userId}`,
        selectedProject
      );
      const updatedProject = res.data.project;

      setProjects((prev) =>
        prev.map((p) => (p.id === updatedProject.id ? updatedProject : p))
      );
      setSelectedProject(updatedProject);
      alert("Project updated!");
    } catch (err) {
      alert(err.response?.data?.error || "Update failed.");
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteProject = async (id) => {
    if (!confirm("Delete this project permanently?")) return;
    try {
      await api.delete(`/api/projects/${id}`);
      setProjects((prev) => prev.filter((p) => p.id !== id));
      if (selectedProject?.id === id) setSelectedProject(null);
      if (expandedProject === id) setExpandedProject(null);
      fetchDelayedProjects();
      alert("Project deleted.");
    } catch (err) {
      alert("Failed to delete project.");
    }
  };

  const handleGeoJSONUpload = async (e) => {
    const file = e.target.files[0];
    if (!file || !selectedProject) {
      alert("Select a file and a project.");
      return;
    }
    setUploading(true);
    const formData = new FormData();
    formData.append("file", file);
    try {
      const res = await api.post(
        `/api/projects/upload-geojson/${selectedProject.id}`,
        formData,
        { headers: { "Content-Type": "multipart/form-data" } }
      );
      const updatedProject = res.data.project;
      setProjects((prev) =>
        prev.map((p) => (p.id === updatedProject.id ? updatedProject : p))
      );
      setSelectedProject(updatedProject);
      alert("GeoJSON uploaded!");
    } catch (err) {
      alert(err.response?.data?.error || "Upload failed.");
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  };

  const handleAddComment = async (projectId) => {
    const text = commentInputs[projectId]?.trim();
    if (!text) {
      alert("Please write a comment.");
      return;
    }

    try {
      const res = await api.post(
        `/api/projects/comment/${projectId}/${userId}`,
        { text }
      );

      const updatedProject = res.data.project;

      setProjects((prev) =>
        prev.map((p) => (p.id === projectId ? updatedProject : p))
      );

      if (selectedProject?.id === projectId) {
        setSelectedProject(updatedProject);
      }

      setCommentInputs((prev) => ({ ...prev, [projectId]: "" }));
    } catch (err) {
      alert(err.response?.data?.error || "Failed to add comment.");
    }
  };

  const resetForm = () => {
    setForm({
      title: "",
      location: "",
      description: "",
      status: "IN_PROGRESS",
      manpowerRequired: "",
      manpowerAssigned: "",
      budget: "",
      expenses: "",
      estimatedDays: "",
    });
    setLocation(null);
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate("/login");
  };

  const toggleProjectExpansion = (projectId) => {
    setExpandedProject(expandedProject === projectId ? null : projectId);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "COMPLETED":
        return "from-green-500 to-emerald-600";
      case "IN_PROGRESS":
        return "from-amber-500 to-orange-600";
      case "NOT_STARTED":
        return "from-red-500 to-rose-600";
      default:
        return "from-blue-500 to-cyan-600";
    }
  };

  const getStatusText = (status) => {
    return status.replace("_", " ");
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount || 0);
  };

  /* =============================================
   *  RENDER
   * ============================================= */
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 flex items-center justify-center">
        <Loader2 className="w-16 h-16 text-cyan-400 animate-spin" />
      </div>
    );
  }

  return (
    <>
      <div
        className="fixed inset-0 -z-10 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: "url(/geolocation.avif)" }}
      />
      <div className="fixed inset-0 -z-10 bg-black/60" />

      <div className="min-h-screen text-white">
        {/* NAVBAR */}
        <nav className="bg-black/60 backdrop-blur-xl border-b border-white/10 sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
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

            <div className="flex items-center space-x-4">
              {[
                "dashboard",
                "create",
                "my-projects",
                "delayed-projects",
                "profile",
              ].map((tab) => (
                <button
                  key={tab}
                  onClick={() => {
                    setActiveTab(tab);
                    if (tab === "create") resetForm();
                  }}
                  className={`px-4 py-2 rounded-lg font-medium transition capitalize ${
                    activeTab === tab
                      ? "bg-white/20 text-white shadow-lg"
                      : "text-white/70 hover:text-white hover:bg-white/10"
                  }`}
                >
                  {tab.replace("-", " ")}
                  {tab === "delayed-projects" &&
                    delayedProjects?.totalDelayed > 0 && (
                      <span className="ml-2 px-2 py-0.5 bg-red-500 text-white text-xs rounded-full">
                        {delayedProjects.totalDelayed}
                      </span>
                    )}
                </button>
              ))}

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleLogout}
                className="bg-gradient-to-r from-red-500 to-red-600 text-white px-5 py-2 rounded-full flex items-center space-x-2 shadow-lg hover:shadow-xl transition"
              >
                <LogOut className="w-4 h-4" />
                <span>Logout</span>
              </motion.button>
            </div>
          </div>
        </nav>

        <div className="max-w-7xl mx-auto px-6 py-10">
          {/* DASHBOARD */}
          {activeTab === "dashboard" && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <div className="text-center mb-12">
                <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
                  Field Officer Dashboard
                </h1>
                <p className="text-xl text-white/70">
                  Monitor and Manage Reconstruction Projects
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-10">
                {[
                  {
                    icon: Building2,
                    label: "Total Projects",
                    value: projects.length,
                    color: "from-blue-500 to-cyan-600",
                  },
                  {
                    icon: Clock,
                    label: "In Progress",
                    value: projects.filter((p) => p.status === "IN_PROGRESS")
                      .length,
                    color: "from-amber-500 to-orange-600",
                  },
                  {
                    icon: CheckCircle,
                    label: "Completed",
                    value: projects.filter((p) => p.status === "COMPLETED")
                      .length,
                    color: "from-green-500 to-emerald-600",
                  },
                  {
                    icon: AlertCircle,
                    label: "Not Started",
                    value: projects.filter((p) => p.status === "NOT_STARTED")
                      .length,
                    color: "from-red-500 to-rose-600",
                  },
                  {
                    icon: AlertTriangle,
                    label: "Delayed",
                    value: delayedProjects?.totalDelayed || 0,
                    color: "from-orange-500 to-red-600",
                  },
                ].map((stat, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.1 }}
                    whileHover={{ scale: 1.03 }}
                    className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20 shadow-xl"
                  >
                    <div
                      className={`w-14 h-14 bg-gradient-to-br ${stat.color} rounded-xl flex items-center justify-center mb-4 shadow-lg`}
                    >
                      <stat.icon className="w-8 h-8 text-white" />
                    </div>
                    <div className="text-3xl font-bold">{stat.value}</div>
                    <div className="text-white/70">{stat.label}</div>
                  </motion.div>
                ))}
              </div>

              <div className="bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20 overflow-hidden shadow-2xl h-[500px]">
                <MapContainer
                  center={[42.35, 13.4]}
                  zoom={10}
                  style={{ height: "100%", width: "100%" }}
                  scrollWheelZoom={true}
                >
                  <TileLayer
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                  />
                  {projects.map(
                    (project) =>
                      project.latitude &&
                      project.longitude && (
                        <Marker
                          key={project.id}
                          position={[project.latitude, project.longitude]}
                          icon={customIcon(project.status)}
                        >
                          <Popup>
                            <div className="p-2 min-w-[250px]">
                              <h3 className="font-bold text-gray-900 text-lg">
                                {project.title}
                              </h3>
                              <p className="text-sm text-gray-600 mt-1">
                                {project.location}
                              </p>
                              <div className="flex items-center justify-between mt-2">
                                <span
                                  className={`px-2 py-1 rounded text-xs font-medium ${
                                    project.status === "COMPLETED"
                                      ? "bg-green-100 text-green-800"
                                      : project.status === "IN_PROGRESS"
                                      ? "bg-amber-100 text-amber-800"
                                      : "bg-red-100 text-red-800"
                                  }`}
                                >
                                  {project.status.replace("_", " ")}
                                </span>
                                <span className="text-xs text-gray-500">
                                  {project.approved ? "Approved" : "Pending"}
                                </span>
                              </div>
                              {project.delayStatus &&
                                project.delayStatus !== "ON_TRACK" &&
                                project.delayStatus !== "COMPLETED" && (
                                  <div className="mt-2 p-2 bg-red-50 rounded-lg">
                                    <div className="flex items-center space-x-1 text-xs text-red-600">
                                      <AlertTriangle className="w-3 h-3" />
                                      <span className="font-medium">
                                        Delayed by {project.delayDays} days
                                      </span>
                                    </div>
                                  </div>
                                )}
                              {project.description && (
                                <p className="text-sm text-gray-700 mt-2">
                                  {project.description}
                                </p>
                              )}
                            </div>
                          </Popup>
                        </Marker>
                      )
                  )}
                </MapContainer>
              </div>
            </motion.div>
          )}

          {/* CREATE PROJECT */}
          {activeTab === "create" && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="space-y-6"
            >
              <h2 className="text-3xl font-bold flex items-center space-x-3">
                <Plus className="w-8 h-8 text-cyan-400" />
                <span>Create New Project</span>
              </h2>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="space-y-6">
                  <div className="bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20 p-6 space-y-4 shadow-xl">
                    <div>
                      <label className="block text-sm font-medium text-white/80 mb-2">
                        Project Title *
                      </label>
                      <input
                        type="text"
                        placeholder="Enter project title..."
                        value={form.title}
                        onChange={(e) =>
                          setForm({ ...form, title: e.target.value })
                        }
                        className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-cyan-400 transition"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-white/80 mb-2">
                        Location *
                      </label>
                      <input
                        type="text"
                        placeholder="Click on the map to set location"
                        value={form.location}
                        readOnly
                        className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-lg text-white placeholder-white/50 cursor-not-allowed"
                      />
                      <p className="text-xs text-cyan-400 mt-1 flex items-center">
                        <MapPin className="w-3 h-3 mr-1" />
                        Click on the map to select location
                      </p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-white/80 mb-2">
                        Status
                      </label>
                      <select
                        value={form.status}
                        onChange={(e) =>
                          setForm({ ...form, status: e.target.value })
                        }
                        className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-cyan-400"
                      >
                        <option value="NOT_STARTED">Not Started</option>
                        <option value="IN_PROGRESS">In Progress</option>
                        <option value="COMPLETED">Completed</option>
                      </select>
                    </div>

                    {/* Resource Requirements Section */}
                    <div className="border-t border-white/10 pt-4">
                      <h3 className="text-lg font-semibold mb-4 text-cyan-300 flex items-center space-x-2">
                        <Users className="w-5 h-5" />
                        <span>Resource Requirements</span>
                      </h3>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-white/80 mb-2">
                            Manpower Required
                          </label>
                          <input
                            type="number"
                            placeholder="e.g., 50"
                            value={form.manpowerRequired}
                            onChange={(e) =>
                              setForm({
                                ...form,
                                manpowerRequired: e.target.value,
                              })
                            }
                            className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-cyan-400"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-white/80 mb-2">
                            Manpower Assigned
                          </label>
                          <input
                            type="number"
                            placeholder="e.g., 35"
                            value={form.manpowerAssigned}
                            onChange={(e) =>
                              setForm({
                                ...form,
                                manpowerAssigned: e.target.value,
                              })
                            }
                            className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-cyan-400"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-white/80 mb-2">
                            Budget ($)
                          </label>
                          <input
                            type="number"
                            placeholder="e.g., 500000"
                            value={form.budget}
                            onChange={(e) =>
                              setForm({ ...form, budget: e.target.value })
                            }
                            className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-cyan-400"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-white/80 mb-2">
                            Current Expenses ($)
                          </label>
                          <input
                            type="number"
                            placeholder="e.g., 125000"
                            value={form.expenses}
                            onChange={(e) =>
                              setForm({ ...form, expenses: e.target.value })
                            }
                            className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-cyan-400"
                          />
                        </div>

                        <div className="col-span-2">
                          <label className="block text-sm font-medium text-white/80 mb-2">
                            Estimated Days to Complete
                          </label>
                          <input
                            type="number"
                            placeholder="e.g., 180"
                            value={form.estimatedDays}
                            onChange={(e) =>
                              setForm({
                                ...form,
                                estimatedDays: e.target.value,
                              })
                            }
                            className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-cyan-400"
                          />
                        </div>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-white/80 mb-2">
                        Description
                      </label>
                      <textarea
                        placeholder="Describe the project details..."
                        value={form.description}
                        onChange={(e) =>
                          setForm({ ...form, description: e.target.value })
                        }
                        className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-cyan-400 resize-none h-32"
                        rows={4}
                      />
                    </div>

                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={handleCreateProject}
                      disabled={saving || !form.title || !form.location}
                      className="w-full bg-gradient-to-r from-cyan-400 to-blue-600 text-white py-4 rounded-xl font-medium flex items-center justify-center space-x-2 shadow-lg hover:shadow-xl transition disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {saving ? (
                        <Loader2 className="w-5 h-5 animate-spin" />
                      ) : (
                        <Plus className="w-5 h-5" />
                      )}
                      <span>{saving ? "Creating..." : "Create Project"}</span>
                    </motion.button>
                  </div>
                </div>

                <div className="bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20 overflow-hidden shadow-xl h-96 lg:h-auto">
                  <div className="p-4 bg-white/5 border-b border-white/10">
                    <h3 className="font-semibold text-white flex items-center space-x-2">
                      <Map className="w-5 h-5 text-cyan-400" />
                      <span>Select Project Location</span>
                    </h3>
                  </div>
                  <MapContainer
                    center={[42.35, 13.4]}
                    zoom={10}
                    style={{ height: "100%", width: "100%" }}
                  >
                    <TileLayer
                      url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                      attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    />
                    <MapClickHandler />
                    {location && (
                      <Marker position={[location.lat, location.lng]}>
                        <Popup>
                          <div className="text-gray-800">
                            <strong>Selected Location</strong>
                            <br />
                            Lat: {location.lat.toFixed(6)}
                            <br />
                            Lng: {location.lng.toFixed(6)}
                          </div>
                        </Popup>
                      </Marker>
                    )}
                  </MapContainer>
                </div>
              </div>
            </motion.div>
          )}

          {/* MY PROJECTS */}
          {activeTab === "my-projects" && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="space-y-6"
            >
              <div className="flex justify-between items-center">
                <h2 className="text-3xl font-bold flex items-center space-x-3">
                  <HardHat className="w-8 h-8 text-amber-400" />
                  <span>My Projects</span>
                </h2>
                <div className="text-white/60">
                  {projects.length} project{projects.length !== 1 ? "s" : ""}
                </div>
              </div>

              <div className="space-y-4">
                {projects.length === 0 ? (
                  <div className="text-center py-16 bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20">
                    <Building2 className="w-16 h-16 text-white/40 mx-auto mb-4" />
                    <p className="text-xl text-white/60 mb-2">
                      No projects yet
                    </p>
                    <p className="text-white/40">
                      Create your first project to get started
                    </p>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setActiveTab("create")}
                      className="mt-4 bg-gradient-to-r from-cyan-400 to-blue-600 text-white px-6 py-3 rounded-xl font-medium"
                    >
                      Create Project
                    </motion.button>
                  </div>
                ) : (
                  projects.map((project) => (
                    <motion.div
                      key={project.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20 overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-300"
                    >
                      {/* Project Header */}
                      <div
                        className="p-6 cursor-pointer hover:bg-white/5 transition-colors duration-300"
                        onClick={() => toggleProjectExpansion(project.id)}
                      >
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <div className="flex items-center space-x-3 mb-3">
                              <h3 className="text-xl font-bold text-white">
                                {project.title}
                              </h3>
                              <span
                                className={`px-3 py-1 rounded-full text-xs font-medium bg-gradient-to-r ${getStatusColor(
                                  project.status
                                )}`}
                              >
                                {getStatusText(project.status)}
                              </span>
                              {project.delayStatus &&
                                project.delayStatus !== "ON_TRACK" &&
                                project.delayStatus !== "COMPLETED" && (
                                  <span className="px-3 py-1 bg-red-500/20 text-red-300 rounded-full text-xs font-medium flex items-center space-x-1">
                                    <AlertTriangle className="w-3 h-3" />
                                    <span>Delayed {project.delayDays}d</span>
                                  </span>
                                )}
                              {!project.approved && (
                                <span className="px-3 py-1 bg-amber-500/20 text-amber-300 rounded-full text-xs font-medium">
                                  PENDING APPROVAL
                                </span>
                              )}
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm text-white/70">
                              <div className="flex items-center space-x-2">
                                <MapPin className="w-4 h-4 text-cyan-400" />
                                <span>{project.location}</span>
                              </div>
                              <div className="flex items-center space-x-2">
                                <Calendar className="w-4 h-4 text-amber-400" />
                                <span>
                                  Created: {formatDate(project.createdAt)}
                                </span>
                              </div>
                              <div className="flex items-center space-x-2">
                                <MessageSquare className="w-4 h-4 text-green-400" />
                                <span>
                                  {project.comments?.length || 0} comments
                                </span>
                              </div>
                              <div className="flex items-center space-x-2">
                                <Target className="w-4 h-4 text-purple-400" />
                                <span>
                                  {project.completionPercentage?.toFixed(1) ||
                                    0}
                                  % complete
                                </span>
                              </div>
                            </div>

                            {project.description && (
                              <p className="mt-3 text-white/80 text-sm leading-relaxed">
                                {project.description}
                              </p>
                            )}

                            {/* Quick Resource Stats */}
                            <div className="mt-4 flex flex-wrap gap-4 text-xs">
                              <div className="flex items-center space-x-1 bg-white/5 px-3 py-1 rounded-full">
                                <Users className="w-3 h-3 text-blue-400" />
                                <span className="text-white/70">Manpower:</span>
                                <span className="text-white font-medium">
                                  {project.manpowerAssigned || 0}/
                                  {project.manpowerRequired || 0}
                                </span>
                              </div>
                              <div className="flex items-center space-x-1 bg-white/5 px-3 py-1 rounded-full">
                                <DollarSign className="w-3 h-3 text-green-400" />
                                <span className="text-white/70">Budget:</span>
                                <span className="text-white font-medium">
                                  {formatCurrency(project.expenses)}/
                                  {formatCurrency(project.budget)}
                                </span>
                              </div>
                              <div className="flex items-center space-x-1 bg-white/5 px-3 py-1 rounded-full">
                                <Clock className="w-3 h-3 text-amber-400" />
                                <span className="text-white/70">Timeline:</span>
                                <span className="text-white font-medium">
                                  {project.daysSpent || 0}/
                                  {project.estimatedDays || 0} days
                                </span>
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center space-x-2 ml-4">
                            {/* Status Update Dropdown */}
                            <div className="relative">
                              <select
                                value={project.status}
                                onChange={(e) => {
                                  const newStatus = e.target.value;
                                  handleUpdateStatus(project.id, newStatus);
                                }}
                                disabled={updatingStatus}
                                className={`px-3 py-2 bg-white/10 rounded-lg text-sm text-white border border-white/20 focus:outline-none focus:ring-2 focus:ring-cyan-400 disabled:opacity-50 disabled:cursor-wait ${
                                  project.status === "COMPLETED"
                                    ? "border-green-500/50"
                                    : project.status === "IN_PROGRESS"
                                    ? "border-amber-500/50"
                                    : "border-red-500/50"
                                }`}
                                onClick={(e) => e.stopPropagation()}
                              >
                                <option
                                  value="NOT_STARTED"
                                  className="bg-gray-800"
                                >
                                  🔴 Not Started
                                </option>
                                <option
                                  value="IN_PROGRESS"
                                  className="bg-gray-800"
                                >
                                  🟡 In Progress
                                </option>
                                <option
                                  value="COMPLETED"
                                  className="bg-gray-800"
                                >
                                  🟢 Completed
                                </option>
                              </select>
                              {updatingStatus && (
                                <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-lg">
                                  <Loader2 className="w-4 h-4 animate-spin text-cyan-400" />
                                </div>
                              )}
                            </div>

                            {/* Report Delay Button - Only for In Progress projects */}
                            {project.status === "IN_PROGRESS" && (
                              <motion.button
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setSelectedDelayProject(project);
                                  setShowDelayModal(true);
                                }}
                                className="p-2 text-orange-400 hover:bg-orange-500/20 rounded-lg transition"
                                title="Report Delay"
                              >
                                <AlertTriangle className="w-5 h-5" />
                              </motion.button>
                            )}

                            {/* View Timeline Button */}
                            <motion.button
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                              onClick={(e) => {
                                e.stopPropagation();
                                fetchTimelineData(project.id);
                              }}
                              className="p-2 text-purple-400 hover:bg-purple-500/20 rounded-lg transition"
                              title="View Timeline"
                            >
                              <Watch className="w-5 h-5" />
                            </motion.button>

                            <motion.button
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedProject(project);
                              }}
                              className="p-2 text-cyan-300 hover:bg-cyan-500/20 rounded-lg transition"
                              title="Edit Project"
                            >
                              <Edit className="w-5 h-5" />
                            </motion.button>
                            <motion.button
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteProject(project.id);
                              }}
                              className="p-2 text-red-400 hover:bg-red-500/20 rounded-lg transition"
                              title="Delete Project"
                            >
                              <Trash2 className="w-5 h-5" />
                            </motion.button>
                            <motion.div
                              animate={{
                                rotate:
                                  expandedProject === project.id ? 180 : 0,
                              }}
                              transition={{ duration: 0.3 }}
                              className="text-white/60"
                            >
                              <ChevronDown className="w-5 h-5" />
                            </motion.div>
                          </div>
                        </div>
                      </div>

                      {/* Expandable Content */}
                      <AnimatePresence>
                        {expandedProject === project.id && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            exit={{ opacity: 0, height: 0 }}
                            transition={{ duration: 0.3 }}
                            className="border-t border-white/10"
                          >
                            <div className="p-6">
                              {/* Resource Details Grid */}
                              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                                <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                                  <h5 className="text-sm font-medium text-cyan-300 mb-3 flex items-center space-x-2">
                                    <Users className="w-4 h-4" />
                                    <span>Manpower Status</span>
                                  </h5>
                                  <div className="space-y-2">
                                    <div className="flex justify-between text-sm">
                                      <span className="text-white/60">
                                        Required:
                                      </span>
                                      <span className="text-white font-medium">
                                        {project.manpowerRequired || 0}
                                      </span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                      <span className="text-white/60">
                                        Assigned:
                                      </span>
                                      <span className="text-white font-medium">
                                        {project.manpowerAssigned || 0}
                                      </span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                      <span className="text-white/60">
                                        Shortage:
                                      </span>
                                      <span
                                        className={`font-medium ${
                                          project.manpowerRequired -
                                            project.manpowerAssigned >
                                          0
                                            ? "text-red-400"
                                            : "text-green-400"
                                        }`}
                                      >
                                        {Math.max(
                                          0,
                                          (project.manpowerRequired || 0) -
                                            (project.manpowerAssigned || 0)
                                        )}
                                      </span>
                                    </div>
                                  </div>
                                </div>

                                <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                                  <h5 className="text-sm font-medium text-green-300 mb-3 flex items-center space-x-2">
                                    <DollarSign className="w-4 h-4" />
                                    <span>Budget Status</span>
                                  </h5>
                                  <div className="space-y-2">
                                    <div className="flex justify-between text-sm">
                                      <span className="text-white/60">
                                        Total Budget:
                                      </span>
                                      <span className="text-white font-medium">
                                        {formatCurrency(project.budget)}
                                      </span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                      <span className="text-white/60">
                                        Expenses:
                                      </span>
                                      <span className="text-white font-medium">
                                        {formatCurrency(project.expenses)}
                                      </span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                      <span className="text-white/60">
                                        Remaining:
                                      </span>
                                      <span
                                        className={`font-medium ${
                                          project.budget - project.expenses < 0
                                            ? "text-red-400"
                                            : "text-green-400"
                                        }`}
                                      >
                                        {formatCurrency(
                                          (project.budget || 0) -
                                            (project.expenses || 0)
                                        )}
                                      </span>
                                    </div>
                                  </div>
                                </div>

                                <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                                  <h5 className="text-sm font-medium text-amber-300 mb-3 flex items-center space-x-2">
                                    <Clock className="w-4 h-4" />
                                    <span>Timeline Status</span>
                                  </h5>
                                  <div className="space-y-2">
                                    <div className="flex justify-between text-sm">
                                      <span className="text-white/60">
                                        Estimated Days:
                                      </span>
                                      <span className="text-white font-medium">
                                        {project.estimatedDays || 0}
                                      </span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                      <span className="text-white/60">
                                        Days Spent:
                                      </span>
                                      <span className="text-white font-medium">
                                        {project.daysSpent || 0}
                                      </span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                      <span className="text-white/60">
                                        Progress:
                                      </span>
                                      <span
                                        className={`font-medium ${
                                          (project.completionPercentage || 0) >=
                                          100
                                            ? "text-green-400"
                                            : (project.completionPercentage ||
                                                0) >= 50
                                            ? "text-amber-400"
                                            : "text-red-400"
                                        }`}
                                      >
                                        {project.completionPercentage?.toFixed(
                                          1
                                        ) || 0}
                                        %
                                      </span>
                                    </div>
                                  </div>
                                </div>
                              </div>

                              {/* Project Details & Map */}
                              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                                <div className="space-y-6">
                                  <div>
                                    <h4 className="text-lg font-semibold mb-3 text-cyan-300">
                                      Project Details
                                    </h4>
                                    <div className="space-y-2 text-sm">
                                      <div className="flex justify-between">
                                        <span className="text-white/60">
                                          Project ID:
                                        </span>
                                        <span className="text-white">
                                          {project.id}
                                        </span>
                                      </div>
                                      <div className="flex justify-between">
                                        <span className="text-white/60">
                                          Coordinates:
                                        </span>
                                        <span className="text-white">
                                          {project.latitude?.toFixed(6)},{" "}
                                          {project.longitude?.toFixed(6)}
                                        </span>
                                      </div>
                                      <div className="flex justify-between">
                                        <span className="text-white/60">
                                          Approval Status:
                                        </span>
                                        <span
                                          className={
                                            project.approved
                                              ? "text-green-400"
                                              : "text-amber-400"
                                          }
                                        >
                                          {project.approved
                                            ? "Approved"
                                            : "Pending Approval"}
                                        </span>
                                      </div>
                                      {project.delayStatus &&
                                        project.delayStatus !== "ON_TRACK" &&
                                        project.delayStatus !== "COMPLETED" && (
                                          <div className="mt-2 p-3 bg-red-500/10 rounded-lg border border-red-500/20">
                                            <div className="flex items-start space-x-2">
                                              <AlertTriangle className="w-4 h-4 text-red-400 mt-0.5" />
                                              <div>
                                                <p className="text-sm font-medium text-red-400">
                                                  Delay Status:{" "}
                                                  {project.delayStatus.replace(
                                                    "_",
                                                    " "
                                                  )}{" "}
                                                  ({project.delayDays} days)
                                                </p>
                                                {project.delayReason && (
                                                  <p className="text-xs text-red-300 mt-1">
                                                    Reason:{" "}
                                                    {project.delayReason}
                                                  </p>
                                                )}
                                              </div>
                                            </div>
                                          </div>
                                        )}
                                    </div>
                                  </div>

                                  {/* Project Area */}
                                  <div>
                                    <h4 className="text-lg font-semibold mb-3 text-green-300">
                                      Project Area
                                    </h4>

                                    <motion.button
                                      whileHover={{ scale: 1.03 }}
                                      whileTap={{ scale: 0.97 }}
                                      onClick={() =>
                                        setDrawingMode(
                                          drawingMode === project.id
                                            ? null
                                            : project.id
                                        )
                                      }
                                      className="mb-3 flex items-center space-x-2 px-4 py-2 bg-cyan-600/20 text-cyan-300 rounded-lg hover:bg-cyan-600/30 transition text-sm font-medium"
                                    >
                                      <Edit className="w-4 h-4" />
                                      <span>
                                        {drawingMode === project.id
                                          ? "Finish Drawing"
                                          : "Draw Area on Map"}
                                      </span>
                                    </motion.button>

                                    <label className="flex items-center space-x-3 cursor-pointer text-cyan-300 hover:text-cyan-200 p-3 bg-white/5 rounded-lg border border-white/10 transition text-sm">
                                      <Upload className="w-5 h-5" />
                                      <span>
                                        {uploading
                                          ? "Uploading..."
                                          : "Upload GeoJSON (optional)"}
                                      </span>
                                      <input
                                        type="file"
                                        accept=".json,.geojson"
                                        onChange={handleGeoJSONUpload}
                                        className="hidden"
                                        disabled={uploading}
                                      />
                                    </label>

                                    {project.geoJson && (
                                      <p className="text-sm text-green-400 mt-2 flex items-center">
                                        <FileText className="w-4 h-4 mr-2" />
                                        Area defined on map
                                      </p>
                                    )}
                                  </div>
                                </div>

                                {/* Map with Draw Tool */}
                                <div>
                                  <h4 className="text-lg font-semibold mb-3 text-purple-300 flex items-center space-x-2">
                                    <Map className="w-5 h-5" />
                                    <span>Project Location</span>
                                  </h4>
                                  <div className="h-64 rounded-lg overflow-hidden border border-white/20">
                                    <MapContainer
                                      key={`${project.id}-${drawingMode}`}
                                      center={[
                                        project.latitude,
                                        project.longitude,
                                      ]}
                                      zoom={15}
                                      style={{ height: "100%", width: "100%" }}
                                      scrollWheelZoom={false}
                                    >
                                      <TileLayer
                                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                                      />
                                      <Marker
                                        position={[
                                          project.latitude,
                                          project.longitude,
                                        ]}
                                        icon={customIcon(project.status)}
                                      >
                                        <Popup>
                                          <div className="text-gray-800">
                                            <strong>{project.title}</strong>
                                            <br />
                                            Status:{" "}
                                            {getStatusText(project.status)}
                                            <br />
                                            {project.location}
                                          </div>
                                        </Popup>
                                      </Marker>

                                      {(() => {
                                        const geoJson = parseGeoJson(
                                          project.geoJson
                                        );
                                        const polys =
                                          getAllPolygonCoordinates(geoJson);
                                        const color =
                                          project.status === "COMPLETED"
                                            ? "#10b981"
                                            : project.status === "IN_PROGRESS"
                                            ? "#f59e0b"
                                            : "#ef4444";

                                        return polys.map((coords, i) => (
                                          <Polygon
                                            key={i}
                                            positions={coords}
                                            pathOptions={{
                                              color,
                                              fillColor: color,
                                              fillOpacity: 0.15,
                                              weight: 2,
                                            }}
                                          />
                                        ));
                                      })()}

                                      {drawingMode === project.id && (
                                        <FeatureGroup>
                                          <EditControl
                                            position="topleft"
                                            onCreated={(e) => {
                                              const layer = e.layer;
                                              const geo = layer.toGeoJSON();
                                              saveDrawnPolygon(project.id, geo);
                                              setDrawingMode(null);
                                            }}
                                            onEdited={(e) => {
                                              e.layers.eachLayer((l) => {
                                                saveDrawnPolygon(
                                                  project.id,
                                                  l.toGeoJSON()
                                                );
                                              });
                                            }}
                                            onDeleted={() => {
                                              api
                                                .put(
                                                  `/api/projects/update-geojson/${project.id}`,
                                                  { geoJson: "" }
                                                )
                                                .then((res) => {
                                                  const upd = res.data.project;
                                                  setProjects((prev) =>
                                                    prev.map((p) =>
                                                      p.id === upd.id ? upd : p
                                                    )
                                                  );
                                                  if (
                                                    selectedProject?.id ===
                                                    project.id
                                                  )
                                                    setSelectedProject(upd);
                                                })
                                                .catch(() =>
                                                  alert(
                                                    "Failed to remove area."
                                                  )
                                                );
                                            }}
                                            draw={{
                                              rectangle: false,
                                              circle: false,
                                              circlemarker: false,
                                              marker: false,
                                              polyline: false,
                                              polygon: {
                                                shapeOptions: {
                                                  color: "#f59e0b",
                                                  fillOpacity: 0.2,
                                                },
                                              },
                                            }}
                                          />
                                        </FeatureGroup>
                                      )}
                                    </MapContainer>
                                  </div>
                                </div>
                              </div>

                              {/* Comments Section */}
                              <div>
                                <h4 className="text-lg font-semibold mb-3 flex items-center space-x-2 text-purple-300">
                                  <MessageSquare className="w-5 h-5" />
                                  <span>
                                    Comments ({project.comments?.length || 0})
                                  </span>
                                </h4>

                                <div className="flex space-x-3 mb-4">
                                  <input
                                    type="text"
                                    placeholder="Add a comment..."
                                    value={commentInputs[project.id] || ""}
                                    onChange={(e) =>
                                      setCommentInputs((prev) => ({
                                        ...prev,
                                        [project.id]: e.target.value,
                                      }))
                                    }
                                    onKeyPress={(e) =>
                                      e.key === "Enter" &&
                                      handleAddComment(project.id)
                                    }
                                    className="flex-1 px-4 py-3 bg-white/10 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-cyan-400 border border-white/20"
                                  />
                                  <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={() => handleAddComment(project.id)}
                                    className="px-6 py-3 bg-gradient-to-r from-cyan-400 to-blue-600 rounded-lg transition flex items-center space-x-2 font-medium"
                                  >
                                    <Send className="w-5 h-5" />
                                    <span>Send</span>
                                  </motion.button>
                                </div>

                                <div className="space-y-3">
                                  {(project.comments || []).length === 0 ? (
                                    <div className="text-center py-6 text-white/50">
                                      <MessageSquare className="w-12 h-12 mx-auto mb-3 opacity-50" />
                                      <p>No comments yet</p>
                                    </div>
                                  ) : (
                                    project.comments.map((comment, index) => (
                                      <motion.div
                                        key={comment.id}
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: index * 0.1 }}
                                        className="bg-white/5 rounded-lg p-4 border border-white/10"
                                      >
                                        <div className="flex justify-between items-start mb-2">
                                          <div className="flex items-center space-x-2">
                                            <User className="w-4 h-4 text-amber-400" />
                                            <span className="font-medium text-white">
                                              {comment.author?.username ||
                                                "You"}
                                            </span>
                                          </div>
                                          <span className="text-xs text-white/50">
                                            {formatDate(comment.createdAt)}
                                          </span>
                                        </div>
                                        <p className="text-white/80 text-sm leading-relaxed">
                                          {comment.text}
                                        </p>
                                      </motion.div>
                                    ))
                                  )}
                                </div>
                              </div>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </motion.div>
                  ))
                )}
              </div>
            </motion.div>
          )}

          {/* DELAYED PROJECTS */}
          {activeTab === "delayed-projects" && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="space-y-6"
            >
              <h2 className="text-3xl font-bold flex items-center space-x-3">
                <AlertTriangle className="w-8 h-8 text-red-400" />
                <span>Delayed Projects</span>
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-white/60 text-sm">Total Delayed</p>
                      <p className="text-3xl font-bold text-white">
                        {delayedProjects?.totalDelayed || 0}
                      </p>
                    </div>
                    <div className="w-12 h-12 bg-red-500/20 rounded-xl flex items-center justify-center">
                      <AlertTriangle className="w-6 h-6 text-red-400" />
                    </div>
                  </div>
                </div>

                <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-white/60 text-sm">
                        Critically Delayed
                      </p>
                      <p className="text-3xl font-bold text-red-400">
                        {delayedProjects?.criticallyDelayed || 0}
                      </p>
                    </div>
                    <div className="w-12 h-12 bg-red-600/20 rounded-xl flex items-center justify-center">
                      <AlertCircle className="w-6 h-6 text-red-500" />
                    </div>
                  </div>
                </div>

                <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-white/60 text-sm">Slightly Delayed</p>
                      <p className="text-3xl font-bold text-yellow-400">
                        {delayedProjects?.slightlyDelayed || 0}
                      </p>
                    </div>
                    <div className="w-12 h-12 bg-yellow-500/20 rounded-xl flex items-center justify-center">
                      <Activity className="w-6 h-6 text-yellow-400" />
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                {delayedProjects?.delayedProjects?.map((project) => (
                  <motion.div
                    key={project.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20 overflow-hidden shadow-xl"
                  >
                    <div className="p-6">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-3">
                            <h3 className="text-xl font-bold text-white">
                              {project.title}
                            </h3>
                            <span
                              className={`px-3 py-1 rounded-full text-xs font-medium ${getDelayStatusColor(
                                project.delayStatus
                              )} bg-opacity-20`}
                            >
                              {project.delayStatus?.replace("_", " ")}
                            </span>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm text-white/70 mb-4">
                            <div className="flex items-center space-x-2">
                              <MapPin className="w-4 h-4 text-cyan-400" />
                              <span>{project.location}</span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Clock className="w-4 h-4 text-amber-400" />
                              <span>Delayed: {project.delayDays} days</span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Target className="w-4 h-4 text-purple-400" />
                              <span>
                                {project.completionPercentage?.toFixed(1)}%
                                complete
                              </span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Calendar className="w-4 h-4 text-green-400" />
                              <span>
                                Started: {formatDate(project.startedAt)}
                              </span>
                            </div>
                          </div>

                          {project.delayReason && (
                            <div className="mt-3 p-3 bg-red-500/10 rounded-lg border border-red-500/20">
                              <p className="text-sm text-red-300">
                                <span className="font-medium">
                                  Delay Reason:
                                </span>{" "}
                                {project.delayReason}
                              </p>
                            </div>
                          )}

                          <div className="mt-4 flex space-x-3">
                            <motion.button
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              onClick={() => {
                                setSelectedDelayProject(project);
                                setShowDelayModal(true);
                              }}
                              className="px-4 py-2 bg-orange-500/20 text-orange-300 rounded-lg hover:bg-orange-500/30 transition text-sm font-medium flex items-center space-x-2"
                            >
                              <AlertTriangle className="w-4 h-4" />
                              <span>Update Delay Reason</span>
                            </motion.button>

                            <motion.button
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              onClick={() => fetchTimelineData(project.id)}
                              className="px-4 py-2 bg-purple-500/20 text-purple-300 rounded-lg hover:bg-purple-500/30 transition text-sm font-medium flex items-center space-x-2"
                            >
                              <Watch className="w-4 h-4" />
                              <span>View Timeline</span>
                            </motion.button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}

                {(!delayedProjects?.delayedProjects ||
                  delayedProjects.delayedProjects.length === 0) && (
                  <div className="text-center py-16 bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20">
                    <CheckCircle className="w-16 h-16 text-green-400 mx-auto mb-4" />
                    <p className="text-xl text-white/60 mb-2">
                      No Delayed Projects
                    </p>
                    <p className="text-white/40">
                      All your projects are on track!
                    </p>
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {/* PROFILE */}
          {activeTab === "profile" && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="max-w-4xl mx-auto"
            >
              <h2 className="text-3xl font-bold flex items-center space-x-3 justify-center mb-8">
                <User className="w-8 h-8 text-cyan-400" />
                <span>Profile</span>
              </h2>

              {profileLoading ? (
                <div className="flex justify-center py-16">
                  <Loader2 className="w-10 h-10 text-cyan-400 animate-spin" />
                </div>
              ) : profile ? (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  <div className="lg:col-span-1">
                    <div className="bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20 p-6 shadow-xl">
                      <div className="text-center">
                        <div className="w-32 h-32 bg-gradient-to-br from-cyan-400 to-blue-600 rounded-full mx-auto flex items-center justify-center shadow-2xl mb-6">
                          <User className="w-16 h-16 text-white" />
                        </div>
                        <h3 className="text-2xl font-bold text-white mb-2">
                          {profile.username}
                        </h3>
                        <div className="px-4 py-2 bg-cyan-500/20 text-cyan-300 rounded-full text-sm font-medium inline-block mb-4">
                          {profile.role}
                        </div>

                        <div className="space-y-3 text-left">
                          <div className="flex items-center space-x-3 text-white/80">
                            <Mail className="w-5 h-5 text-cyan-400" />
                            <span className="text-sm">{profile.email}</span>
                          </div>
                          <div className="flex items-center space-x-3 text-white/80">
                            <Shield className="w-5 h-5 text-green-400" />
                            <span className="text-sm">Field Officer</span>
                          </div>
                          <div className="flex items-center space-x-3 text-white/80">
                            <Calendar className="w-5 h-5 text-purple-400" />
                            <span className="text-sm">Active User</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20 p-6 mt-6 shadow-xl">
                      <h4 className="text-lg font-semibold mb-4 text-white flex items-center space-x-2">
                        <BarChart3 className="w-5 h-5 text-cyan-400" />
                        <span>Quick Stats</span>
                      </h4>
                      <div className="space-y-3">
                        <div className="flex justify-between items-center">
                          <span className="text-white/70">Total Projects</span>
                          <span className="text-cyan-400 font-bold">
                            {projects.length}
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-white/70">In Progress</span>
                          <span className="text-amber-400 font-bold">
                            {
                              projects.filter((p) => p.status === "IN_PROGRESS")
                                .length
                            }
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-white/70">Completed</span>
                          <span className="text-green-400 font-bold">
                            {
                              projects.filter((p) => p.status === "COMPLETED")
                                .length
                            }
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-white/70">Delayed</span>
                          <span className="text-red-400 font-bold">
                            {delayedProjects?.totalDelayed || 0}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="lg:col-span-2">
                    <div className="bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20 p-6 shadow-xl">
                      <h4 className="text-xl font-semibold mb-6 text-white">
                        Edit Profile
                      </h4>

                      <div className="space-y-6">
                        <div>
                          <label className="block text-sm font-medium text-white/80 mb-2">
                            Username
                          </label>
                          <input
                            type="text"
                            value={profileEdit.username}
                            onChange={(e) =>
                              setProfileEdit({
                                ...profileEdit,
                                username: e.target.value,
                              })
                            }
                            className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-cyan-400 transition"
                            placeholder="Enter your username"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-white/80 mb-2">
                            Email
                          </label>
                          <input
                            type="email"
                            value={profileEdit.email}
                            onChange={(e) =>
                              setProfileEdit({
                                ...profileEdit,
                                email: e.target.value,
                              })
                            }
                            className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-cyan-400 transition"
                            placeholder="Enter your email"
                          />
                        </div>

                        <div>
                          <button
                            type="button"
                            onClick={() =>
                              setShowPasswordFields(!showPasswordFields)
                            }
                            className="text-cyan-400 hover:text-cyan-300 text-sm font-medium flex items-center space-x-2 transition"
                          >
                            <span>
                              {showPasswordFields ? "Hide" : "Change"} Password
                            </span>
                            {showPasswordFields ? (
                              <EyeOff className="w-4 h-4" />
                            ) : (
                              <Eye className="w-4 h-4" />
                            )}
                          </button>

                          {showPasswordFields && (
                            <div className="mt-3 space-y-3">
                              <div className="relative">
                                <input
                                  type={showPassword ? "text" : "password"}
                                  value={profileEdit.password}
                                  onChange={(e) =>
                                    setProfileEdit({
                                      ...profileEdit,
                                      password: e.target.value,
                                    })
                                  }
                                  placeholder="Enter new password"
                                  className="w-full px-4 py-3 pr-12 bg-white/5 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-cyan-400 transition"
                                />
                                <button
                                  type="button"
                                  onClick={() => setShowPassword(!showPassword)}
                                  className="absolute right-3 top-1/2 -translate-y-1/2 text-white/70 hover:text-white transition"
                                >
                                  {showPassword ? (
                                    <EyeOff className="w-5 h-5" />
                                  ) : (
                                    <Eye className="w-5 h-5" />
                                  )}
                                </button>
                              </div>
                              <p className="text-xs text-cyan-400">
                                Leave blank to keep current password
                              </p>
                            </div>
                          )}
                        </div>

                        <motion.button
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={handleProfileUpdate}
                          disabled={profileSaving}
                          className="w-full bg-gradient-to-r from-cyan-400 to-blue-600 text-white py-4 rounded-xl font-medium flex items-center justify-center space-x-2 shadow-lg hover:shadow-xl transition disabled:opacity-50"
                        >
                          {profileSaving ? (
                            <Loader2 className="w-6 h-6 animate-spin" />
                          ) : (
                            <Save className="w-6 h-6" />
                          )}
                          <span>
                            {profileSaving ? "Saving..." : "Update Profile"}
                          </span>
                        </motion.button>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-16 bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20">
                  <AlertCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
                  <p className="text-xl text-red-400 mb-2">
                    Failed to load profile
                  </p>
                  <p className="text-white/60">Please try logging in again</p>
                </div>
              )}
            </motion.div>
          )}
        </div>
      </div>

      {/* CHATBOT */}
      {/* Chat Button */}
      {!chatOpen && (
        <motion.button
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => setChatOpen(true)}
          className="fixed bottom-6 right-6 bg-gradient-to-r from-cyan-400 to-blue-600 text-white p-4 rounded-full shadow-2xl z-50 group"
        >
          <Bot className="w-6 h-6" />
          <span className="absolute top-0 right-0 w-3 h-3 bg-green-400 rounded-full border-2 border-white"></span>
        </motion.button>
      )}

      {/* Chat Window */}
      <AnimatePresence>
        {chatOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{
              opacity: 1,
              y: 0,
              scale: 1,
              height: chatMinimized ? "auto" : "500px",
              width: chatMinimized ? "300px" : "380px",
            }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="fixed bottom-6 right-6 bg-gray-900 rounded-2xl shadow-2xl border border-white/20 overflow-hidden z-50 flex flex-col"
            style={{
              boxShadow: "0 20px 60px rgba(0,0,0,0.5)",
              backdropFilter: "blur(10px)",
            }}
          >
            {/* Chat Header */}
            <div className="bg-gradient-to-r from-cyan-500 to-blue-600 p-4 flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
                  <Bot className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-white">
                    Project Assistant
                  </h3>
                  <p className="text-xs text-white/80">
                    Ask me about your projects
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setChatMinimized(!chatMinimized)}
                  className="p-1 hover:bg-white/20 rounded-lg transition"
                >
                  {chatMinimized ? (
                    <Maximize2 className="w-4 h-4 text-white" />
                  ) : (
                    <Minimize2 className="w-4 h-4 text-white" />
                  )}
                </button>
                <button
                  onClick={() => setChatOpen(false)}
                  className="p-1 hover:bg-white/20 rounded-lg transition"
                >
                  <X className="w-4 h-4 text-white" />
                </button>
              </div>
            </div>

            {/* Chat Messages */}
            {!chatMinimized && (
              <>
                <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-900/90">
                  {chatMessages.map((message) => (
                    <motion.div
                      key={message.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`flex ${
                        message.sender === "user"
                          ? "justify-end"
                          : "justify-start"
                      }`}
                    >
                      <div
                        className={`flex max-w-[80%] ${
                          message.sender === "user"
                            ? "flex-row-reverse"
                            : "flex-row"
                        } items-end space-x-2 space-x-reverse`}
                      >
                        <div
                          className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 ${
                            message.sender === "user"
                              ? "bg-gradient-to-r from-cyan-400 to-blue-600"
                              : "bg-gradient-to-r from-purple-400 to-pink-600"
                          }`}
                        >
                          {message.sender === "user" ? (
                            <User className="w-4 h-4 text-white" />
                          ) : (
                            <Bot className="w-4 h-4 text-white" />
                          )}
                        </div>
                        <div
                          className={`rounded-2xl px-4 py-2 ${
                            message.sender === "user"
                              ? "bg-gradient-to-r from-cyan-400 to-blue-600 text-white"
                              : "bg-white/10 text-white border border-white/20"
                          }`}
                        >
                          <p className="text-sm whitespace-pre-wrap">
                            {message.text}
                          </p>
                          <p
                            className={`text-[10px] mt-1 ${
                              message.sender === "user"
                                ? "text-white/70"
                                : "text-white/50"
                            }`}
                          >
                            {formatChatTimestamp(message.timestamp)}
                          </p>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                  {chatLoading && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="flex justify-start"
                    >
                      <div className="flex items-center space-x-2">
                        <div className="w-7 h-7 rounded-full bg-gradient-to-r from-purple-400 to-pink-600 flex items-center justify-center">
                          <Bot className="w-4 h-4 text-white" />
                        </div>
                        <div className="bg-white/10 rounded-2xl px-4 py-3 border border-white/20">
                          <Loader2 className="w-4 h-4 animate-spin text-cyan-400" />
                        </div>
                      </div>
                    </motion.div>
                  )}
                  <div ref={chatMessagesEndRef} />
                </div>

                {/* Chat Input */}
                <div className="p-4 border-t border-white/10 bg-gray-900/90">
                  <div className="flex items-center space-x-2">
                    <input
                      ref={chatInputRef}
                      type="text"
                      value={chatInput}
                      onChange={(e) => setChatInput(e.target.value)}
                      onKeyPress={handleChatKeyPress}
                      placeholder="Ask about projects..."
                      className="flex-1 px-4 py-2 bg-white/5 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-cyan-400 text-sm"
                      disabled={chatLoading}
                    />
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={handleChatSend}
                      disabled={!chatInput.trim() || chatLoading}
                      className="p-2 bg-gradient-to-r from-cyan-400 to-blue-600 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Send className="w-5 h-5" />
                    </motion.button>
                  </div>
                  <p className="text-xs text-white/40 mt-2">
                    Ask about project status, budgets, delays, timelines, etc.
                  </p>
                </div>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Delay Report Modal */}
      <AnimatePresence>
        {showDelayModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70"
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-gray-900 rounded-2xl border border-white/20 p-6 max-w-md w-full shadow-2xl"
            >
              <h3 className="text-xl font-bold mb-4 flex items-center space-x-2">
                <AlertTriangle className="w-6 h-6 text-red-400" />
                <span>Report Delay - {selectedDelayProject?.title}</span>
              </h3>

              <div className="mb-4">
                <label className="block text-sm font-medium text-white/80 mb-2">
                  Reason for Delay
                </label>
                <textarea
                  value={delayReason}
                  onChange={(e) => setDelayReason(e.target.value)}
                  placeholder="Explain why the project is delayed..."
                  className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-red-400 resize-none h-32"
                />
              </div>

              <div className="flex space-x-3">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleReportDelay}
                  className="flex-1 bg-gradient-to-r from-red-500 to-red-600 text-white py-3 rounded-lg font-medium"
                >
                  Report Delay
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => {
                    setShowDelayModal(false);
                    setDelayReason("");
                  }}
                  className="flex-1 bg-white/10 text-white py-3 rounded-lg font-medium hover:bg-white/20 transition"
                >
                  Cancel
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Timeline Modal */}
      <AnimatePresence>
        {showTimelineModal && timelineData && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70"
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-gray-900 rounded-2xl border border-white/20 p-6 max-w-2xl w-full shadow-2xl"
            >
              <h3 className="text-xl font-bold mb-4 flex items-center space-x-2">
                <Watch className="w-6 h-6 text-purple-400" />
                <span>Project Timeline - {timelineData.projectTitle}</span>
              </h3>

              <div className="space-y-4 mb-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-white/5 rounded-lg p-4">
                    <p className="text-sm text-white/60">Created At</p>
                    <p className="text-white font-medium">
                      {formatDate(timelineData.createdAt)}
                    </p>
                  </div>
                  <div className="bg-white/5 rounded-lg p-4">
                    <p className="text-sm text-white/60">Started At</p>
                    <p className="text-white font-medium">
                      {formatDate(timelineData.startedAt) || "Not started"}
                    </p>
                  </div>
                  <div className="bg-white/5 rounded-lg p-4">
                    <p className="text-sm text-white/60">Expected Completion</p>
                    <p className="text-white font-medium">
                      {formatDate(timelineData.expectedCompletionDate) || "N/A"}
                    </p>
                  </div>
                  <div className="bg-white/5 rounded-lg p-4">
                    <p className="text-sm text-white/60">Actual Completion</p>
                    <p className="text-white font-medium">
                      {formatDate(timelineData.actualCompletionDate) ||
                        "Not completed"}
                    </p>
                  </div>
                </div>

                <div
                  className={`p-4 rounded-lg ${
                    timelineData.delayStatus === "ON_TRACK"
                      ? "bg-green-500/10 border-green-500/20"
                      : timelineData.delayStatus === "SLIGHTLY_DELAYED"
                      ? "bg-yellow-500/10 border-yellow-500/20"
                      : timelineData.delayStatus === "DELAYED"
                      ? "bg-orange-500/10 border-orange-500/20"
                      : timelineData.delayStatus === "CRITICALLY_DELAYED"
                      ? "bg-red-500/10 border-red-500/20"
                      : "bg-blue-500/10 border-blue-500/20"
                  } border`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      {getDelayStatusIcon(timelineData.delayStatus)}
                      <span
                        className={`font-medium ${getDelayStatusColor(
                          timelineData.delayStatus
                        )}`}
                      >
                        Status: {timelineData.delayStatus?.replace("_", " ")}
                      </span>
                    </div>
                    {timelineData.delayDays > 0 && (
                      <span className="text-red-400 font-medium">
                        Delayed by {timelineData.delayDays} days
                      </span>
                    )}
                  </div>
                  {timelineData.daysRemaining !== undefined && (
                    <p className="text-sm text-white/70 mt-2">
                      Days Remaining: {timelineData.daysRemaining}
                    </p>
                  )}
                </div>

                {timelineData.currentDelayReason && (
                  <div className="p-4 bg-red-500/10 rounded-lg border border-red-500/20">
                    <p className="text-sm text-red-300">
                      <span className="font-medium">Current Delay Reason:</span>{" "}
                      {timelineData.currentDelayReason}
                    </p>
                  </div>
                )}

                {timelineData.delayHistory &&
                  timelineData.delayHistory.length > 0 && (
                    <div>
                      <h4 className="text-lg font-semibold mb-3 text-white">
                        Delay History
                      </h4>
                      <div className="space-y-2 max-h-60 overflow-y-auto">
                        {timelineData.delayHistory.map((update, index) => (
                          <div
                            key={index}
                            className="bg-white/5 rounded-lg p-3 border border-white/10"
                          >
                            <div className="flex justify-between items-start mb-1">
                              <span className="text-sm font-medium text-white">
                                {update.reportedBy}
                              </span>
                              <span className="text-xs text-white/50">
                                {formatDate(update.updateDate)}
                              </span>
                            </div>
                            <p className="text-sm text-white/80">
                              {update.reason}
                            </p>
                            <div className="flex items-center space-x-2 mt-2">
                              <span
                                className={`text-xs ${getDelayStatusColor(
                                  update.delayStatus
                                )}`}
                              >
                                {update.delayStatus?.replace("_", " ")}
                              </span>
                              {update.delayDays > 0 && (
                                <span className="text-xs text-red-400">
                                  {update.delayDays} days delayed
                                </span>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
              </div>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setShowTimelineModal(false)}
                className="w-full bg-white/10 text-white py-3 rounded-lg font-medium hover:bg-white/20 transition"
              >
                Close
              </motion.button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
