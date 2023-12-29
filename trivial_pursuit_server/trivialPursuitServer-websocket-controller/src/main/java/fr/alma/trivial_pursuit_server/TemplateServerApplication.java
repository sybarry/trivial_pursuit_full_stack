package fr.alma.trivial_pursuit_server;

import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.builder.SpringApplicationBuilder;

@SpringBootApplication
public class TemplateServerApplication {

    public static void main(String[] args) {
        new SpringApplicationBuilder()
                .main(TemplateServerApplication.class)
                .sources(TemplateServerApplication.class)
                .profiles("server")
                .run(args);
    }
}