package com.jj.eventify.repository;

import com.jj.eventify.model.JoinRequest;
import com.jj.eventify.model.Event;
import com.jj.eventify.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface JoinRequestRepository extends JpaRepository<JoinRequest, Long> {
    List<JoinRequest> findByEventIdAndStatus(Long eventId, String status);
    Optional<JoinRequest> findByEventIdAndUserId(Long eventId, Long userId);
    void deleteByEventId(Long eventId);
}
