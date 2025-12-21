package com.jj.Bhetghat.service;

import com.jj.Bhetghat.model.Event;
import java.util.List;

public interface EventService {
    Event saveEvent(Event event);
    Event getEventById(Long id);
    List<Event> getAllEvents();
    void deleteEvent(Long id);
}
