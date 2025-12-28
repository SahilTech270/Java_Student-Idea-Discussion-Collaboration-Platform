package com.studentideas.controller;

import com.studentideas.model.Comment;
import com.studentideas.model.Idea;
import com.studentideas.repository.CommentRepository;
import com.studentideas.repository.IdeaRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/admin")
@CrossOrigin(origins = "*")
public class AdminController {

    @Autowired
    private IdeaRepository ideaRepository;

    @Autowired
    private CommentRepository commentRepository;

    @PostMapping("/report/idea/{id}")
    public ResponseEntity<?> reportIdea(@PathVariable Long id) {
        Idea idea = ideaRepository.findById(id).orElseThrow();
        idea.setReported(true);
        return ResponseEntity.ok(ideaRepository.save(idea));
    }

    @PostMapping("/report/comment/{id}")
    public ResponseEntity<?> reportComment(@PathVariable Long id) {
        Comment comment = commentRepository.findById(id).orElseThrow();
        comment.setReported(true);
        return ResponseEntity.ok(commentRepository.save(comment));
    }

    @GetMapping("/reports")
    public ResponseEntity<Map<String, Object>> getReports() {
        Map<String, Object> response = new HashMap<>();

        List<Idea> reportedIdeas = ideaRepository.findAll().stream()
                .filter(Idea::isReported)
                .collect(Collectors.toList());

        List<Comment> reportedComments = commentRepository.findAll().stream()
                .filter(Comment::isReported)
                .collect(Collectors.toList());

        response.put("ideas", reportedIdeas);
        response.put("comments", reportedComments);

        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/idea/{id}")
    public ResponseEntity<?> deleteIdea(@PathVariable Long id) {
        if (id == null)
            return ResponseEntity.badRequest().build();
        ideaRepository.deleteById(id);
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/comment/{id}")
    public ResponseEntity<?> deleteComment(@PathVariable Long id) {
        commentRepository.deleteById(id);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/dismiss/idea/{id}")
    public ResponseEntity<?> dismissIdeaReport(@PathVariable Long id) {
        if (id == null)
            return ResponseEntity.badRequest().build();
        Idea idea = ideaRepository.findById(id).orElseThrow();
        idea.setReported(false);
        return ResponseEntity.ok(ideaRepository.save(idea));
    }

    @PostMapping("/dismiss/comment/{id}")
    public ResponseEntity<?> dismissCommentReport(@PathVariable Long id) {
        Comment comment = commentRepository.findById(id).orElseThrow();
        comment.setReported(false);
        return ResponseEntity.ok(commentRepository.save(comment));
    }
}
