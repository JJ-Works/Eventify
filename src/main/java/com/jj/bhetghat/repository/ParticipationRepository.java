package com.jj.bhetghat.repository;

import com.jj.bhetghat.model.Event;
import com.jj.bhetghat.model.EventParticipant;
import com.jj.bhetghat.model.User;
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
