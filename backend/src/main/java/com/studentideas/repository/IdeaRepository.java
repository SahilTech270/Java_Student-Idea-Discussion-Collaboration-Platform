package com.studentideas.repository;

import com.studentideas.model.Idea;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface IdeaRepository extends JpaRepository<Idea, Long> {
    List<Idea> findAllByOrderByCreatedAtDesc();

    List<Idea> findAllByOrderByUpvotesDesc();

    List<Idea> findAllByDomain(String domain);

    List<Idea> findAllByDomainOrderByCreatedAtDesc(String domain);

    List<Idea> findAllByDomainOrderByUpvotesDesc(String domain);

    List<Idea> findAllByPostedBy_Id(Long userId);

    List<Idea> findByCommunity_Id(Long communityId);
}
