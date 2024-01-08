package fr.alma.trivial_pursuit_server.core.game;

import fr.alma.trivial_pursuit_server.core.player.Player;
import fr.alma.trivial_pursuit_server.exception.BoardException;
import fr.alma.trivial_pursuit_server.exception.PartyException;
import fr.alma.trivial_pursuit_server.exception.PlayerException;
import fr.alma.trivial_pursuit_server.util.Color;
import fr.alma.trivial_pursuit_server.util.Constant;
import org.junit.jupiter.api.Assertions;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.io.IOException;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

class PartyTest {

    private Party party;
    private List<Player> playerList;

    @BeforeEach
    void setUp() throws PartyException, PlayerException {
        Chat chat = new Chat();
        playerList = new ArrayList<>(Arrays.asList(
                new Player(Color.GREEN, party),
                new Player(Color.YELLOW, party),
                new Player(Color.BLUE, party),
                new Player(Color.PINK, party),
                new Player(Color.ORANGE, party),
                new Player(Color.PURPLE, party)
        ));
        Board board = new Board();
        party = new Party("party", playerList, chat, board);
    }

    @Test
    @DisplayName("test setter")
    void testSetter() throws PartyException, IOException, BoardException {
        //CONFIG
        party = new Party();

        //ACTION
        party.setChat(new Chat());
        party.setId(1L);
        party.setPlayerList(playerList);
        party.setName("partySet");
        party.setBoard(BoardFactory.createBoard(playerList));
        party.setMaxCapacityPlayer(5);


        //VERIFY
        Assertions.assertNotNull(party.getChat());
        Assertions.assertNotNull(party.getBoard());
        Assertions.assertEquals(5, party.getMaxCapacityPlayer());
        Assertions.assertEquals(1L, party.getId());
        Assertions.assertEquals("partySet", party.getName());
        Assertions.assertEquals(playerList, party.getPlayerList());
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
        Assertions.assertEquals(Constant.BOARD_AND_PARTY_PLAYER_LIST_MAX_SIZE, party.getMaxCapacityPlayer());
        Assertions.assertTrue(party.getPlayerList().isEmpty());
    }


    @Test
    @DisplayName("test constructor with name and nbPlayer")
    void testConstructorWithNameAndNbPlayer() {
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
        Assertions.assertEquals(playerList.size(), party.getMaxCapacityPlayer());
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
        Assertions.assertEquals(Constant.BOARD_AND_PARTY_PLAYER_LIST_MAX_SIZE, party.getMaxCapacityPlayer());
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
    void testCheckPlayerReadyFalse() throws PartyException {
        //CONFIG
        List<Player> playerListCopy = new ArrayList<>(playerList);

        //ACTION
        boolean result = party.checkPlayersReady();

        for(Player p : playerListCopy){
            party.removePlayer(p);
        }
        boolean resultFalseBecauseListEmpty = party.checkPlayersReady();

        //VERIFY
        Assertions.assertFalse(result);
        Assertions.assertFalse(resultFalseBecauseListEmpty);
    }

    @Test
    @DisplayName("test check player ready true")
    void testCheckPlayerReadyTrue(){
        //CONFIG
        for(Player p : party.getPlayerList()){
            p.setReady(true);
        }

        //ACTION
        boolean result = party.checkPlayersReady();

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

    @Test
    @DisplayName("test can join method true")
    void testPlayersCanJoinTrue() {
        //CONFIG
        party = new Party("party",4);

        //ACTION
        Assertions.assertDoesNotThrow(() -> party.addPlayer(new Player(Color.GREEN, party)));
        boolean result = party.playersCanJoin();

        //VERIFY
        Assertions.assertTrue(result);
    }

    @Test
    @DisplayName("test can join method false")
    void testPlayersCanJoinFalse() {
        //CONFIG
        //ACTION
        boolean result = party.playersCanJoin();

        //VERIFY
        Assertions.assertFalse(result);
    }

    @Test
    @DisplayName("test build a valid player")
    void testBuildAValidPlayer(){
        //CONFIG
        Assertions.assertThrows(IndexOutOfBoundsException.class, ()->party.buildAValidNewPlayer());
        party = new Party();

        //ACTION
        Player playerBuild = party.buildAValidNewPlayer();

        //VERIFY
        Assertions.assertTrue(party.getPlayerList().contains(playerBuild));
        Assertions.assertEquals(party, playerBuild.getParty());
    }
}
