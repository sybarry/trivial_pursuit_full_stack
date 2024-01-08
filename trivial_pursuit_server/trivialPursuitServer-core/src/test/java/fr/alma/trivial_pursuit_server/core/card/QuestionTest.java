package fr.alma.trivial_pursuit_server.core.card;

import fr.alma.trivial_pursuit_server.util.Theme;
import org.junit.jupiter.api.Assertions;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

class QuestionTest {

    private Question question;
    private Answer answer;

    @BeforeEach
    void setUp(){
        question = new Question();
        answer = new Answer("this is the response", Theme.GEOGRAPHY);
    }

    @Test
    @DisplayName("test setter on class")
    void testSetter(){
        //CONFIG
        Card card = new Card();
        question.setQuestionText("this is the question");
        question.setTheme(Theme.GEOGRAPHY);
        question.setQuestionCard(card);
        question.setAnswer(answer);
        question.setId(1L);

        //ACTION
        //VERIFY
        Assertions.assertEquals("this is the question", question.getQuestionText());
        Assertions.assertEquals(Theme.GEOGRAPHY, question.getTheme());
        Assertions.assertEquals(card, question.getQuestionCard());
        Assertions.assertEquals(answer, question.getAnswer());
        Assertions.assertEquals(1L, question.getId());
    }

    @Test
    @DisplayName("test parametrized constructor")
    void testParametrizedConstructor(){
        //CONFIG
        question = new Question("this is the question", answer, Theme.GEOGRAPHY);

        //ACTION
        //VERIFY
        Assertions.assertEquals("this is the question", question.getQuestionText());
        Assertions.assertEquals(Theme.GEOGRAPHY, question.getTheme());
        Assertions.assertEquals("this is the response", question.getAnswer().getAnswerText());
        Assertions.assertEquals(Theme.GEOGRAPHY, question.getAnswer().getTheme());
    }

    @Test
    @DisplayName("analyse answer")
    void testAnalyseAnswer(){
        //CONFIG
        question.setAnswer(answer);

        //ACTION
        boolean resultTrue = question.analyseAnswer("this is the response");
        boolean resultFalse = question.analyseAnswer("false response");

        //VERIFY
        Assertions.assertTrue(resultTrue);
        Assertions.assertFalse(resultFalse);
    }
}
