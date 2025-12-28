package com.jj.eventify.service;

import com.jj.eventify.model.Event;
import com.jj.eventify.model.User;
import java.util.List;

public interface UserService {
    User saveUser(User user);
    User getUserById(Long id);
    List<User> getAllUsers();
    void deleteUser(Long id);

    List<Event> getEventsHostedByUser(Long id);
}
