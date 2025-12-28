package com.jj.eventify.service;

import com.jj.eventify.model.JoinRequest;
import java.util.List;

public interface JoinRequestService {

    // Send a join request for a user to an event
    JoinRequest sendRequest(JoinRequest request);

    // Approve a join request → marks user as participant
    void approveRequest(Long requestId);

    // Reject a join request
    void rejectRequest(Long requestId);

    // Get all join requests for a specific event
    List<JoinRequest> getRequestsByEventId(Long eventId);

    // Get all join requests made by a user
    List<JoinRequest> getRequestsByUserId(Long userId);
}
