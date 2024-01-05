package fr.alma.trivial_pursuit_server.data.repository;

import fr.alma.trivial_pursuit_server.core.player.User;
import fr.alma.trivial_pursuit_server.data.configuration.DataTestConfiguration;
import jakarta.annotation.Resource;
import jakarta.transaction.Transactional;
import org.junit.jupiter.api.Assertions;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.springframework.test.context.ContextConfiguration;
import org.springframework.test.context.junit.jupiter.SpringExtension;
import org.springframework.test.context.support.AnnotationConfigContextLoader;

@ExtendWith(SpringExtension.class)
@ContextConfiguration(
        classes = {DataTestConfiguration.class},
        loader = AnnotationConfigContextLoader.class)
@Transactional
class UserRepositoryTest {
    @Resource
    private UserRepository userRepository;

    private User user;
    @BeforeEach
    void setUp() {
        user = new User("username", "password");
    }

    @Test
    @DisplayName("test add, change password and check")
    void testInsertUser() {
        //CONFIG
        //ACTION
        userRepository.save(user);
        userRepository.find(user).setPassword("pass");

        //VERIFY
        Assertions.assertTrue(userRepository.existsById(user.getId()));
        Assertions.assertEquals(user, userRepository.find(user));
        Assertions.assertEquals(1, userRepository.findAll().size());
        Assertions.assertEquals(1,userRepository.count());

        Assertions.assertEquals("pass", userRepository.find(user).getPassword());
        Assertions.assertNotEquals("password", userRepository.find(user).getPassword());

        Assertions.assertEquals(user, userRepository.findByUserName("username"));
    }
}
