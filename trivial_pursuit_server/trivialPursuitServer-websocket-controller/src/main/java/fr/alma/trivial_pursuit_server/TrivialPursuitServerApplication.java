package fr.alma.trivial_pursuit_server;

import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.builder.SpringApplicationBuilder;

@SpringBootApplication
public class TrivialPursuitServerApplication {

    public static void main(String[] args) {
        new SpringApplicationBuilder()
                .main(TrivialPursuitServerApplication.class)
                .sources(TrivialPursuitServerApplication.class)
                .profiles("server")
                .run(args);
    }
}