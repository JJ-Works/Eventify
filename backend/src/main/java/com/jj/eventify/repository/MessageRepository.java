package com.jj.eventify.repository;

import com.jj.eventify.model.Message;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface MessageRepository extends JpaRepository<Message, Long> {
    List<Message> findByEventId(Long eventId);  // this must exist
}
