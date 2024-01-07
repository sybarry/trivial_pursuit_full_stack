package fr.alma.trivial_pursuit_server.data.service;

import fr.alma.trivial_pursuit_server.core.player.User;

import java.util.List;

public interface UserService {
    Boolean isInRepository(User user);

    User saveUser(User user);

    List<User> findAll();

    Boolean resetPassword(String username);

    Boolean changePassword(String username, String password);

    User findByUserName(String user);

    void flush();
}
