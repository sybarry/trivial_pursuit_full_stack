package fr.alma.TrivialPursuitServer.websockets.data;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.ObjectWriter;
import org.json.JSONArray;
import org.json.JSONException;
import org.junit.jupiter.api.Assertions;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.skyscreamer.jsonassert.*;

import static org.junit.jupiter.api.Assertions.*;

class UserDetailsTest {

    private UserDetails user;
    @BeforeEach
    void setUp() throws JsonProcessingException {
        user = new UserDetails(1L, "Gloire", "bad-password");
    }

    @Test
    void id() throws JsonProcessingException, JSONException {
        ObjectWriter ow = new ObjectMapper().writer().withDefaultPrettyPrinter();
        String actual = ow.writeValueAsString(user);

        JSONAssert.assertEquals("{id:1, name:\"Gloire\", password:\"bad-password\"}",actual, JSONCompareMode.LENIENT);
    }

    @Test
    void name() {
    }

    @Test
    void password() {
    }
}