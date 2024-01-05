package fr.alma.trivial_pursuit_server.core.player;

import org.junit.jupiter.api.Assertions;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

class UserTest {
    //TODO
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
}
