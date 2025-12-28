package com.jj.eventify.repository;

import com.jj.eventify.model.Event;
import com.jj.eventify.model.EventParticipant;
import com.jj.eventify.model.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface ParticipationRepository
        extends JpaRepository<EventParticipant, Long> {

    Optional<EventParticipant> findByUserAndEvent(User user, Event event);

    List<EventParticipant> findByEvent(Event event);

    long countByEvent(Event event);

    Optional<EventParticipant> findByUserIdAndEventId(Long userId, Long eventId);

    boolean existsByUserAndEvent(User user, Event event);


}
