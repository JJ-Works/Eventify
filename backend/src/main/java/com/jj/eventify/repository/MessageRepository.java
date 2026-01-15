package com.jj.eventify.repository;

import com.jj.eventify.model.Message;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import java.util.List;

public interface MessageRepository extends JpaRepository<Message, Long> {
    
    @Query("SELECT m FROM Message m WHERE m.event.id = :eventId AND " +
           "((m.sender.id = :u1 AND m.receiver.id = :u2) OR (m.sender.id = :u2 AND m.receiver.id = :u1)) " +
           "ORDER BY m.timestamp ASC")
    List<Message> findChatHistory(Long eventId, Long u1, Long u2);

    void deleteByEventId(Long eventId);
}
