package com.studentideas.repository;

import com.studentideas.model.Community;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface CommunityRepository extends JpaRepository<Community, Long> {
    List<Community> findByMembers_Id(Long userId);

    List<Community> findByOwner_Id(Long ownerId);
}
