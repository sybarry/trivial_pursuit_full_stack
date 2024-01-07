package fr.alma.trivial_pursuit_server.websockets;

import fr.alma.trivial_pursuit_server.core.player.User;
import fr.alma.trivial_pursuit_server.data.service.UserService;
import fr.alma.trivial_pursuit_server.lobby.ILogin;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@CrossOrigin(origins = "http://localhost:4200")
@RestController
@RequestMapping(path = "/api")
public class LoginController implements ILogin {

    @Autowired
    private UserService userService;

    @Override
    @RequestMapping(path = "/login/{username}/{password}")
    public boolean login(@PathVariable("username") String username, @PathVariable("password") String password) {
        return userService.isInRepository(new User(username,password));
    }

    @PostMapping(path = "/login")
    public boolean login(@RequestBody User user) throws Exception {
        User user1 = new User();
        user1.setUsername("mohamed@gmail.com");
        user1.setPassword("test");
        userService.saveUser(user1);
        System.out.println(user +" la requete est la");
        boolean a = userService.isInRepository(user);
        if (!a){
            throw new Exception("Bad credential");
        }
        return userService.isInRepository(user);
    }

    @Override
    @RequestMapping(path = "save/{username}/{password}")
    @ResponseStatus(HttpStatus.CREATED)
    public boolean createAccount(@PathVariable("username") String username, @PathVariable("password") String password) {
        User userCreated = new User(username,password);
        userService.saveUser(userCreated);
        return userService.isInRepository(userCreated);
    }

    @GetMapping(path = "findAll", produces = MediaType.APPLICATION_JSON_VALUE)
    public List<User> findAllUser(){
        return userService.findAll();
    }

    @Override
    @RequestMapping(path = "newMdp/{username}/{password}")
    public boolean newPassword(@PathVariable("username") String username,@PathVariable("password") String password) {
        if(resetPassword(username)){
            return userService.changePassword(username, password);
        }
        return false;
    }

    @Override
    public boolean resetPassword(String username) {
        return userService.resetPassword(username);

    }

    //front handling
//    @Override
//    public boolean logout(String user) {
//        return true;
//    }
}
