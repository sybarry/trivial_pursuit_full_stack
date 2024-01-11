package fr.alma.trivial_pursuit_server.websockets;

import com.fasterxml.jackson.databind.ObjectMapper;
import fr.alma.trivial_pursuit_server.core.player.User;
import fr.alma.trivial_pursuit_server.util.Constant;
import fr.alma.trivial_pursuit_server.data.service.UserService;
import org.hibernate.exception.ConstraintViolationException;
import org.junit.jupiter.api.Assertions;
import org.junit.jupiter.api.BeforeEach;
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

import static org.hamcrest.Matchers.nullValue;
import static org.mockito.BDDMockito.given;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(LoginController.class)
public class LoginControllerTest {

    @Autowired
    private MockMvc mvc;
    @MockBean
    private UserService userService;

    private User user;
    private User user2;

    @BeforeEach
    void setUp(){
        user = new User("user", "pass");
        user2 = new User("user2", "pass2");
    }

    @Test
    @DisplayName("test login")
    void testLogin() throws Exception {
        //CONFIG
        given(userService.isInRepository(Mockito.any())).willReturn(true);

        //ACTION
        MvcResult resultTrue = mvc.perform(MockMvcRequestBuilders.post("/api/login")
                        .content(asJsonString(user))
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andReturn();

        //VERIFY
        Assertions.assertEquals("true", resultTrue.getResponse().getContentAsString());

        //CONFIG
        given(userService.isInRepository(Mockito.any())).willReturn(false);

        //ACTION
        MvcResult resultFalse = mvc.perform(MockMvcRequestBuilders.post("/api/login")
                        .content(asJsonString(user))
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andReturn();

        //VERIFY
        Assertions.assertEquals("false", resultFalse.getResponse().getContentAsString());
    }

    @Test
    @DisplayName("test create account")
    void testCreateAccount() throws Exception {
        //CONFIG
        given(userService.saveUser(Mockito.any())).willReturn(user);

        //ACTION
        MvcResult resultTrue = mvc.perform(MockMvcRequestBuilders.post("/api/createAccount")
                        .content(asJsonString(user))
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isCreated())
                .andReturn();

        //VERIFY
        Assertions.assertEquals("true", resultTrue.getResponse().getContentAsString());

        //CONFIG
        given(userService.saveUser(Mockito.any())).willReturn(null);

        //ACTION
        MvcResult resultFalse = mvc.perform(MockMvcRequestBuilders.post("/api/createAccount")
                        .content(asJsonString(user))
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isCreated())
                .andReturn();

        //VERIFY
        Assertions.assertEquals("false", resultFalse.getResponse().getContentAsString());

        //CONFIG
        given(userService.saveUser(Mockito.any())).willThrow(ConstraintViolationException.class);

        //ACTION
        resultFalse = mvc.perform(MockMvcRequestBuilders.post("/api/createAccount")
                        .content(asJsonString(user))
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isCreated())
                .andReturn();

        //VERIFY
        Assertions.assertEquals("false", resultFalse.getResponse().getContentAsString());
    }

    @Test
    @DisplayName("test newPassword")
    void testNewPassword() throws Exception {
        //CONFIG
        given(userService.changePassword(user.getUsername(), user.getPassword())).willReturn(true);
        given(userService.resetPassword(user.getUsername())).willReturn(true);
        given(userService.resetPassword(user2.getUsername())).willReturn(true);
        given(userService.changePassword(user2.getUsername(), user2.getPassword())).willReturn(false);

        //ACTION
        MvcResult resultTrue = mvc.perform(MockMvcRequestBuilders.put("/api/newPassword")
                        .content(asJsonString(user))
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andReturn();

        MvcResult resultFalse = mvc.perform(MockMvcRequestBuilders.put("/api/newPassword")
                        .content(asJsonString(user2))
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andReturn();

        //VERIFY
        Assertions.assertEquals("true", resultTrue.getResponse().getContentAsString());
        Assertions.assertEquals("false", resultFalse.getResponse().getContentAsString());

        //CONFIG
        given(userService.resetPassword(user2.getUsername())).willReturn(false);
        given(userService.changePassword(user2.getUsername(), user2.getPassword())).willReturn(true);

        //ACTION
        resultFalse = mvc.perform(MockMvcRequestBuilders.put("/api/newPassword")
                        .content(asJsonString(user2))
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andReturn();

        //VERIFY
        Assertions.assertEquals("false", resultFalse.getResponse().getContentAsString());
    }

    @Test
    @DisplayName("test getUser")
    void testGetUser() throws Exception {
        //CONFIG
        User userHash = new User("user", Constant.getSHA512SecurePassword("pass"));
        given(userService.findByUserName(user.getUsername())).willReturn(userHash);
        given(userService.findByUserName(user2.getUsername())).willReturn(null);

        //ACTION
        mvc.perform(get("/api/user/"+user.getUsername())
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(nullValue()))
                .andExpect(jsonPath("$.username").value("user"))
                .andExpect(jsonPath("$.password").value(Constant.getSHA512SecurePassword("pass")))
                .andReturn();

        MvcResult resultNull = mvc.perform(get("/api/user/"+user2.getUsername())
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andReturn();

        //VERIFY
        Assertions.assertEquals("", resultNull.getResponse().getContentAsString());
    }

    public static String asJsonString(final Object obj) {
        try {
            return new ObjectMapper().writeValueAsString(obj);
        } catch (Exception e) {
            throw new RuntimeException(e);
        }
    }
}
