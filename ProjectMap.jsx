// src/components/ProjectMap.jsx
import React from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

export default function ProjectMap({ projects }) {
  const customIcon = (status) => {
    const colors = {
      NOT_STARTED: "#6b7280",
      IN_PROGRESS: "#f59e0b",
      COMPLETED: "#10b981",
    };
    return L.divIcon({
      className: "custom-marker",
      html: `<div style="background-color: ${colors[status] || "#6b7280"}; width: 30px; height: 30px; border-radius: 50%; border: 3px solid white; box-shadow: 0 2px 5px rgba(0,0,0,0.3);"></div>`,
      iconSize: [30, 30],
      iconAnchor: [15, 30],
    });
  };

  return (
    <MapContainer
      center={[42.35, 13.40]}
      zoom={10}
      style={{ height: "100%", width: "100%" }}
      className="rounded-xl"
    >
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="https://openstreetmap.org">OpenStreetMap</a>'
      />
      {projects.map((project) =>
        project.latitude && project.longitude ? (
          <Marker
            key={project.id}
            position={[project.latitude, project.longitude]}
            icon={customIcon(project.status)}
          >
            <Popup>
              <div className="p-2">
                <h3 className="font-bold text-black">{project.title}</h3>
                <p className="text-sm text-gray-700">{project.location}</p>
                <span
                  className={`inline-block px-2 py-1 rounded text-xs mt-1 ${
                    project.status === "COMPLETED"
                      ? "bg-green-100 text-green-800"
                      : project.status === "IN_PROGRESS"
                      ? "bg-amber-100 text-amber-800"
                      : "bg-gray-100 text-gray-800"
                  }`}
                >
                  {project.status.replace("_", " ")}
                </span>
              </div>
            </Popup>
          </Marker>
        ) : null
      )}
    </MapContainer>
  );
}