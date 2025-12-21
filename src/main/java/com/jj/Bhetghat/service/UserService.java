package com.jj.Bhetghat.service;

import com.jj.Bhetghat.model.User;
import java.util.List;

public interface UserService {
    User saveUser(User user);
    User getUserById(Long id);
    List<User> getAllUsers();
    void deleteUser(Long id);
}
