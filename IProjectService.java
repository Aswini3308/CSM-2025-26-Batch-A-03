// src/main/java/com/project/GISPlatform/Service/IProjectService.java
package com.project.GISPlatform.Service;

import com.project.GISPlatform.Entity.DelayUpdate;
import com.project.GISPlatform.Entity.Project;
import java.util.List;
import java.util.Map;

public interface IProjectService {
    // Existing methods
    Project createProject(Project project, Long userId);
    Project updateProject(Project project, Long projectId, Long userId);
    List<Project> getAllProjects();
    List<Project> getProjectsByUser(Long userId);
    Project updateGeoJson(Long projectId, String geoJson);
    Project addComment(Long projectId, Long userId, String text);
    void deleteProject(Long projectId);
    Project rejectProject(Long projectId);
    byte[] generateCSV();
    Project approveProject(Long projectId);
    Project updateProjectStatus(Long projectId, Long userId, Project.ProjectStatus newStatus);
    Project updateResources(Long projectId, Long userId, Integer manpowerRequired,
                            Integer manpowerAssigned, Double budget, Double expenses,
                            Integer estimatedDays, Integer daysSpent);

    // New timeline methods
    Map<String, Object> reportDelay(Long projectId, Long userId, String reason);
    Map<String, Object> getTimelineStatus(Long projectId);
    List<DelayUpdate> getDelayHistory(Long projectId);
    Map<String, Object> getDelayedProjects();
}