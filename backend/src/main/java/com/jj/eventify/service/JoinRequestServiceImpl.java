package com.jj.eventify.service;

import com.jj.eventify.model.Event;
import com.jj.eventify.model.JoinRequest;
import com.jj.eventify.model.User;
import com.jj.eventify.repository.JoinRequestRepository;
import com.jj.eventify.repository.EventRepository;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
public class JoinRequestServiceImpl implements JoinRequestService {

    private final JoinRequestRepository joinRequestRepository;
    private final EventRepository eventRepository;

    public JoinRequestServiceImpl(JoinRequestRepository joinRequestRepository,
                                  EventRepository eventRepository) {
        this.joinRequestRepository = joinRequestRepository;
        this.eventRepository = eventRepository;
    }

    @Override
    public JoinRequest sendRequest(JoinRequest request) {
        request.setStatus("PENDING"); // default status
        return joinRequestRepository.save(request);
    }

    @Override
    public void approveRequest(Long requestId) {
        JoinRequest request = joinRequestRepository.findById(requestId)
                .orElseThrow(() -> new RuntimeException("JoinRequest not found"));

        Event managedEvent = eventRepository.findById(request.getEvent().getId())
                .orElseThrow(() -> new RuntimeException("Event not found"));

        User user = request.getUser();

        // Check if user already in participants
        if (!managedEvent.getParticipants().contains(user)) {
            managedEvent.getParticipants().add(user);
            eventRepository.save(managedEvent);
        }

        // Update request status
        request.setStatus("APPROVED");
        joinRequestRepository.save(request);
    }

    @Override
    public void rejectRequest(Long requestId) {
        JoinRequest request = joinRequestRepository.findById(requestId)
                .orElseThrow(() -> new RuntimeException("JoinRequest not found"));

        request.setStatus("REJECTED");
        joinRequestRepository.save(request);
    }

    @Override
    public List<JoinRequest> getRequestsByEventId(Long eventId) {
        return joinRequestRepository.findByEventId(eventId);
    }

    @Override
    public List<JoinRequest> getRequestsByUserId(Long userId) {
        return joinRequestRepository.findByUserId(userId);
    }
}
