package fr.alma.trivial_pursuit_server.core.card;

import fr.alma.trivial_pursuit_server.exception.CardException;
import fr.alma.trivial_pursuit_server.util.Theme;
import org.junit.jupiter.api.Assertions;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

class CardTest {
    //TODO
    //setAnswers test;
    //getQuestionText test;
    //addQuestion test


    private Card card;

    private List<Question> questionList;

    private List<Answer> answerList;

    @BeforeEach
    void setUp(){
        card = new Card();

        Question q = new Question("who i am", null, Theme.GEOGRAPHY);
        Question q2 = new Question("how old i am", null, Theme.ENTERTAINMENT);
        Question q3 = new Question("who has this idea", null, Theme.ARTS_LITERATURE);
        Question q4 = new Question("is it fun", null, Theme.SCIENCE_NATURE);
        Question q5 = new Question("will you appreciate it", null, Theme.SPORTS_LEISURE);
        Question q6 = new Question("anyway bye", null, Theme.HISTORY);
        Answer a = new Answer("hugo", Theme.GEOGRAPHY);
        Answer a2 = new Answer("secret", Theme.ENTERTAINMENT);
        Answer a3 = new Answer("not me", Theme.ARTS_LITERATURE);
        Answer a4 = new Answer("yeah so much", Theme.SCIENCE_NATURE);
        Answer a5 = new Answer("i don't know", Theme.SPORTS_LEISURE);
        Answer a6 = new Answer("bye", Theme.HISTORY);

        q.setAnswer(a);
        q2.setAnswer(a2);
        q3.setAnswer(a3);
        q4.setAnswer(a4);
        q5.setAnswer(a5);
        q6.setAnswer(a6);

        questionList = Arrays.asList(q,q2,q3,q4,q5,q6);
        answerList = Arrays.asList(a,a2,a3,a4,a5,a6);

        Assertions.assertFalse(card.getIsPicked());
    }

    @Test
    @DisplayName("Test parametrized constructor")
    void testParametrizedConstructor() {
        //CONFIG
        //ACTION
        Assertions.assertDoesNotThrow(() -> card = new Card(questionList, answerList));

        //VERIFY
        Assertions.assertEquals(questionList, card.getQuestions());
        Assertions.assertEquals(answerList, card.getAnswers());
        Assertions.assertNull(card.getId());
        Assertions.assertFalse(card.getIsPicked());
    }

    @Test
    @DisplayName("Test question setter method with a correct list")
    void testQuestionSetterCorrect() {
        //CONFIG
        //ACTION
        Assertions.assertDoesNotThrow(() -> card.setQuestions(questionList));

        //VERIFY
        Assertions.assertEquals(questionList, card.getQuestions());
        for(Question q : questionList){
            Assertions.assertEquals(card, q.getQuestionCard());
        }
    }

    @Test
    @DisplayName("Test question setter method with null value")
    void testQuestionSetterNull() {
        //CONFIG
        //ACTION
        //VERIFY
        Assertions.assertThrows(CardException.class, () -> card.setQuestions(null));
        Assertions.assertTrue(card.getQuestions().isEmpty());
    }

    @Test
    @DisplayName("Test question setter method with incorrect sized list")
    void testQuestionSetterSizeListIncorrect() {
        //CONFIG
        questionList = new ArrayList<>();

        //ACTION
        //VERIFY
        Assertions.assertThrows(CardException.class, () -> card.setQuestions(questionList));
        Assertions.assertNotEquals(6, questionList.size());
        Assertions.assertTrue(card.getQuestions().isEmpty());
    }
}
