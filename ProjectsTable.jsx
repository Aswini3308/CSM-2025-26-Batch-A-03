// src/components/ProjectsTable.jsx
import React from "react";
import { motion } from "framer-motion";
import { Building2, CheckCircle, XCircle } from "lucide-react";

export default function ProjectsTable({ projects, onApprove, onReject }) {
  return (
    <motion.div
      id="projects"
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
    >
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold flex items-center space-x-3">
          <Building2 className="w-7 h-7 text-amber-400" />
          <span>Reconstruction Projects</span>
        </h2>
      </div>

      <div className="bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-white/5">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-medium text-white/80">ID</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-white/80">Title</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-white/80">Location</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-white/80">Status</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-white/80">Officer</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-white/80">Actions</th>
              </tr>
            </thead>
            <tbody>
              {projects.map((project, i) => (
                <motion.tr
                  key={project.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="border-t border-white/10 hover:bg-white/5 transition"
                >
                  <td className="px-6 py-4 text-sm">{project.id}</td>
                  <td className="px-6 py-4 text-sm font-medium">{project.title}</td>
                  <td className="px-6 py-4 text-sm">{project.location}</td>
                  <td className="px-6 py-4">
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
                  </td>
                  <td className="px-6 py-4 text-sm text-cyan-300">
                    {project.createdBy?.email || "Unknown"}
                  </td>
                  <td className="px-6 py-4 flex space-x-2">
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => onApprove(project.id)}
                      className="p-2 bg-green-500/20 text-green-300 rounded-lg hover:bg-green-500/30 transition"
                      title="Approve"
                    >
                      <CheckCircle className="w-5 h-5" />
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => onReject(project.id)}
                      className="p-2 bg-red-500/20 text-red-300 rounded-lg hover:bg-red-500/30 transition"
                      title="Reject"
                    >
                      <XCircle className="w-5 h-5" />
                    </motion.button>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </motion.div>
  );
}