package com.studentideas.repository;

import com.studentideas.model.TeamRequest;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface TeamRequestRepository extends JpaRepository<TeamRequest, Long> {
    List<TeamRequest> findByIdeaId(Long ideaId);

    List<TeamRequest> findByRequesterId(Long requesterId);

    Optional<TeamRequest> findByIdeaIdAndRequesterId(Long ideaId, Long requesterId);
}
