package com.studentideas.controller;

import com.studentideas.model.Community;
import com.studentideas.model.User;
import com.studentideas.repository.CommunityRepository;
import com.studentideas.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/communities")
@CrossOrigin(origins = "*")
public class CommunityController {

    @Autowired
    private CommunityRepository communityRepository;

    @Autowired
    private UserRepository userRepository;

    @PostMapping
    public ResponseEntity<?> createCommunity(@RequestBody Community community, @RequestParam Long userId) {
        User user = userRepository.findById(userId).orElseThrow();
        community.setOwner(user);
        community.getMembers().add(user); // Owner is first member
        return ResponseEntity.ok(communityRepository.save(community));
    }

    @GetMapping
    public List<Community> getAllCommunities() {
        return communityRepository.findAll();
    }

    @GetMapping("/my")
    public List<Community> getMyCommunities(@RequestParam Long userId) {
        return communityRepository.findByMembers_Id(userId);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Community> getCommunity(@PathVariable Long id) {
        return communityRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping("/{id}/join")
    public ResponseEntity<?> joinCommunity(@PathVariable Long id, @RequestParam Long userId) {
        Community community = communityRepository.findById(id).orElseThrow();
        User user = userRepository.findById(userId).orElseThrow();

        community.getMembers().add(user);
        return ResponseEntity.ok(communityRepository.save(community));
    }

    @PostMapping("/{id}/add-member")
    public ResponseEntity<?> addMember(@PathVariable Long id, @RequestParam String username) {
        Community community = communityRepository.findById(id).orElseThrow();
        Optional<User> userOpt = userRepository.findByUsername(username);

        if (userOpt.isEmpty()) {
            return ResponseEntity.badRequest().body("User not found");
        }

        community.getMembers().add(userOpt.get());
        return ResponseEntity.ok(communityRepository.save(community));
    }
}
