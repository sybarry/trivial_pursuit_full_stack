package fr.alma.TrivialPursuitServer.websockets;

import fr.alma.TrivialPursuitServer.websockets.data.UserDetails;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.messaging.rsocket.RSocketRequester;
import reactor.core.publisher.Mono;
import reactor.test.StepVerifier;

@SpringBootTest
class RSocketControllerTest {

    @Autowired
    private Mono<RSocketRequester> rSocketRequester;

    @Test
    void testRetrieveUser() {
        Mono<UserDetails> ticketRequestMono = this.rSocketRequester
                .map(r -> r.route("user").data(1))
                .flatMap(r -> r.retrieveMono(UserDetails.class))
                .doOnNext(r -> System.out.println(r.id() + ":" + r.name()));

        StepVerifier.create(ticketRequestMono)
                .expectNextMatches(t -> t.name().equals("Owen"))
                .verifyComplete();
    }
}