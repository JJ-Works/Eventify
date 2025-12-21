package com.jj.Bhetghat.model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import java.time.LocalDateTime;

@Entity
@Getter @Setter
@IdClass(EventParticipantId.class)
public class EventParticipant {
    @Id
    private Long eventId;

    @Id
    private Long userId;

    @Column(nullable=false, updatable=false)
    private LocalDateTime joinedAt = LocalDateTime.now();
}
