package com.studentideas.controller;

import com.studentideas.model.Comment;
import com.studentideas.model.Idea;
import com.studentideas.model.User;
import com.studentideas.repository.CommentRepository;
import com.studentideas.repository.IdeaRepository;
import com.studentideas.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/comments")
@CrossOrigin(origins = "*")
public class CommentController {

    @Autowired
    private CommentRepository commentRepository;

    @Autowired
    private IdeaRepository ideaRepository;

    @Autowired
    private UserRepository userRepository;

    @GetMapping("/idea/{ideaId}")
    public List<Comment> getCommentsByIdea(@PathVariable Long ideaId) {
        return commentRepository.findByIdeaIdAndParentCommentIsNullOrderByCreatedAtDesc(ideaId);
    }

    @PostMapping
    public ResponseEntity<?> addComment(@RequestBody Map<String, Object> payload) {
        // Simple payload handling: content, userId, ideaId, parentId (optional)
        String content = (String) payload.get("content");

    public ResponseEntity<Comment> addComment(@RequestBody Comment comment) {
        if (comment.getIdea() == null || comment.getIdea().getId() == null || comment.getPostedBy() == null
                || comment.getPostedBy().getId() == null) {
            return ResponseEntity.badRequest().build();
        }
        Idea idea = ideaRepository.findById(comment.getIdea().getId())
                .orElseThrow(() -> new RuntimeException("Idea not found"));
        User user = userRepository.findById(comment.getPostedBy().getId())
                .orElseThrow(() -> new RuntimeException("User not found"));

        comment.setIdea(idea);
        comment.setPostedBy(user);

        // Handle parent comment if present
        if (comment.getParentComment() != null && comment.getParentComment().getId() != null) {
            Comment parent = commentRepository.findById(comment.getParentComment().getId())
                    .orElseThrow(() -> new RuntimeException("Parent comment not found"));
            comment.setParentComment(parent);
        } else {
            comment.setParentComment(null); // Ensure parent is null if not provided or invalid
        }

        Comment savedComment = commentRepository.save(comment);

        // Update idea stats (naive)
        idea.setCommentCount(idea.getCommentCount() + 1);
        ideaRepository.save(idea);

        return ResponseEntity.ok(savedComment);
    }

    @PostMapping("/{id}/useful")
    public ResponseEntity<?> markUseful(@PathVariable Long id) {
        Comment comment = commentRepository.findById(id).orElseThrow(() -> new RuntimeException("Comment not found"));
        comment.setUseful(true);
        return ResponseEntity.ok(commentRepository.save(comment));
    }
}
