package com.jj.Bhetghat.model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Entity
@Getter @Setter
public class User {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable=false)
    private String name;

    @Column(nullable=false, unique=true)
    private String email;

    @Column(nullable=false)
    private String password;

    // shows createdAt timestamp
    @Column(nullable=false, updatable=false)
    private java.time.LocalDateTime createdAt = java.time.LocalDateTime.now();
}
