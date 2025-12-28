package com.jj.eventify.controller;

import com.jj.eventify.model.Event;
import com.jj.eventify.model.JoinRequest;
import com.jj.eventify.model.User;
import com.jj.eventify.service.EventService;
import com.jj.eventify.service.JoinRequestService;
import com.jj.eventify.service.UserService;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/events")
public class EventController {

    private final EventService eventService;
    private final JoinRequestService joinRequestService;
    private final UserService userService;


    public EventController(EventService eventService,
                           JoinRequestService joinRequestService,
                           UserService userService) {
        this.eventService = eventService;
        this.joinRequestService = joinRequestService;
        this.userService = userService;
    }

    // Create new event
    @PostMapping("/create")
    public Event createEvent(@RequestBody Event event) {
        return eventService.saveEvent(event);
    }

    // Get event by ID
    @GetMapping("/{id}")
    public Event getEvent(@PathVariable Long id) {
        return eventService.getEventById(id);
    }

    // Get all events
    @GetMapping("/all")
    public List<Event> getAllEvents() {
        return eventService.getAllEvents();
    }

    // Delete event

    @DeleteMapping("/{id}")
    public void deleteEvent(@PathVariable Long id) {
        eventService.deleteEventById(id);
    }



    // User sends join request to an event
    @PostMapping("/{eventId}/join")
    public JoinRequest joinEvent(@PathVariable Long eventId, @RequestParam Long userId) {
        Event event = eventService.getEventById(eventId);
        User user = userService.getUserById(userId);

        JoinRequest request = new JoinRequest();
        request.setEvent(event);
        request.setUser(user);
        return joinRequestService.sendRequest(request);
    }

    // Approve a join request
    @PostMapping("/requests/{requestId}/approve")
    public void approveJoin(@PathVariable Long requestId) {
        joinRequestService.approveRequest(requestId);
    }

    // Reject a join request
    @PostMapping("/requests/{requestId}/reject")
    public void rejectJoin(@PathVariable Long requestId) {
        joinRequestService.rejectRequest(requestId);
    }

    // Get all join requests for an event
    @GetMapping("/{eventId}/requests")
    public List<JoinRequest> getEventRequests(@PathVariable Long eventId) {
        return joinRequestService.getRequestsByEventId(eventId);
    }

    @GetMapping("/recommendations/{interest}")
    public List<Event> getRecommendations(@PathVariable String interest) {
        return eventService.getRecommendedEvents(interest);
    }



}
