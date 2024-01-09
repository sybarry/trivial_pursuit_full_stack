package fr.alma.trivial_pursuit_server.websockets;

import com.fasterxml.jackson.databind.ObjectMapper;
import fr.alma.trivial_pursuit_server.core.player.User;
import fr.alma.trivial_pursuit_server.data.service.CardService;
import fr.alma.trivial_pursuit_server.data.service.PartyService;
import fr.alma.trivial_pursuit_server.data.service.PlayerService;
import fr.alma.trivial_pursuit_server.data.service.UserService;
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

import static org.mockito.BDDMockito.given;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(LoginController.class)
public class LoginControllerTest {

    @Autowired
    private MockMvc mvc;
    @MockBean
    private UserService userService;

    @Test
    @DisplayName("test login")
    void testLogin() throws Exception {
        //CONFIG
        User user = new User("user", "pass");
        given(userService.isInRepository(Mockito.any())).willReturn(true);

        //ACTION
        //VERIFY
        MvcResult resultTrue = mvc.perform(MockMvcRequestBuilders.post("/api/login")
                        .content(asJsonString(user))
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andReturn();

        Assertions.assertEquals("true", resultTrue.getResponse().getContentAsString());

        //CONFIG
        given(userService.isInRepository(Mockito.any())).willReturn(false);

        //ACTION
        //VERIFY
        MvcResult resultFalse = mvc.perform(MockMvcRequestBuilders.post("/api/login")
                        .content(asJsonString(user))
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andReturn();

        Assertions.assertEquals("false", resultFalse.getResponse().getContentAsString());
    }

    @Test
    @DisplayName("test create account")
    void testCreateAccount() throws Exception {
        //CONFIG
        User user = new User("user", "pass");
        given(userService.saveUser(Mockito.any())).willReturn(user);

        //ACTION
        //VERIFY
        MvcResult resultTrue = mvc.perform(MockMvcRequestBuilders.post("/api/createAccount")
                        .content(asJsonString(user))
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andReturn();

        Assertions.assertEquals("true", resultTrue.getResponse().getContentAsString());

        //CONFIG
        given(userService.saveUser(Mockito.any())).willReturn(null);

        //ACTION
        //VERIFY
        MvcResult resultFalse = mvc.perform(MockMvcRequestBuilders.post("/api/createAccount")
                        .content(asJsonString(user))
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andReturn();

        Assertions.assertEquals("false", resultFalse.getResponse().getContentAsString());
    }

    @Test
    @DisplayName("test newPassword")
    void testNewPassword() throws Exception {
        //CONFIG
        User user = new User("user", "pass");
        User user2 = new User("user2", "pass2");
        given(userService.changePassword(user.getUsername(), user.getPassword())).willReturn(true);
        given(userService.resetPassword(user.getUsername())).willReturn(true);
        given(userService.resetPassword(user2.getUsername())).willReturn(true);
        given(userService.changePassword(user2.getUsername(), user2.getPassword())).willReturn(false);

        //ACTION
        //VERIFY
        MvcResult resultTrue = mvc.perform(MockMvcRequestBuilders.post("/api/newPassword")
                        .content(asJsonString(user))
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andReturn();

        MvcResult resultFalse = mvc.perform(MockMvcRequestBuilders.post("/api/newPassword")
                        .content(asJsonString(user2))
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andReturn();

        Assertions.assertEquals("true", resultTrue.getResponse().getContentAsString());
        Assertions.assertEquals("false", resultFalse.getResponse().getContentAsString());

        //CONFIG
        given(userService.resetPassword(user2.getUsername())).willReturn(false);

        //ACTION
        //VERIFY
        resultFalse = mvc.perform(MockMvcRequestBuilders.post("/api/newPassword")
                        .content(asJsonString(user2))
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andReturn();

        Assertions.assertEquals("false", resultFalse.getResponse().getContentAsString());
    }

    public static String asJsonString(final Object obj) {
        try {
            return new ObjectMapper().writeValueAsString(obj);
        } catch (Exception e) {
            throw new RuntimeException(e);
        }
    }
}
