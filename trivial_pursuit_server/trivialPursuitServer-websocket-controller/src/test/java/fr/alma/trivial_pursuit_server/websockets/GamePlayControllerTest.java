package fr.alma.trivial_pursuit_server.websockets;

import fr.alma.trivial_pursuit_server.core.card.Answer;
import fr.alma.trivial_pursuit_server.core.card.Card;
import fr.alma.trivial_pursuit_server.core.card.Question;
import fr.alma.trivial_pursuit_server.core.game.Chat;
import fr.alma.trivial_pursuit_server.core.game.Party;
import fr.alma.trivial_pursuit_server.data.service.CardService;
import fr.alma.trivial_pursuit_server.data.service.PartyService;
import fr.alma.trivial_pursuit_server.data.service.PlayerService;
import fr.alma.trivial_pursuit_server.data.service.UserService;
import fr.alma.trivial_pursuit_server.exception.CardException;
import fr.alma.trivial_pursuit_server.util.Theme;
import org.junit.jupiter.api.Assertions;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;

import java.util.Arrays;

import static org.hamcrest.Matchers.instanceOf;
import static org.hamcrest.Matchers.nullValue;
import static org.mockito.BDDMockito.given;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(GamePlayController.class)
class GamePlayControllerTest {

    @Autowired
    private MockMvc mvc;

    @MockBean
    private PartyService partyService;
    @MockBean
    private CardService cardService;
    @MockBean
    private PlayerService playerService;
    @MockBean
    private UserService userService;

    @Test
    @DisplayName("test create chat")
    void testCreateChat() throws Exception {
        //CONFIG
        Party party = new Party("party", 4);
        party.setId(1L);
        given(partyService.findById(party.getId()+"")).willReturn(party);
        given(partyService.findById(100+"")).willReturn(null);

        //ACTION
        //VERIFY
        MvcResult resultNotNull = mvc.perform(get("/gameplay/createChat/"+party.getId())
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").value(nullValue()))
                .andExpect(jsonPath("$.messages").isEmpty())
                .andReturn();

        MvcResult resultNull = mvc.perform(get("/gameplay/createChat/"+100)
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isCreated())
                .andReturn();

        Assertions.assertNotNull(party.getChat());

//        Assertions.assertEquals("{\"id\":null,\"messages\":[]}", resultNotNull.getResponse().getContentAsString());
        Assertions.assertEquals("", resultNull.getResponse().getContentAsString());
    }

    @Test
    @DisplayName("test end game")
    void testEndGame() throws Exception {
        //CONFIG
        Party party = new Party("party", 4);
        party.setId(1L);
        given(partyService.findById(party.getId()+"")).willReturn(party);
        given(partyService.findById(100+"")).willReturn(null);

        //ACTION
        //VERIFY
        MvcResult result = mvc.perform(get("/gameplay/endGame/"+party.getId())
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andReturn();

        MvcResult resultNull = mvc.perform(get("/gameplay/endGame/"+100)
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andReturn();

        Assertions.assertTrue(result.getResponse().getContentAsString().isEmpty());
        Assertions.assertTrue(resultNull.getResponse().getContentAsString().isEmpty());
        Assertions.assertTrue(party.getPlayerList().isEmpty());
    }

    @Test
    @DisplayName("test analyse response")
    void testAnalyseResponse() throws Exception {
        //CONFIG
        Card card = new Card();
        card.setId(1L);
        Question q = new Question("who i am", null, Theme.GEOGRAPHY);
        Question q2 = new Question("how old i am", null, Theme.ENTERTAINMENT);
        Question q3 = new Question("who i am", null, Theme.ARTS_LITERATURE);
        Question q4 = new Question("who i am", null, Theme.SCIENCE_NATURE);
        Question q5 = new Question("who i am", null, Theme.SPORTS_LEISURE);
        Question q6 = new Question("who i am", null, Theme.HISTORY);
        Answer a = new Answer("hugo", Theme.GEOGRAPHY);
        Answer a2 = new Answer("hugo", Theme.ENTERTAINMENT);
        Answer a3 = new Answer("hugo", Theme.ARTS_LITERATURE);
        Answer a4 = new Answer("hugo", Theme.SCIENCE_NATURE);
        Answer a5 = new Answer("hugo", Theme.SPORTS_LEISURE);
        Answer a6 = new Answer("hugo", Theme.HISTORY);

        given(cardService.findById(card.getId()+"")).willReturn(card);
        given(cardService.findById(100+"")).willReturn(null);

        //ACTION
        q.setAnswer(a);
        q2.setAnswer(a2);
        q3.setAnswer(a3);
        q4.setAnswer(a4);
        q5.setAnswer(a5);
        q6.setAnswer(a6);

        card.setQuestions(Arrays.asList(q,q2,q3,q4,q5,q6));
        card.setAnswers(Arrays.asList(a,a2,a3,a4,a5,a6));

        //VERIFY
        MvcResult resultTrue = mvc.perform(get("/gameplay/analyseResponse/"+card.getId()+"/GEOGRAPHY/hugo")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andReturn();

        MvcResult resultFalse = mvc.perform(get("/gameplay/analyseResponse/"+card.getId()+"/GEOGRAPHY/hugoooo")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andReturn();

        MvcResult resultFalseNull = mvc.perform(get("/gameplay/analyseResponse/"+100+"/GEOGRAPHY/hugoooo")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andReturn();

        Assertions.assertEquals("true", resultTrue.getResponse().getContentAsString());
        Assertions.assertEquals("false", resultFalse.getResponse().getContentAsString());
        Assertions.assertEquals("false", resultFalseNull.getResponse().getContentAsString());

    }
}
