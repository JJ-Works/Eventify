package com.jj.bhetghat.service;

import com.jj.bhetghat.model.Event;
import java.util.List;

public interface EventService {
    Event saveEvent(Event event);
    Event getEventById(Long id);
    List<Event> getAllEvents();
    void deleteEvent(Long id);

    void deleteEventById(Long id);
}
