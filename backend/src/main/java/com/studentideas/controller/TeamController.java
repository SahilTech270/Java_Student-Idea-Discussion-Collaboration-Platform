package com.studentideas.controller;

import com.studentideas.model.Idea;
import com.studentideas.model.RequestStatus;
import com.studentideas.model.TeamRequest;
import com.studentideas.model.User;
import com.studentideas.repository.IdeaRepository;
import com.studentideas.repository.TeamRequestRepository;
import com.studentideas.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/team")
@CrossOrigin(origins = "*")
public class TeamController {

    @Autowired
    private TeamRequestRepository teamRequestRepository;

    @Autowired
    private IdeaRepository ideaRepository;

    @Autowired
    private UserRepository userRepository;

    @PostMapping("/request")
    public ResponseEntity<?> createRequest(@RequestBody TeamRequest request) {
        if (request.getIdea() == null || request.getIdea().getId() == null) {
            return ResponseEntity.badRequest().body("Idea ID is required");
        }
        if (request.getRequester() == null || request.getRequester().getId() == null) {
            return ResponseEntity.badRequest().body("Requester ID is required");
        }

        Idea idea = ideaRepository.findById(request.getIdea().getId()).orElseThrow();
        User requester = userRepository.findById(request.getRequester().getId()).orElseThrow();

        // Prevent owner from requesting
        if (idea.getPostedBy().getId().equals(requester.getId())) {
            return ResponseEntity.badRequest().body("You cannot join your own team");
        }

        if (teamRequestRepository.findByIdeaIdAndRequesterId(idea.getId(), requester.getId()).isPresent()) {
            return ResponseEntity.badRequest().body("Request already exists");
        }

        request.setIdea(idea);
        request.setRequester(requester);
        request.setStatus(RequestStatus.PENDING);

        return ResponseEntity.ok(teamRequestRepository.save(request));
    }

    @GetMapping("/idea/{ideaId}")
    public List<TeamRequest> getRequestsForIdea(@PathVariable Long ideaId) {
        return teamRequestRepository.findByIdeaId(ideaId);
    }

    @PostMapping("/request/{requestId}/{status}")
    public ResponseEntity<?> updateRequestStatus(@PathVariable Long requestId, @PathVariable String status) {
        TeamRequest request = teamRequestRepository.findById(requestId).orElseThrow();
        try {
            RequestStatus newStatus = RequestStatus.valueOf(status.toUpperCase());
            request.setStatus(newStatus);
            return ResponseEntity.ok(teamRequestRepository.save(request));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body("Invalid status");
        }
    }
}
