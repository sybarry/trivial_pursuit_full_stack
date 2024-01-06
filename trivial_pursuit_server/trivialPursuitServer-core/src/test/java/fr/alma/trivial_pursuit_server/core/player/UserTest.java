package fr.alma.trivial_pursuit_server.core.player;

import org.junit.jupiter.api.Assertions;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

class UserTest {
    private User user;

    @BeforeEach
    void setUp() {
        user = new User();
    }

    @Test
    @DisplayName("test default constructor")
    void testDefaultConstructor(){
        //CONFIG
        //ACTION
        //VERIFY
        Assertions.assertNull(user.getPassword());
        Assertions.assertNull(user.getUsername());
        Assertions.assertNull(user.getUserPlayer());
        Assertions.assertNull(user.getId());
    }

    @Test
    @DisplayName("test setter")
    void testSetter(){
        //CONFIG
        Player player = new Player();

        //ACTION
        user.setId(1L);
        user.setPassword("password");
        user.setUsername("username");
        user.setUserPlayer(player);

        //VERIFY
        Assertions.assertEquals(1L, user.getId());
        Assertions.assertEquals("password", user.getPassword());
        Assertions.assertEquals("username", user.getUsername());
        Assertions.assertEquals(player, user.getUserPlayer());
    }
}
