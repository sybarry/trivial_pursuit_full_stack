package fr.alma.trivial_pursuit_server.data.service.impl;

import fr.alma.trivial_pursuit_server.core.player.User;
import fr.alma.trivial_pursuit_server.data.repository.UserRepository;
import fr.alma.trivial_pursuit_server.data.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Objects;

@Service
public class UserServiceImpl implements UserService {
    @Autowired
    private UserRepository userRepository;


    public UserServiceImpl(UserRepository userRepository){
        this.userRepository = userRepository;
        userRepository.save(new User("test", "test"));
    }


    @Override
    public Boolean isInRepository(User user) {
        User userFind = findByUserName(user.getUsername());
        return (userFind!=null && Objects.equals(user.getPassword(), userFind.getPassword()));
    }

    @Override
    public User saveUser(User user) {
        if(Boolean.TRUE.equals(isInRepository(user))){
            return null;
        }
        return userRepository.save(user);
    }

    @Override
    public List<User> findAll() {
        return userRepository.findAll();
    }

    @Override
    public Boolean resetPassword(String username) {
        User user = userRepository.findByUserName(username);
        if(user!=null){
            user.setPassword(null);
            flush();
            return true;
        }
        return false;
    }

    @Override
    public Boolean changePassword(String username, String password) {
        User user = userRepository.findByUserName(username);
        if(user!=null){
            user.setPassword(password);
            flush();
            return true;
        }
        return false;
    }

    @Override
    public User findByUserName(String user) {
        return userRepository.findByUserName(user);
    }

    @Override
    public void flush(){
        userRepository.flush();
    }
}
