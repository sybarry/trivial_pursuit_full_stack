package fr.alma.trivial_pursuit_server.websockets;

import fr.alma.trivial_pursuit_server.core.player.User;
import fr.alma.trivial_pursuit_server.data.service.UserService;
import fr.alma.trivial_pursuit_server.lobby.ILogin;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
@CrossOrigin(origins = "http://localhost:4200")
@RestController
@RequestMapping(path = "/api")
@Slf4j
public class LoginController implements ILogin {

    @Autowired
    private UserService userService;

    /**
     * Login method for a given user
     * @param user user to be logged
     * @return true if the user has been logged, false otherwise
     */
    @PostMapping(path = "/login")
    public boolean loginDetached(@RequestBody User user) {
        log.info("login with username : "+user.getUsername());
        return login(user.getUsername(), user.getPassword());
    }

    /**
     * @see LoginController#loginDetached(User) loginDetached
     */
    @Override
    public boolean login(String username, String password) {
        return userService.isInRepository(new User(username,password));
    }

    /**
     * Create an account for a user given
     * @param user user who want to create an account
     * @return true if the user has been stored, false otherwise
     */
    @PostMapping(path = "/createAccount")
    @ResponseStatus(HttpStatus.CREATED)
    public boolean createAccountDetached(@RequestBody User user){
        log.info("createAccount with username "+user.getUsername());
        return createAccount(user.getUsername(), user.getPassword());
    }

    /**
     * @see LoginController#createAccountDetached(User) createAccountDetached
     */
    @Override
    public boolean createAccount(String username, String password) {
        try{
            User userSaved = userService.saveUser(new User(username,password));
            return userSaved!=null;
        }catch(Exception e){
            log.warn(e.getMessage());
            return false;
        }
    }

    /**
     * Change a user password with a new value
     * @param user user to change password
     * @return true if the password has been changed, false otherwise
     */
    @PutMapping(path = "/newPassword")
    public boolean newPasswordDetached(@RequestBody User user){
        log.info("newPassword for user "+user.getUsername());
        return newPassword(user.getUsername(), user.getPassword());
    }

    /**
     * @see LoginController#newPasswordDetached(User) newPasswordDetached
     */
    @Override
    public boolean newPassword(String username, String password) {
        if(resetPassword(username)){
            return userService.changePassword(username, password);
        }
        return false;
    }

    /**
     * @see LoginController#newPassword(String, String) newPassword
     */
    @Override
    public boolean resetPassword(String username) {
        log.info("resetPassword with username : "+username);
        return userService.resetPassword(username);
    }

    /**
     * Retrieve a user for a certain username
     * @param username username of the user retrieved
     * @return A user
     */
    @GetMapping(path = "/user/{username}")
    public User getUser(@PathVariable("username") String username){
        log.info("get user for username : "+username);
        return userService.findByUserName(username);
    }
}
