package com.studentideas.repository;

import com.studentideas.model.Comment;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface CommentRepository extends JpaRepository<Comment, Long> {
    List<Comment> findByIdeaIdAndParentCommentIsNullOrderByCreatedAtDesc(Long ideaId);
}
