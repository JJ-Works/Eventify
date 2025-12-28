package com.jj.eventify.repository;

import com.jj.eventify.model.JoinRequest;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface JoinRequestRepository extends JpaRepository<JoinRequest, Long> {
    List<JoinRequest> findByEventId(Long eventId);
    List<JoinRequest> findByUserId(Long userId);
}
