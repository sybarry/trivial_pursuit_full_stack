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
    }


    @Override
    public Boolean isInRepository(User user) {
        List<User> userList = userRepository.findAll();
        for(User u : userList){
            if(Objects.equals(u.getUsername(), user.getUsername())
            && Objects.equals(u.getPassword(), user.getPassword())){
                return true;
            }
        }
        return false;
    }

    @Override
    public User saveUser(User user) {
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
            userRepository.delete(user);
            user.setPassword(null);
            userRepository.save(user);
            return true;
        }
        return false;
    }

    @Override
    public Boolean changePassword(String username, String password) {
        User user = userRepository.findByUserName(username);
        if(user!=null){
            userRepository.delete(user);
            user.setPassword(password);
            userRepository.save(user);
            return true;
        }
        return false;
    }

}
