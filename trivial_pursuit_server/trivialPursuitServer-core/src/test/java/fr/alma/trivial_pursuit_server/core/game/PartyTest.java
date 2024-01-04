package fr.alma.trivial_pursuit_server.core.game;

import fr.alma.trivial_pursuit_server.core.player.Player;
import fr.alma.trivial_pursuit_server.exception.PartyException;
import fr.alma.trivial_pursuit_server.exception.PlayerException;
import fr.alma.trivial_pursuit_server.util.Color;
import org.junit.jupiter.api.Assertions;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

class PartyTest {

    private Party party;
    private List<Player> playerList;

    @BeforeEach
    void setUp() throws PartyException, PlayerException {
        Board board = new Board();
        Chat chat = new Chat();
        playerList = new ArrayList<>(Arrays.asList(
                new Player(Color.GREEN, party),
                new Player(Color.YELLOW, party),
                new Player(Color.BLUE, party),
                new Player(Color.PINK, party),
                new Player(Color.ORANGE, party),
                new Player(Color.PURPLE, party)
        ));

        party = new Party("party", playerList, chat, board);
    }

    @Test
    @DisplayName("test default constructor")
    void testDefaultConstructor(){
        //CONFIG
        party = new Party();

        //ACTION
        //VERIFY
        Assertions.assertNull(party.getId());
        Assertions.assertNull(party.getChat());
        Assertions.assertNull(party.getName());
        Assertions.assertNull(party.getBoard());
        Assertions.assertEquals(6, party.getMaxCapacityPlayer());
        Assertions.assertTrue(party.getPlayerList().isEmpty());
    }


    @Test
    @DisplayName("test constructor with name and nbPlayer")
    void testConstructorWithNameAndNbPlayer(){
        //CONFIG
        party = new Party("party", 4);

        //ACTION
        //VERIFY
        Assertions.assertNull(party.getId());
        Assertions.assertNull(party.getChat());
        Assertions.assertEquals("party", party.getName());
        Assertions.assertNull(party.getBoard());
        Assertions.assertEquals(4, party.getMaxCapacityPlayer());
        Assertions.assertTrue(party.getPlayerList().isEmpty());
    }

    @Test
    @DisplayName("test constructor with name, playerList, chat and board")
    void testConstructorAndNamePlayerListChatAndBoard() {
        //CONFIG
        Board board = new Board();
        Chat chat = new Chat();

        //ACTION
        Assertions.assertDoesNotThrow(() -> party = new Party("party", playerList, chat, board));

        //VERIFY
        Assertions.assertNull(party.getId());
        Assertions.assertEquals(chat, party.getChat());
        Assertions.assertEquals("party", party.getName());
        Assertions.assertEquals(board, party.getBoard());
        Assertions.assertEquals(6, party.getMaxCapacityPlayer());
        Assertions.assertFalse(party.getPlayerList().isEmpty());
        for(Player p : playerList){
            Assertions.assertTrue(party.getPlayerList().contains(p));
            Assertions.assertEquals(party, p.getParty());
        }
    }

    @Test
    @DisplayName("test constructor with name, playerList, chat and board but exception occur on playerList")
    void testConstructorAndNamePlayerListChatAndBoardWithExceptionOnPlayerList() {
        //CONFIG
        Board board = new Board();
        Chat chat = new Chat();
        playerList.add(new Player());

        //ACTION
        //VERIFY
        Assertions.assertThrows(PartyException.class, () -> party = new Party("partyyy", playerList, chat, board));
        Assertions.assertNull(party.getId());
        Assertions.assertNotEquals(chat, party.getChat());
        Assertions.assertNotEquals("partyyy", party.getName());
        Assertions.assertNotEquals(board, party.getBoard());
        Assertions.assertEquals(6, party.getMaxCapacityPlayer());
        Assertions.assertNotEquals(playerList, party.getPlayerList());
    }

    @Test
    @DisplayName("test remove player correct")
    void testRemovePlayerWithoutExceptionOccurring(){
        //CONFIG
        //ACTION
        for(Player p : playerList){
            Assertions.assertDoesNotThrow(() -> party.removePlayer(p));
        }

        //VERIFY
        Assertions.assertTrue(party.getPlayerList().isEmpty());
    }

    @Test
    @DisplayName("test remove player with exception")
    void testRemovePlayerWithExceptionOccurring(){
        //CONFIG
        //ACTION
        for(Player p : playerList){
            Assertions.assertDoesNotThrow(() -> party.removePlayer(p));
        }

        //VERIFY
        Assertions.assertTrue(party.getPlayerList().isEmpty());
        Assertions.assertThrows(PartyException.class, () -> party.removePlayer(new Player()));
    }

    @Test
    @DisplayName("test check player ready false")
    void testCheckPlayerReadyFalse(){
        //CONFIG
        //ACTION
        Boolean result = party.checkPlayersReady();

        //VERIFY
        Assertions.assertFalse(result);
        for(Player p : party.getPlayerList()){
            Assertions.assertFalse(p.getReady());
        }
    }

    @Test
    @DisplayName("test check player ready true")
    void testCheckPlayerReadyTrue(){
        //CONFIG
        for(Player p : party.getPlayerList()){
            p.setReady(true);
        }

        //ACTION
        Boolean result = party.checkPlayersReady();

        //VERIFY
        Assertions.assertTrue(result);
        for(Player p : party.getPlayerList()){
            Assertions.assertTrue(p.getReady());
        }
    }

    @Test
    @DisplayName("test to set playerList with a correct list")
    void testSetPlayerListCorrectCase(){
        //CONFIG
        List<Player> playerListOf2Elm = new ArrayList<>(playerList);
        playerListOf2Elm.remove(0);
        playerListOf2Elm.remove(0);
        playerListOf2Elm.remove(0);
        playerListOf2Elm.remove(0);

        //ACTION
        Assertions.assertDoesNotThrow(() -> party.setPlayerList(playerList));
        Assertions.assertDoesNotThrow(() -> party.setPlayerList(playerListOf2Elm));

        //VERIFY
        Assertions.assertEquals(6, playerList.size());
        Assertions.assertEquals(2, playerListOf2Elm.size());
        Assertions.assertEquals(playerListOf2Elm, party.getPlayerList());
    }

    @Test
    @DisplayName("test to set playerList with an incorrect list")
    void testSetPlayerListIncorrectCase(){
        //CONFIG
        List<Player> playerListOf1Elm = new ArrayList<>();
        playerListOf1Elm.add(new Player());
        playerList.add(new Player());

        //ACTION
        //VERIFY
        Assertions.assertThrows(PartyException.class, () -> party.setPlayerList(playerList));
        Assertions.assertThrows(PartyException.class, () -> party.setPlayerList(playerListOf1Elm));
        Assertions.assertThrows(PartyException.class, () -> party.setPlayerList(null));
        Assertions.assertEquals(7, playerList.size());
        Assertions.assertEquals(1, playerListOf1Elm.size());
        Assertions.assertNotEquals(playerListOf1Elm, party.getPlayerList());
        Assertions.assertNotEquals(playerList, party.getPlayerList());
        Assertions.assertNotNull(party.getPlayerList());
    }
}
