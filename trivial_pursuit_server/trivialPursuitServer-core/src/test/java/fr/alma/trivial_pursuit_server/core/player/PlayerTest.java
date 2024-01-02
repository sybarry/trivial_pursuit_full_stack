package fr.alma.trivial_pursuit_server.core.player;

import fr.alma.trivial_pursuit_server.core.game.Party;
import fr.alma.trivial_pursuit_server.exception.PlayerException;
import fr.alma.trivial_pursuit_server.util.Color;
import org.junit.jupiter.api.Assertions;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

class PlayerTest {
    //TODO

//    Patron de test
//    @Test
//    @DisplayName("describingText")
//    void test(){
//        //CONFIG
//
//        //ACTION
//
//        //VERIFY
//    }

    private Player player;

    @BeforeEach
    void setUp(){
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
        Assertions.assertEquals(0, player.getNbTriangle());
        Assertions.assertFalse(player.getReady());
        Assertions.assertEquals(Color.GREEN, player.getPawn());
    }

    @Test
    @DisplayName("test player constructor with Color and party parameters")
    void testConstructorColorAndPartyParameter(){
        //CONFIG
        Party party = new Party();
        player = new Player(Color.GREEN, party);

        //ACTION
        //VERIFY
        Assertions.assertEquals(party, player.getParty());
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
}
