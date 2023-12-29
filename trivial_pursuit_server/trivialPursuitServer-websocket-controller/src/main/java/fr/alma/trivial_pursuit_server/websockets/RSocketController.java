package fr.alma.trivial_pursuit_server.websockets;

import fr.alma.trivial_pursuit_server.websockets.data.UserDetails;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.stereotype.Controller;
import reactor.core.publisher.Mono;

@Controller
public class RSocketController {


    @MessageMapping("user")
    public Mono<UserDetails> getUser(Long id) {
        return Mono.just(new UserDetails(1L, "Owen", "Wilson"));
    }

}
