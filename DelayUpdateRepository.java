// src/main/java/com/project/GISPlatform/Repository/DelayUpdateRepository.java
package com.project.GISPlatform.Repository;

import com.project.GISPlatform.Entity.DelayUpdate;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface DelayUpdateRepository extends JpaRepository<DelayUpdate, Long> {
    List<DelayUpdate> findByProjectIdOrderByUpdateDateDesc(Long projectId);
}