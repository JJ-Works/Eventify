package com.jj.Bhetghat.service;

import com.jj.Bhetghat.model.Message;
import java.util.List;

public interface MessageService {
    Message sendMessage(Message message);                 // method to save message
    List<Message> getMessagesByEventId(Long eventId);    // method to fetch messages by event
}
