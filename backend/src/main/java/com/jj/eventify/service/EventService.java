package com.jj.eventify.service;

import com.jj.eventify.model.Event;
import java.util.List;

public interface EventService {
    Event saveEvent(Event event);
    Event getEventById(Long id);
    List<Event> getAllEvents();
    void deleteEvent(Long id);

    void deleteEventById(Long id);

    List<Event> getRecommendedEvents(String interest);

}
