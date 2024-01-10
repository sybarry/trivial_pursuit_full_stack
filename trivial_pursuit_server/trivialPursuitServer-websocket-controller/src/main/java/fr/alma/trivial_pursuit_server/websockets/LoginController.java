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

    @Override
    public boolean login(String username, String password) {
        return userService.isInRepository(new User(username,password));
    }

    @PostMapping(path = "/login")
    public boolean loginDetached(@RequestBody User user) {
        log.info("login with username : "+user);
        return login(user.getUsername(), user.getPassword());
    }

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

    @PostMapping(path = "/createAccount")
    @ResponseStatus(HttpStatus.CREATED)
    public boolean createAccountDetached(@RequestBody User user){
        log.info("createAccount with username");
        return createAccount(user.getUsername(), user.getPassword());
    }

    @Override
    public boolean newPassword(String username, String password) {
        if(resetPassword(username)){
            return userService.changePassword(username, password);
        }
        return false;
    }

    @Override
    public boolean resetPassword(String username) {
        log.info("resetPassword with username : "+username);
        return userService.resetPassword(username);
    }

    @PutMapping(path = "/newPassword")
    public boolean newPasswordDetached(@RequestBody User user){
        log.info("newPassword for user "+user);
        return newPassword(user.getUsername(), user.getPassword());
    }

    @GetMapping(path = "/user/{username}")
    public User getUser(@PathVariable("username") String username){
        return userService.findByUserName(username);
    }
}
