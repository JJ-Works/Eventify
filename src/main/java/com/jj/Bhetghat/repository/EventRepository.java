package com.jj.Bhetghat.repository;

import com.jj.Bhetghat.model.Event;
import com.jj.Bhetghat.model.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface EventRepository extends JpaRepository<Event, Long> {

    List<Event> findByHost(User host);
}
