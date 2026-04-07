package com.project.GISPlatform.Controller;

import com.project.GISPlatform.Service.IProjectService;
import com.project.GISPlatform.Service.IUserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;

@CrossOrigin("*")
@RestController
@RequestMapping("/api/admin")
public class AdminController {

    @Autowired
    private IUserService userService;
    @Autowired
    private IProjectService projectService;

    // DEFAULT ADMIN CREDENTIALS (AS PER USRC)
    private static final String ADMIN_EMAIL = "admin@gmail.com";
    private static final String ADMIN_PASSWORD = "admin123"; // Change in production!

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestParam String email, @RequestParam String password) {
        var res = new HashMap<String, Object>();

        if (ADMIN_EMAIL.equals(email) && ADMIN_PASSWORD.equals(password)) {
            res.put("msg", "Admin login successful");
            res.put("role", "ADMIN");
            res.put("name", "USRC Administrator");
            return ResponseEntity.ok(res);
        } else {
            res.put("error", "Invalid admin credentials");
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(res);
        }
    }

    @GetMapping("/users")
    public ResponseEntity<?> getUsers() {
        return ResponseEntity.ok(userService.getAllUsers());
    }

    @GetMapping("/projects")
    public ResponseEntity<?> getProjects() {
        return ResponseEntity.ok(projectService.getAllProjects());
    }

    @PutMapping("/approve/{projectId}")
    public ResponseEntity<?> approve(@PathVariable Long projectId) {
        var p = projectService.approveProject(projectId);
        return ResponseEntity.ok(p);
    }

    @PutMapping("/reject/{projectId}")
    public ResponseEntity<?> reject(@PathVariable Long projectId) {
        var p = projectService.rejectProject(projectId);
        return ResponseEntity.ok(p);
    }

    @GetMapping("/reports/csv")
    public ResponseEntity<ByteArrayResource> exportCSV() {
        byte[] csv = projectService.generateCSV();
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=reconstruction_report.csv")
                .contentType(MediaType.parseMediaType("text/csv"))
                .body(new ByteArrayResource(csv));
    }
}