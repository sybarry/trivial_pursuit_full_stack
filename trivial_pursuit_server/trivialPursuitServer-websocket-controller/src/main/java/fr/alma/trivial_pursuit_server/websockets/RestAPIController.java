package fr.alma.trivial_pursuit_server.websockets;

import fr.alma.trivial_pursuit_server.websockets.data.UserDetails;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping(path = "/api")
public class RestAPIController {

    @GetMapping(path = "user/{id}", produces = MediaType.APPLICATION_JSON_VALUE)
    public UserDetails getUser(@PathVariable("id") Long id) {
        return new UserDetails(1L, "Gloire", "bad-password");
    }
}
