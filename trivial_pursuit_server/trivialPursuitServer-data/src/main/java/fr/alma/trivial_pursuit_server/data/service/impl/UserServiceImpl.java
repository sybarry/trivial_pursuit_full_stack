package fr.alma.trivial_pursuit_server.data.service.impl;

import fr.alma.trivial_pursuit_server.core.player.User;
import fr.alma.trivial_pursuit_server.data.repository.UserRepository;
import fr.alma.trivial_pursuit_server.data.service.UserService;
import fr.alma.trivial_pursuit_server.util.Constant;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Objects;

@Service
@Slf4j
public class UserServiceImpl implements UserService {
    @Autowired
    private UserRepository userRepository;

    /**
     * Constructor of a UserServiceImpl
     * @param userRepository userRepository field
     */
    public UserServiceImpl(UserRepository userRepository){
        this.userRepository = userRepository;
        userRepository.save(new User("test", Constant.getSHA512SecurePassword("test")));
    }


    /**
     * Check if a user is in the repository
     * @param user user to be checked
     * @return true if in, false otherwise
     */
    @Override
    public Boolean isInRepository(User user) {
        User userFind = findByUserName(user.getUsername());
        return (userFind!=null && Objects.equals(Constant.getSHA512SecurePassword(user.getPassword()), userFind.getPassword()));
    }

    /**
     * Store a user in the repository
     * @param user user to be stored
     * @return the user stored
     */
    @Override
    public User saveUser(User user) {
        if(Boolean.TRUE.equals(isInRepository(user))){
            return null;
        }
        user.setPassword(Constant.getSHA512SecurePassword(user.getPassword()));
        return userRepository.save(user);
    }

    /**
     * Retrieve all the users in the repository
     * @return A list composed of the users of the repository
     */
    @Override
    public List<User> findAll() {
        return userRepository.findAll();
    }

    /**
     * Reset the password of a user to null
     * @param username username of a user in the repository
     * @return True if the password has been nullified, false otherwise
     */
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

    /**
     * Set the password of a user with a new value
     * @param username username of a user in the repository
     * @param password new password to be set
     * @return True if the password has been set, false otherwise
     */
    @Override
    public Boolean changePassword(String username, String password) {
        User user = userRepository.findByUserName(username);
        if(user!=null){
            user.setPassword(Constant.getSHA512SecurePassword(password));
            flush();
            return true;
        }
        return false;
    }

    /**
     * Find a user by his username
     * @param username username to be found
     * @return The user found, null if none
     */
    @Override
    public User findByUserName(String username) {
        return userRepository.findByUserName(username);
    }

    /**
     * Flush the repository
     */
    @Override
    public void flush(){
        userRepository.flush();
    }
}
