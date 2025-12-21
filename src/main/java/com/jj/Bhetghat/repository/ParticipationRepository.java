package com.jj.Bhetghat.repository;

import com.jj.Bhetghat.model.Event;
import com.jj.Bhetghat.model.EventParticipant;
import com.jj.Bhetghat.model.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface ParticipationRepository
        extends JpaRepository<EventParticipant, Long> {

    Optional<EventParticipant> findByUserAndEvent(User user, Event event);

    List<EventParticipant> findByEvent(Event event);
}
