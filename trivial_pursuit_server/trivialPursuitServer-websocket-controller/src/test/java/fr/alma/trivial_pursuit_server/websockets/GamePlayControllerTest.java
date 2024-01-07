package fr.alma.trivial_pursuit_server.websockets;

import fr.alma.trivial_pursuit_server.core.game.Party;
import fr.alma.trivial_pursuit_server.data.service.CardService;
import fr.alma.trivial_pursuit_server.data.service.PartyService;
import fr.alma.trivial_pursuit_server.data.service.PlayerService;
import fr.alma.trivial_pursuit_server.data.service.UserService;
import org.junit.jupiter.api.Assertions;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import static org.mockito.BDDMockito.given;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

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

        //ACTION
        Assertions.assertTrue(true);

        //VERIFY
        mvc.perform(get("/gameplay/createChat/"+party.getId())
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk());
    }
}
