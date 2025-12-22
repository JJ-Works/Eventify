package com.jj.bhetghat.controller;

import com.jj.bhetghat.model.Event;
import com.jj.bhetghat.model.EventParticipant;
import com.jj.bhetghat.model.User;
import com.jj.bhetghat.repository.EventRepository;
import com.jj.bhetghat.repository.ParticipationRepository;
import com.jj.bhetghat.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/participation")
public class ParticipationController {

    @Autowired
    private ParticipationRepository participationRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private EventRepository eventRepository;

    @PostMapping("/events/{eventId}/join")
    public EventParticipant joinEvent(@PathVariable Long eventId, @RequestBody Map<String, Long> request) {
        Long userId = request.get("userId");

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        Event event = eventRepository.findById(eventId)
                .orElseThrow(() -> new RuntimeException("Event not found"));

        // Prevent duplicate join
        boolean alreadyJoined = participationRepository.existsByUserAndEvent(user, event);
        if (alreadyJoined) {
            throw new RuntimeException("User has already joined this event");
        }

        // Count actual participants in DB
        long participantCount = participationRepository.countByEvent(event);
        if (participantCount >= event.getMaxParticipants()) {
            throw new RuntimeException("Event is full");
        }

        EventParticipant participant = new EventParticipant();
        participant.setUser(user);
        participant.setEvent(event);

        return participationRepository.save(participant);
    }

    // Get participants of an event
    @GetMapping("/event/{eventId}")
    public List<EventParticipant> getParticipants(@PathVariable Long eventId) {
        Event event = eventRepository.findById(eventId)
                .orElseThrow(() -> new RuntimeException("Event not found"));
        return participationRepository.findByEvent(event);
    }

    @DeleteMapping("/events/{eventId}/leave")
    public void leaveEvent(@PathVariable Long eventId, @RequestBody Map<String, Long> request) {
        Long userId = request.get("userId");

        EventParticipant participant = participationRepository
                .findByUserIdAndEventId(userId, eventId)
                .orElseThrow(() -> new RuntimeException("Participation not found"));

        participationRepository.delete(participant);
    }
}
