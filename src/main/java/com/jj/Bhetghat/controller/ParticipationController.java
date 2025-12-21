package com.jj.Bhetghat.controller;

import com.jj.Bhetghat.model.Event;
import com.jj.Bhetghat.model.EventParticipant;
import com.jj.Bhetghat.model.User;
import com.jj.Bhetghat.repository.EventRepository;
import com.jj.Bhetghat.repository.ParticipationRepository;
import com.jj.Bhetghat.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;
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

    // Add a participant
    @PostMapping("/add")
    public EventParticipant addParticipant(@RequestParam Long userId, @RequestParam Long eventId) {
        Optional<User> userOpt = userRepository.findById(userId);
        Optional<Event> eventOpt = eventRepository.findById(eventId);

        if (userOpt.isEmpty() || eventOpt.isEmpty()) {
            throw new RuntimeException("User or Event not found");
        }

        EventParticipant participant = new EventParticipant();
        participant.setUser(userOpt.get());
        participant.setEvent(eventOpt.get());

        return participationRepository.save(participant);
    }

    // Get participants of an event
    @GetMapping("/event/{eventId}")
    public List<EventParticipant> getParticipants(@PathVariable Long eventId) {
        Event event = eventRepository.findById(eventId)
                .orElseThrow(() -> new RuntimeException("Event not found"));
        return participationRepository.findByEvent(event);
    }
}
