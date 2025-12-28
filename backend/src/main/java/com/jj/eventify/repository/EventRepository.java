package com.jj.eventify.repository;

import com.jj.eventify.model.Event;
import com.jj.eventify.model.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface EventRepository extends JpaRepository<Event, Long> {

    List<Event> findByHost(User host);

    List<Event> findByCategory(String category);

}
