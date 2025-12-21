package com.jj.Bhetghat.service;

import com.jj.Bhetghat.model.JoinRequest;
import com.jj.Bhetghat.repository.JoinRequestRepository;
import com.jj.Bhetghat.repository.EventRepository;
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
        JoinRequest request = joinRequestRepository.findById(requestId).orElse(null);
        if (request != null) {
            request.setStatus("APPROVED");
            joinRequestRepository.save(request);

            // Add user to event participants
            var event = request.getEvent();
            if (!event.getParticipants().contains(request.getUser())) {
                event.getParticipants().add(request.getUser());
                eventRepository.save(event);
            }
        }
    }

    @Override
    public void rejectRequest(Long requestId) {
        JoinRequest request = joinRequestRepository.findById(requestId).orElse(null);
        if (request != null) {
            request.setStatus("REJECTED");
            joinRequestRepository.save(request);
        }
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
