package fr.alma.trivial_pursuit_server.websockets;

import fr.alma.trivial_pursuit_server.core.player.User;
import fr.alma.trivial_pursuit_server.data.service.UserService;
import fr.alma.trivial_pursuit_server.lobby.ILogin;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping(path = "/api")
@Slf4j
public class LoginController implements ILogin {

    @Autowired
    private UserService userService;

    @Override
    @RequestMapping(path = "login/{username}/{password}")
    public boolean login(@PathVariable("username") String username, @PathVariable("password") String password) {
        log.info("login with username : "+username+" and password: "+password);

        return userService.isInRepository(new User(username,password));
    }
    @Override
    @RequestMapping(path = "save/{username}/{password}")
    @ResponseStatus(HttpStatus.CREATED)
    public boolean createAccount(@PathVariable("username") String username, @PathVariable("password") String password) {
        log.info("createAcoount with username : "+username+" and password : "+password);

        User userCreated = new User(username,password);
        userCreated = userService.saveUser(userCreated);
        return userCreated != null;
    }

    @Override
    @RequestMapping(path = "newMdp/{username}/{password}")
    public boolean newPassword(@PathVariable("username") String username,@PathVariable("password") String password) {
        log.info("newPassword with username : "+username+" and password : "+password);

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

    //front handling
//    @Override
//    public boolean logout(String user) {
//        return true;
//    }
}
