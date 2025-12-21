package com.jj.Bhetghat.model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import java.time.LocalDateTime;

@Entity
@Getter @Setter
public class Event {
    @Id
    @GeneratedValue(strategy=GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name="host_id", nullable=false)
    private User host;

    @Column(nullable=false)
    private String title;

    private String description;
    private String category;
    private String location;

    @Column(nullable=false)
    private LocalDateTime eventDate;

    private Integer maxParticipants;

    private String imageUrl; // optional image path

    @Column(nullable=false, updatable=false)
    private LocalDateTime createdAt = LocalDateTime.now();
}
