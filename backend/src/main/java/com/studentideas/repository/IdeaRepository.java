package com.studentideas.repository;

import com.studentideas.model.Idea;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface IdeaRepository extends JpaRepository<Idea, Long> {
    List<Idea> findAllByOrderByCreatedAtDesc();

    List<Idea> findAllByPostedBy_Id(Long userId);
}
