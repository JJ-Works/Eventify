package com.jj.bhetghat.service;

import com.jj.bhetghat.model.Event;
import com.jj.bhetghat.model.EventParticipant;
import com.jj.bhetghat.repository.EventRepository;
import com.jj.bhetghat.repository.ParticipationRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class EventServiceImpl implements EventService {

    private final EventRepository eventRepository;
    private final ParticipationRepository participationRepository;

    public EventServiceImpl(EventRepository eventRepository,
                            ParticipationRepository participationRepository) {
        this.eventRepository = eventRepository;
        this.participationRepository = participationRepository;
    }

    @Override
    public Event saveEvent(Event event) {
        return eventRepository.save(event);
    }

    @Override
    public Event getEventById(Long id) {
        return eventRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Event not found"));
    }

    @Override
    public void deleteEventById(Long id) {
        Event event = eventRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Event not found"));

        // Delete all participants first
        List<EventParticipant> participants = participationRepository.findByEvent(event);
        participationRepository.deleteAll(participants);

        // Delete the event itself
        eventRepository.delete(event);
    }

    @Override
    public void deleteEvent(Long id) {
        Event event = eventRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Event not found"));

        // Delete all participants first
        List<EventParticipant> participants = participationRepository.findByEvent(event);
        participationRepository.deleteAll(participants);

        // Delete the event itself
        eventRepository.delete(event);
    }


    @Override
    public List<Event> getAllEvents() {
        return eventRepository.findAll();
    }
}
