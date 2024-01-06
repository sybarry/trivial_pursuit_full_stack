package fr.alma.trivial_pursuit_server.websockets;

import io.rsocket.transport.netty.client.WebsocketClientTransport;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.PropertySource;
import org.springframework.core.env.Environment;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;
import org.springframework.http.MediaType;
import org.springframework.jdbc.datasource.DriverManagerDataSource;
import org.springframework.messaging.rsocket.RSocketRequester;
import org.springframework.transaction.annotation.EnableTransactionManagement;
import reactor.core.publisher.Mono;
import reactor.util.retry.Retry;

import javax.sql.DataSource;
import java.time.Duration;

@Configuration
@EnableJpaRepositories(basePackages = {"fr.alma.trivial_pursuit_server.data","fr.alma.trivial_pursuit_server.websockets"})
@PropertySource("classpath:websocket-persistance.properties")
@EnableTransactionManagement
public class RSocketTestConfig {

    @Value("${spring.rsocket.server.port}")
    private int serverPort;

    @Autowired
    private Environment env;

    @Bean
    public Mono<RSocketRequester> getRSocketRequester(RSocketRequester.Builder builder) {
        return builder
                .rsocketConnector(rSocketConnector -> rSocketConnector.reconnect(Retry.fixedDelay(2, Duration.ofSeconds(2))))
                .dataMimeType(MediaType.APPLICATION_JSON)
                .connect(WebsocketClientTransport.create(serverPort));
    }

    @Bean
    public DataSource dataSource() {
        DriverManagerDataSource dataSource = new DriverManagerDataSource();
        dataSource.setDriverClassName(env.getProperty("jakarta.persistence.jdbc.driver"));
        dataSource.setUrl(env.getProperty("jakarta.persistence.jdbc.url"));
        dataSource.setUsername(env.getProperty("jakarta.persistence.jdbc.user"));
        dataSource.setPassword(env.getProperty("jakarta.persistence.jdbc.password"));

        return dataSource;
    }
}