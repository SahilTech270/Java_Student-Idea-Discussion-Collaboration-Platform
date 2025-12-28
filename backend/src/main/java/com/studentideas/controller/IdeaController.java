package com.studentideas.controller;

import com.studentideas.model.Idea;
import com.studentideas.model.User;
import com.studentideas.repository.IdeaRepository;
import com.studentideas.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;
import java.util.Map;

@RestController
@RequestMapping("/api/ideas")
@CrossOrigin(origins = "*")
public class IdeaController {

    @Autowired
    private IdeaRepository ideaRepository;

    @Autowired
    private UserRepository userRepository;

    @GetMapping
    public List<Idea> getAllIdeas() {
        return ideaRepository.findAllByOrderByCreatedAtDesc();
    }

    @PostMapping
    public ResponseEntity<?> createIdea(@RequestBody Idea idea, @RequestParam Long userId) {
        if (userId == null) {
            return ResponseEntity.badRequest().body("User ID is required");
        }
        // In a real app we would get userId from the authenticated principal/token
        Optional<User> user = userRepository.findById(userId);
        if (user.isPresent()) {
            idea.setPostedBy(user.get());
            Idea savedIdea = ideaRepository.save(idea);
            return ResponseEntity.ok(savedIdea);
        }
        return ResponseEntity.badRequest().body("User not found");
    }

    @GetMapping("/{id}")
    public ResponseEntity<Idea> getIdeaById(@PathVariable Long id) {
        if (id == null)
            return ResponseEntity.badRequest().build();
        return ideaRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/recommendations")
    public List<Idea> getRecommendations(@RequestParam Long userId) {
        User user = userRepository.findById(userId).orElseThrow(() -> new RuntimeException("User not found"));
        List<Idea> allIdeas = ideaRepository.findAll();

        if (user.getInterests() == null || user.getInterests().isEmpty()) {
            return allIdeas.stream().limit(5).toList(); // Return top 5 latest if no interests
        }

        String[] interests = user.getInterests().toLowerCase().split(",");

        return allIdeas.stream()
                .sorted((i1, i2) -> {
                    int score1 = calculateScore(i1, interests);
                    int score2 = calculateScore(i2, interests);
                    return Integer.compare(score2, score1); // Descending
                })
                .limit(5)
                .toList();
    }

    private int calculateScore(Idea idea, String[] interests) {
        int score = 0;
        String tags = idea.getTags() == null ? "" : idea.getTags().toLowerCase();
        String domain = idea.getDomain() == null ? "" : idea.getDomain().toLowerCase();

        for (String interest : interests) {
            String trimmedInterest = interest.trim();
            if (tags.contains(trimmedInterest))
                score += 2;
            if (domain.contains(trimmedInterest))
                score += 3;
        }
        return score;
    }

    @PostMapping("/{id}/upvote")
    public ResponseEntity<?> upvoteIdea(@PathVariable Long id) {
        Idea idea = ideaRepository.findById(id).orElseThrow();
        idea.setUpvotes(idea.getUpvotes() + 1);
        return ResponseEntity.ok(ideaRepository.save(idea));
    }

    @PostMapping("/{id}/downvote")
    public ResponseEntity<?> downvoteIdea(@PathVariable Long id) {
        Idea idea = ideaRepository.findById(id).orElseThrow();
        idea.setDownvotes(idea.getDownvotes() + 1);
        return ResponseEntity.ok(ideaRepository.save(idea));
    }

    @GetMapping("/user/{userId}")
    public List<Idea> getIdeasByUser(@PathVariable Long userId) {
        return ideaRepository.findAllByPostedBy_Id(userId);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteIdea(@PathVariable Long id, @RequestParam Long userId) {
        return ideaRepository.findById(id).map(idea -> {
            if (idea.getPostedBy().getId().equals(userId)) {
                ideaRepository.delete(idea);
                return ResponseEntity.ok().build();
            } else {
                return ResponseEntity.status(403).body("Not authorized to delete this idea");
            }
        }).orElse(ResponseEntity.notFound().build());
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateIdea(@PathVariable Long id, @RequestBody Idea updatedIdea,
            @RequestParam Long userId) {
        return ideaRepository.findById(id).map(idea -> {
            if (idea.getPostedBy().getId().equals(userId)) {
                idea.setTitle(updatedIdea.getTitle());
                idea.setProblemStatement(updatedIdea.getProblemStatement());
                idea.setProposedSolution(updatedIdea.getProposedSolution());
                idea.setDomain(updatedIdea.getDomain());
                idea.setTags(updatedIdea.getTags());
                idea.setMaturityLevel(updatedIdea.getMaturityLevel());
                idea.setUniqueTouch(updatedIdea.getUniqueTouch());

                return ResponseEntity.ok(ideaRepository.save(idea));
            } else {
                return ResponseEntity.status(403).body("Not authorized to update this idea");
            }
        }).orElse(ResponseEntity.notFound().build());
    }

    @PostMapping("/{id}/analyze")
    public ResponseEntity<Map<String, List<String>>> analyzeIdea(@PathVariable Long id) {
        Idea idea = ideaRepository.findById(id).orElseThrow();
        Map<String, List<String>> swot = new java.util.HashMap<>();

        // 1. Strengths (Heuristic: keyword matching)
        List<String> strengths = new java.util.ArrayList<>();
        String combinedText = (idea.getTitle() + " " + idea.getProposedSolution()).toLowerCase();
        if (combinedText.contains("ai") || combinedText.contains("machine learning"))
            strengths.add("Leverages cutting-edge AI technology");
        if (combinedText.contains("sustainable") || combinedText.contains("green"))
            strengths.add("Eco-friendly approach");
        if (combinedText.contains("app") || combinedText.contains("mobile"))
            strengths.add("High accessibility via mobile");
        if (idea.getMaturityLevel() == com.studentideas.model.MaturityLevel.READY_TO_BUILD)
            strengths.add("Project is ready for immediate development");
        if (strengths.isEmpty())
            strengths.add("Clear and focused concept"); // Default
        swot.put("strengths", strengths);

        // 2. Weaknesses (Heuristic: text length/complexity)
        List<String> weaknesses = new java.util.ArrayList<>();
        if (idea.getProblemStatement().length() < 50)
            weaknesses.add("Problem statement may lack sufficient detail");
        if (idea.getUniqueTouch() == null || idea.getUniqueTouch().isEmpty())
            weaknesses.add("Differentiation from competitors is unclear");
        if (idea.getTags() == null || !idea.getTags().contains(","))
            weaknesses.add("Limited categorization (tags) may reduce discoverability");
        if (weaknesses.isEmpty())
            weaknesses.add("None detected at this stage");
        swot.put("weaknesses", weaknesses);

        // 3. Opportunities (Heuristic: domain based)
        List<String> opportunities = new java.util.ArrayList<>();
        String domain = idea.getDomain() != null ? idea.getDomain() : "";
        if (domain.equals("AI"))
            opportunities.add("Rapidly growing market share in AI sector");
        if (domain.equals("IoT"))
            opportunities.add("Integration with smart home ecosystems");
        if (domain.equals("Web"))
            opportunities.add("Potential for SaaS recurring revenue model");
        if (idea.getUpvotes() > 10)
            opportunities.add("Strong initial community interest indicates market fit");
        if (opportunities.isEmpty())
            opportunities.add("Potential for cross-domain collaboration");
        swot.put("opportunities", opportunities);

        // 4. Threats (Heuristic: general risks)
        List<String> threats = new java.util.ArrayList<>();
        if (domain.equals("Blockchain"))
            threats.add("Regulatory uncertainty in crypto/blockchain space");
        if (domain.equals("Mobile"))
            threats.add("High competition in app stores");
        threats.add("Need for rapid user adoption to sustain growth");
        threats.add("Technical debt if scaling too fast");
        swot.put("threats", threats);

        return ResponseEntity.ok(swot);
    }
}
