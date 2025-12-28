package com.jj.eventify.controller;

import com.jj.eventify.model.Event;
import com.jj.eventify.model.EventParticipant;
import com.jj.eventify.model.User;
import com.jj.eventify.repository.EventRepository;
import com.jj.eventify.repository.ParticipationRepository;
import com.jj.eventify.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

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
