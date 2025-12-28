package com.jj.eventify.service;

import com.jj.eventify.model.Message;
import com.jj.eventify.repository.MessageRepository;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
public class MessageServiceImpl implements MessageService {

    private final MessageRepository messageRepository;

    public MessageServiceImpl(MessageRepository messageRepository) {
        this.messageRepository = messageRepository;
    }

    @Override
    public Message sendMessage(Message message) {
        return messageRepository.save(message);
    }

    @Override
    public List<Message> getMessagesByEventId(Long eventId) {
        return messageRepository.findByEventId(eventId);
    }
}
