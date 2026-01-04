package com.jj.eventify.repository;

import com.jj.eventify.model.Event;
import com.jj.eventify.model.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface EventRepository extends JpaRepository<Event, Long> {

    List<Event> findByHost(User host);

    List<Event> findByCategory(String category);

    @org.springframework.data.jpa.repository.Query("SELECT e FROM Event e WHERE " +
            "(:query IS NULL OR LOWER(e.title) LIKE LOWER(CONCAT('%', :query, '%')) OR LOWER(e.description) LIKE LOWER(CONCAT('%', :query, '%'))) AND " +
            "(:location IS NULL OR LOWER(e.location) LIKE LOWER(CONCAT('%', :location, '%')))")
    List<Event> searchEvents(String query, String location);
}
