package com.jj.eventify.model;

import java.io.Serializable;

public class EventParticipantId implements Serializable {
    private Long eventId;
    private Long userId;

    // equals() and hashCode() needed
    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (!(o instanceof EventParticipantId)) return false;
        EventParticipantId that = (EventParticipantId) o;
        return eventId.equals(that.eventId) && userId.equals(that.userId);
    }

    @Override
    public int hashCode() {
        return eventId.hashCode() + userId.hashCode();
    }
}
