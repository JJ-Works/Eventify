package com.jj.eventify.controller;

import com.jj.eventify.model.Message;
import com.jj.eventify.model.Event;
import com.jj.eventify.model.User;
import com.jj.eventify.service.MessageService;
import com.jj.eventify.service.EventService;
import com.jj.eventify.service.UserService;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/messages")
public class MessageController {

    private final MessageService messageService;
    private final EventService eventService;
    private final UserService userService;

    public MessageController(MessageService messageService,
                             EventService eventService,
                             UserService userService) {
        this.messageService = messageService;
        this.eventService = eventService;
        this.userService = userService;
    }

    // Send a message in an event
    @PostMapping("/send")
    public Message sendMessage(@RequestParam Long eventId,
                               @RequestParam Long userId,
                               @RequestBody String content) {
        Event event = eventService.getEventById(eventId);
        User user = userService.getUserById(userId);

        Message message = new Message();
        message.setEvent(event);
        message.setUser(user);
        message.setContent(content);

        return messageService.sendMessage(message);
    }

    // Get all messages for an event
    @GetMapping("/event/{eventId}")
    public List<Message> getMessagesByEvent(@PathVariable Long eventId) {
        return messageService.getMessagesByEventId(eventId);
    }
}
