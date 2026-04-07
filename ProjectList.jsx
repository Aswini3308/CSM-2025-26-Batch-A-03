// src/components/ProjectList.jsx
import React from "react";
import { motion } from "framer-motion";
import { HardHat, MapPin, AlertCircle } from "lucide-react";

export default function ProjectList({ projects, loading }) {
  if (loading) {
    return (
      <div className="text-center py-8">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-cyan-400"></div>
      </div>
    );
  }

  if (projects.length === 0) {
    return (
      <div className="text-center py-12 text-white/60">
        <AlertCircle className="w-12 h-12 mx-auto mb-3" />
        <p>No projects assigned yet.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4 max-h-96 overflow-y-auto">
      {projects.map((project, i) => (
        <motion.div
          key={project.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.05 }}
          className="bg-white/10 backdrop-blur-xl rounded-xl p-5 border border-white/20 hover:bg-white/15 transition"
        >
          <div className="flex justify-between items-start">
            <div>
              <h3 className="font-bold text-lg">{project.title}</h3>
              <p className="text-white/70 text-sm flex items-center mt-1">
                <MapPin className="w-4 h-4 mr-1" />
                {project.location}
              </p>
            </div>
            <span
              className={`px-3 py-1 rounded-full text-xs font-medium ${
                project.status === "COMPLETED"
                  ? "bg-green-500/20 text-green-300"
                  : project.status === "IN_PROGRESS"
                  ? "bg-amber-500/20 text-amber-300"
                  : "bg-gray-500/20 text-gray-300"
              }`}
            >
              {project.status.replace("_", " ")}
            </span>
          </div>
          {project.description && (
            <p className="text-white/60 text-sm mt-3">{project.description}</p>
          )}
        </motion.div>
      ))}
    </div>
  );
}