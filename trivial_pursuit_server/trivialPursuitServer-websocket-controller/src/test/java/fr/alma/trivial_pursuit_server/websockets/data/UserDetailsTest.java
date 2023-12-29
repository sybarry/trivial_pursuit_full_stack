package fr.alma.trivial_pursuit_server.websockets.data;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.ObjectWriter;
import org.json.JSONException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.skyscreamer.jsonassert.*;

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