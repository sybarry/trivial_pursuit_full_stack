package fr.alma.trivial_pursuit_server.websockets;

import com.fasterxml.jackson.databind.ObjectMapper;
import fr.alma.trivial_pursuit_server.core.game.Board;
import fr.alma.trivial_pursuit_server.core.game.Party;
import fr.alma.trivial_pursuit_server.core.player.Player;
import fr.alma.trivial_pursuit_server.core.player.User;
import fr.alma.trivial_pursuit_server.data.service.PartyService;
import fr.alma.trivial_pursuit_server.data.service.PlayerService;
import fr.alma.trivial_pursuit_server.data.service.UserService;
import fr.alma.trivial_pursuit_server.util.Color;
import org.junit.jupiter.api.Assertions;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders;
import java.util.Arrays;
import java.util.Collections;

import static org.hamcrest.Matchers.nullValue;
import static org.mockito.BDDMockito.given;
import static org.mockito.Mockito.atLeastOnce;
import static org.mockito.Mockito.verify;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(LobbyController.class)
class LobbyControllerTest {

    @Autowired
    private MockMvc mvc;
    @MockBean
    private UserService userService;
    @MockBean
    private PlayerService playerService;
    @MockBean
    private PartyService partyService;

    @Test
    @DisplayName("test checkPlayersReadyDetached method")
    void testCheckPlayersReady() throws Exception {
        //CONFIG
        Party party = new Party("party", 4);
        party.setId(1L);
        given(partyService.findById(party.getId()+"")).willReturn(party);
        given(partyService.findById(100+"")).willReturn(null);

        //ACTION
        MvcResult resultFalse = mvc.perform(get("/lobby/playersReady/"+party.getId())
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andReturn();

        MvcResult resultFalse2 = mvc.perform(get("/lobby/playersReady/"+100)
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andReturn();

        //VERIFY
        Assertions.assertEquals("false", resultFalse.getResponse().getContentAsString());
        Assertions.assertEquals("false", resultFalse2.getResponse().getContentAsString());

        //ACTION
        Player player = new Player();
        player.setReady(true);
        party.addPlayer(player);
        MvcResult resultTrue = mvc.perform(get("/lobby/playersReady/"+party.getId())
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andReturn();

        //VERIFY
        Assertions.assertEquals("true", resultTrue.getResponse().getContentAsString());
    }

    @Test
    @DisplayName("test get party")
    void testGetParty() throws Exception {
        //CONFIG
        Party party = new Party("party", 4);
        party.setId(1L);
        given(partyService.findById(party.getId()+"")).willReturn(party);
        given(partyService.findById(100+"")).willReturn(null);

        //ACTION
         mvc.perform(get("/lobby/getParty/"+party.getId())
                                .contentType(MediaType.APPLICATION_JSON))
                        .andExpect(status().isOk())
                        .andExpect(jsonPath("$.id").value(1))
                        .andExpect(jsonPath("$.playerList").isEmpty())
                        .andExpect(jsonPath("$.name").value("party"))
                        .andExpect(jsonPath("$.chat").value(nullValue()))
                        .andExpect(jsonPath("$.board").value(nullValue()))
                        .andExpect(jsonPath("$.maxCapacityPlayer").value(4))
                        .andReturn();

         MvcResult resultNull = mvc.perform(get("/lobby/getParty/"+100)
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andReturn();

        //VERIFY
        Assertions.assertEquals("", resultNull.getResponse().getContentAsString());
    }

    @Test
    @DisplayName("test ready")
    void testReady() throws Exception {
        //CONFIG
        User user = new User("user", "pass");
        User user2 = new User("user2", "pass2");
        given(userService.findByUserName(user.getUsername())).willReturn(user);
        given(userService.findByUserName(user2.getUsername())).willReturn(null);

        //ACTION
        mvc.perform(MockMvcRequestBuilders.post("/lobby/ready")
                        .content(asJsonString(user))
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andReturn();
        mvc.perform(MockMvcRequestBuilders.post("/lobby/ready")
                        .content(asJsonString(user2))
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andReturn();

        //VERIFY
        Assertions.assertNull(user.getUserPlayer());
        Assertions.assertNull(user2.getUserPlayer());

        //ACTION
        user.setUserPlayer(new Player(Color.GREEN, new Party()));
        mvc.perform(MockMvcRequestBuilders.post("/lobby/ready")
                        .content(asJsonString(user))
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andReturn();

        //VERIFY
        Assertions.assertTrue(user.getUserPlayer().getReady());
        verify(partyService, atLeastOnce()).flush();

        //ACTION
        user.setUserPlayer(new Player(Color.GREEN, new Party()));
        user.getUserPlayer().setReady(true);
        mvc.perform(MockMvcRequestBuilders.post("/lobby/ready")
                        .content(asJsonString(user))
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andReturn();

        //VERIFY
        Assertions.assertFalse(user.getUserPlayer().getReady());
    }

    @Test
    @DisplayName("test create party")
    void testCreateParty() throws Exception {
        //CONFIG
        Player player = new Player();

        Party partyMaxTrue = new Party("party",6);
        Party partyMinTrue = new Party("party",2);
        Party partyMinFalse = new Party("partyy",2);
        Party partyMaxFalse = new Party("partyyy",7);

        partyMaxTrue.setId(1L);
        partyMinTrue.setId(1L);

        partyMaxTrue.setPlayerList(Arrays.asList(player, player));
        partyMinTrue.setPlayerList(Arrays.asList(player, player));

        partyMinFalse.setPlayerList(Arrays.asList(player, player));
        partyMinFalse.setMaxCapacityPlayer(1);
        partyMaxFalse.setPlayerList(Arrays.asList(player, player));

        given(partyService.saveParty(Mockito.any())).willReturn(partyMaxTrue);

        //ACTION
        MvcResult resultTrueMax = mvc.perform(MockMvcRequestBuilders.post("/lobby/createParty")
                        .content(asJsonString(partyMaxTrue))
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isCreated())
                .andReturn();

        given(partyService.saveParty(Mockito.any())).willReturn(partyMinTrue);
        MvcResult resultTrueMin = mvc.perform(MockMvcRequestBuilders.post("/lobby/createParty")
                        .content(asJsonString(partyMinTrue))
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isCreated())
                .andReturn();

        MvcResult resultFalseMax = mvc.perform(MockMvcRequestBuilders.post("/lobby/createParty")
                        .content(asJsonString(partyMaxFalse))
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isCreated())
                .andReturn();
        MvcResult resultFalseMin = mvc.perform(MockMvcRequestBuilders.post("/lobby/createParty")
                        .content(asJsonString(partyMinFalse))
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isCreated())
                .andReturn();

        //VERIFY
        Assertions.assertEquals("true", resultTrueMax.getResponse().getContentAsString());
        Assertions.assertEquals("true", resultTrueMin.getResponse().getContentAsString());
        Assertions.assertEquals("false", resultFalseMax.getResponse().getContentAsString());
        Assertions.assertEquals("false", resultFalseMin.getResponse().getContentAsString());
    }

    @Test
    @DisplayName("test startGame")
    void testStartGame() throws Exception {
        //CONFIG
        Party party = new Party("party", 4);
        given(partyService.findById(Mockito.any())).willReturn(party);

        //ACTION
        MvcResult resultFalse = mvc.perform(get("/lobby/startGame/1")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andReturn();

        //VERIFY
        Assertions.assertEquals("false", resultFalse.getResponse().getContentAsString());
    }

    @Test
    @DisplayName("test join game")
    void testJoinGame() throws Exception {
        //CONFIG
        User user = new User("user", "pass");
        User user2 = new User("user2", "pass2");
        Party party = new Party("party", 6);
        given(userService.findByUserName(user.getUsername())).willReturn(user);
        given(userService.findByUserName(user2.getUsername())).willReturn(null);
        given(partyService.findById(Mockito.any())).willReturn(party);

        //ACTION
        MvcResult resultTrue = mvc.perform(MockMvcRequestBuilders.put("/lobby/joinGame/1")
                        .content(asJsonString(user))
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andReturn();
        MvcResult resultFalse = mvc.perform(MockMvcRequestBuilders.put("/lobby/joinGame/1")
                        .content(asJsonString(user2))
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andReturn();

        //VERIFY
        Assertions.assertEquals("true", resultTrue.getResponse().getContentAsString());
        Assertions.assertEquals("false", resultFalse.getResponse().getContentAsString());
        Assertions.assertNotNull(user.getUserPlayer());
        Assertions.assertNotNull(user.getUserPlayer().getUser());
        verify(partyService, atLeastOnce()).flush();

        //ACTION
        resultFalse = mvc.perform(MockMvcRequestBuilders.put("/lobby/joinGame/1")
                        .content(asJsonString(user))
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andReturn();

        //VERIFY
        Assertions.assertEquals("false", resultFalse.getResponse().getContentAsString());

        //ACTION
        while(party.playersCanJoin()){
            party.addPlayer(new Player());
        }
        user.setUserPlayer(null);
        resultFalse = mvc.perform(MockMvcRequestBuilders.put("/lobby/joinGame/1")
                        .content(asJsonString(user))
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andReturn();

        //VERIFY
        Assertions.assertEquals("false", resultFalse.getResponse().getContentAsString());

        //CONFIG
        given(partyService.findById(Mockito.any())).willReturn(null);
        user.setUserPlayer(null);

        //ACTION
        resultFalse = mvc.perform(MockMvcRequestBuilders.put("/lobby/joinGame/1")
                        .content(asJsonString(user))
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andReturn();

        //VERIFY
        Assertions.assertEquals("false", resultFalse.getResponse().getContentAsString());

    }

    @Test
    @DisplayName("test history")
    void testHistory() throws Exception {
        //CONFIG
        User user = new User("user", "pass");
        User user2 = new User("user2", "pass2");
        given(userService.findByUserName(user.getUsername())).willReturn(user);
        given(userService.findByUserName(user2.getUsername())).willReturn(null);

        Party party = new Party("party",Collections.emptyList(),null, new Board());
        given(partyService.findAllByPlayer(Mockito.any())).willReturn(Collections.singletonList(party));

        //ACTION
        MvcResult resultEmptyListTrue = mvc.perform(MockMvcRequestBuilders.post("/lobby/history")
                        .content(asJsonString(user))
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andReturn();

        MvcResult resultEmptyListFalse = mvc.perform(MockMvcRequestBuilders.post("/lobby/history")
                        .content(asJsonString(user2))
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andReturn();

        //VERIFY
        Assertions.assertNull(party.getBoard());
        Assertions.assertNotEquals("[]", resultEmptyListTrue.getResponse().getContentAsString());
        Assertions.assertEquals("[]", resultEmptyListFalse.getResponse().getContentAsString());

        //CONFIG
        party = new Party();

        //ACTION
        resultEmptyListTrue = mvc.perform(MockMvcRequestBuilders.post("/lobby/history")
                        .content(asJsonString(user))
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andReturn();

        //VERIFY
        Assertions.assertNull(party.getBoard());
        Assertions.assertNotEquals("[]", resultEmptyListTrue.getResponse().getContentAsString());


    }

    @Test
    @DisplayName("test partyAll")
    void testPartyAll() throws Exception {
        Party party = new Party();
        given(partyService.findAll()).willReturn(Collections.singletonList(party));

        //ACTION
        MvcResult result = mvc.perform(get("/lobby/partyAll")
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].id").value(nullValue()))
                .andExpect(jsonPath("$[0].playerList").isEmpty())
                .andExpect(jsonPath("$[0].chat").value(nullValue()))
                .andExpect(jsonPath("$[0].board").value(nullValue()))
                .andExpect(jsonPath("$[0].maxCapacityPlayer").value(6))
                .andExpect(jsonPath("$[0].name").value(nullValue()))
                .andReturn();

        //VERIFY
        Assertions.assertFalse(result.getResponse().getContentAsString().isEmpty());

        //CONFIG
        party.setBoard(new Board());

        //ACTION
        result = mvc.perform(get("/lobby/partyAll")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].id").value(nullValue()))
                .andExpect(jsonPath("$[0].playerList").isEmpty())
                .andExpect(jsonPath("$[0].chat").value(nullValue()))
                .andExpect(jsonPath("$[0].board").value(nullValue()))
                .andExpect(jsonPath("$[0].maxCapacityPlayer").value(6))
                .andExpect(jsonPath("$[0].name").value(nullValue()))
                .andReturn();

        //VERIFY
        Assertions.assertFalse(result.getResponse().getContentAsString().isEmpty());

    }
    public static String asJsonString(final Object obj) {
        try {
            return new ObjectMapper().writeValueAsString(obj);
        } catch (Exception e) {
            throw new RuntimeException(e);
        }
    }
}
