package fr.alma.trivial_pursuit_server.core.player;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.ObjectWriter;
import fr.alma.trivial_pursuit_server.core.cases.Case;
import fr.alma.trivial_pursuit_server.core.cases.SimpleCase;
import fr.alma.trivial_pursuit_server.core.game.Party;
import fr.alma.trivial_pursuit_server.exception.PlayerException;
import fr.alma.trivial_pursuit_server.util.Color;
import fr.alma.trivial_pursuit_server.util.Theme;
import org.junit.jupiter.api.Assertions;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

class PlayerTest {

    private Player player;

    @BeforeEach
    void setUp() {
        player = new Player();
        player.setId(1L);
    }

    @Test
    @DisplayName("test player default constructor")
    void testDefaultConstructor(){
        //CONFIG
        player = new Player();

        //ACTION
        //VERIFY
        Assertions.assertNull(player.getParty());
        Assertions.assertNull(player.getActualCase());
        Assertions.assertNull(player.getId());
        Assertions.assertEquals(0, player.getNbTriangle());
        Assertions.assertFalse(player.getReady());
        Assertions.assertNull(player.getPawn());
        Assertions.assertNull(player.getUser());
    }

    @Test
    @DisplayName("test player constructor with only Color parameter")
    void testConstructorColorParameter(){
        //CONFIG
        player = new Player(Color.GREEN);

        //ACTION
        //VERIFY
        Assertions.assertNull(player.getParty());
        Assertions.assertNull(player.getActualCase());
        Assertions.assertNull(player.getId());
        Assertions.assertNull(player.getUser());
        Assertions.assertEquals(0, player.getNbTriangle());
        Assertions.assertFalse(player.getReady());
        Assertions.assertEquals(Color.GREEN, player.getPawn());
    }

    @Test
    @DisplayName("test player constructor with Color, User and party parameters")
    void testConstructorColorUserAndPartyParameter(){
        //CONFIG
        Party party = new Party();
        User user = new User();
        player = new Player(Color.GREEN, party, user);

        //ACTION
        //VERIFY
        Assertions.assertEquals(party, player.getParty());
        Assertions.assertEquals(user, player.getUser());
        Assertions.assertNull(player.getActualCase());
        Assertions.assertNull(player.getId());
        Assertions.assertEquals(0, player.getNbTriangle());
        Assertions.assertFalse(player.getReady());
        Assertions.assertEquals(Color.GREEN, player.getPawn());
    }

    @Test
    @DisplayName("test setter on party field with correct party")
    void testSetterPartyWithCorrectParameter(){
        //CONFIG
        Party party = new Party();

        //ACTION
        Assertions.assertDoesNotThrow(() -> player.setParty(party));

        //VERIFY
        Assertions.assertEquals(party, player.getParty());
    }

    @Test
    @DisplayName("test setter on party field with null party")
    void testSetterPartyWithNullParameter(){
        //CONFIG
        //ACTION
        Assertions.assertThrows(PlayerException.class, () -> player.setParty(null));

        //VERIFY
        Assertions.assertNull(player.getParty());
    }

    @Test
    @DisplayName("test lombok setter")
    void testLombokSetter(){
        //CONFIG
        Case aCase = new SimpleCase("case1", Color.PINK, Theme.ARTS_LITERATURE);

        //ACTION
        player.setPawn(Color.YELLOW);
        player.setNbTriangle(5);
        player.setReady(true);
        player.setActualCase(aCase);
        player.setUser(new User("username", "password"));

        //VERIFY
        Assertions.assertTrue(player.getReady());
        Assertions.assertEquals(5, player.getNbTriangle());
        Assertions.assertEquals(Color.YELLOW, player.getPawn());
        Assertions.assertEquals(aCase, player.getActualCase());
        Assertions.assertEquals("username", player.getUser().getUsername());
        Assertions.assertEquals("password", player.getUser().getPassword());
    }
}
