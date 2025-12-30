package com.studentideas.model;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import java.time.LocalDateTime;

@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "ideas")
public class Idea {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String title;

    @Column(columnDefinition = "TEXT", nullable = false)
    private String problemStatement;

    @Column(columnDefinition = "TEXT", nullable = false)
    private String proposedSolution;

    private String domain; // AI, Web, IoT, etc.
    private String tags; // Comma separated
    private String uniqueTouch; // Specific feature

    @Enumerated(EnumType.STRING)
    private MaturityLevel maturityLevel;

    @ManyToOne
    @JoinColumn(name = "user_id", nullable = false)
    private User postedBy;

    @ManyToOne
    @JoinColumn(name = "community_id")
    private Community community;

    private LocalDateTime createdAt;

    // Stats for ranking (denormalized simple counters)
    private int upvotes = 0;
    private int downvotes = 0;
    private int commentCount = 0;

    private boolean reported = false;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }
}
