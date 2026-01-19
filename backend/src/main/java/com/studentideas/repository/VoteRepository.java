package com.studentideas.repository;

import com.studentideas.model.Vote;
import com.studentideas.model.User;
import com.studentideas.model.Idea;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface VoteRepository extends JpaRepository<Vote, Long> {
    Optional<Vote> findByUserAndIdea(User user, Idea idea);
}
