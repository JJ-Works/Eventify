package com.jj.Bhetghat.repository;

import com.jj.Bhetghat.model.Message;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface MessageRepository extends JpaRepository<Message, Long> {
    List<Message> findByEventId(Long eventId);  // this must exist
}
