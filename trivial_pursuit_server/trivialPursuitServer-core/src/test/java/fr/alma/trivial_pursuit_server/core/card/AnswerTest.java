package fr.alma.trivial_pursuit_server.core.card;

import fr.alma.trivial_pursuit_server.util.Theme;
import org.junit.jupiter.api.Assertions;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

class AnswerTest {

    private Answer answer;

    @BeforeEach
    void setUp(){
        answer = new Answer();
    }

    @Test
    @DisplayName("test setter on class")
    void testSetter(){
        //CONFIG
        answer.setAnswerText("this is the response");
        answer.setTheme(Theme.GEOGRAPHY);

        //ACTION
        //VERIFY
        Assertions.assertEquals("this is the response", answer.getAnswerText());
        Assertions.assertEquals(Theme.GEOGRAPHY, answer.getTheme());
    }

    @Test
    @DisplayName("test parametrized constructor")
    void testParametrizedConstructor(){
        //CONFIG
        answer = new Answer("this is the response", Theme.GEOGRAPHY);

        //ACTION
        //VERIFY
        Assertions.assertEquals("this is the response", answer.getAnswerText());
        Assertions.assertEquals(Theme.GEOGRAPHY, answer.getTheme());
    }
}
