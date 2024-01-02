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

    private Card card;

    private List<Question> questionList;

    private List<Answer> answerList;

    @BeforeEach
    void setUp(){
        card = new Card();
        card.setId(1L);

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
    }
    @Test
    @DisplayName("test default constructor")
    void testDefaultConstructor(){
        //CONFIG
        card = new Card();

        //ACTION
        //VERIFY
        Assertions.assertFalse(card.getIsPicked());
        Assertions.assertNull(card.getId());
        Assertions.assertTrue(card.getQuestions().isEmpty());
        Assertions.assertTrue(card.getAnswers().isEmpty());
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

    @Test
    @DisplayName("Test answer setter method with a correct list")
    void testAnswerSetterCorrect() {
        //CONFIG
        int i=0;

        //ACTION
        Assertions.assertDoesNotThrow(() -> card.setQuestions(questionList));
        Assertions.assertDoesNotThrow(() -> card.setAnswers(answerList));

        //VERIFY
        Assertions.assertEquals(answerList, card.getAnswers());
        for(Answer a : answerList){
            Assertions.assertEquals(card.getQuestions().get(i++).getAnswer(), a);
        }
    }

    @Test
    @DisplayName("Test answer setter method with null value")
    void testAnswerSetterNull() {
        //CONFIG
        //ACTION
        //VERIFY
        Assertions.assertThrows(CardException.class, () -> card.setAnswers(null));
        Assertions.assertTrue(card.getAnswers().isEmpty());
    }

    @Test
    @DisplayName("Test answer setter method with incorrect sized list")
    void testAnswerSetterSizeListIncorrect() {
        //CONFIG
        answerList = new ArrayList<>();

        //ACTION
        //VERIFY
        Assertions.assertThrows(CardException.class, () -> card.setAnswers(answerList));
        Assertions.assertNotEquals(6, answerList.size());
        Assertions.assertTrue(card.getAnswers().isEmpty());
    }

    @Test
    @DisplayName("Test get question text for a theme correct")
    void testGetQuestionTextCorrectTheme() throws CardException {
        //CONFIG
        //ACTION
        Assertions.assertDoesNotThrow(() -> card.setQuestions(questionList));
        String result = card.getQuestionText(Theme.GEOGRAPHY);

        //VERIFY
        Assertions.assertEquals(questionList.get(0).getQuestionText(), result);
    }

    @Test
    @DisplayName("Test get question text for a theme incorrect (null)")
    void testGetQuestionTextIncorrectThemeNull() {
        //CONFIG
        //ACTION
        Assertions.assertDoesNotThrow(() -> card.setQuestions(questionList));

        //VERIFY
        Assertions.assertThrows(CardException.class, () -> card.getQuestionText(null));
    }

    @Test
    @DisplayName("Test get question text for a theme incorrect because not in the list")
    void testGetQuestionTextIncorrectThemeNotInList() {
        //CONFIG
        questionList = Arrays.asList(
                new Question("who i am", null, Theme.GEOGRAPHY),
                new Question("how old i am", null, Theme.ENTERTAINMENT),
                new Question("who has this idea", null, Theme.ARTS_LITERATURE),
                new Question("is it fun", null, Theme.SCIENCE_NATURE),
                new Question("will you appreciate it", null, Theme.SPORTS_LEISURE),
                new Question("anyway bye", null, Theme.GEOGRAPHY));

        //ACTION
        Assertions.assertDoesNotThrow(() -> card.setQuestions(questionList));

        //VERIFY
        Assertions.assertThrows(CardException.class, () -> card.getQuestionText(Theme.HISTORY));
    }

    @Test
    @DisplayName("Test add correct question, still have space left")
    void testAddQuestionCorrect() {
        //CONFIG
        Answer newAnswer = new Answer("me", Theme.GEOGRAPHY);
        Question newQuestion = new Question("who i am", newAnswer, Theme.GEOGRAPHY);

        //ACTION
        Assertions.assertDoesNotThrow(() -> card.addQuestion(newQuestion));

        //VERIFY
        Assertions.assertTrue(card.getQuestions().contains(newQuestion));
        Assertions.assertTrue(card.getAnswers().contains(newAnswer));
        Assertions.assertEquals(card, newQuestion.getQuestionCard());
        Assertions.assertEquals(1, card.getQuestions().size());
    }

    @Test
    @DisplayName("Test add null question, still have space left")
    void testAddQuestionNull() {
        //CONFIG
        //ACTION
        Assertions.assertThrows(CardException.class, () -> card.addQuestion(null));

        //VERIFY
        Assertions.assertEquals(0, card.getQuestions().size());
    }

    @Test
    @DisplayName("Test add question without answer, still have space left")
    void testAddQuestionWithoutAnswer() {
        //CONFIG
        Question newQuestion = new Question("who i am", null, Theme.GEOGRAPHY);

        //ACTION
        Assertions.assertThrows(CardException.class, () -> card.addQuestion(newQuestion));

        //VERIFY
        Assertions.assertFalse(card.getQuestions().contains(newQuestion));
        Assertions.assertEquals(0, card.getQuestions().size());
    }

    @Test
    @DisplayName("Test add question but no space left")
    void testAddQuestionNoSpaceLeft() {
        //CONFIG
        Assertions.assertDoesNotThrow(() -> card.setQuestions(questionList));
        Answer newAnswer = new Answer("me", Theme.GEOGRAPHY);
        Question newQuestion = new Question("who i am", newAnswer, Theme.GEOGRAPHY);

        //ACTION
        Assertions.assertThrows(CardException.class, () -> card.addQuestion(newQuestion));

        //VERIFY
        Assertions.assertFalse(card.getQuestions().contains(newQuestion));
        Assertions.assertEquals(6, card.getQuestions().size());
    }

    @Test
    @DisplayName("Test add question duplicate")
    void testAddQuestionDuplicate() {
        //CONFIG
        Answer newAnswer = new Answer("me", Theme.GEOGRAPHY);
        Question newQuestion = new Question("who i am", newAnswer, Theme.GEOGRAPHY);

        //ACTION
        Assertions.assertDoesNotThrow(() -> card.addQuestion(newQuestion));
        Assertions.assertThrows(CardException.class, () -> card.addQuestion(newQuestion));

        //VERIFY
        Assertions.assertTrue(card.getQuestions().contains(newQuestion));
        Assertions.assertTrue(card.getAnswers().contains(newAnswer));
        Assertions.assertEquals(card, newQuestion.getQuestionCard());
        Assertions.assertEquals(1, card.getQuestions().size());
    }

    @Test
    @DisplayName("Test add question with a theme duplicate in list")
    void testAddQuestionDuplicatedTheme(){
        //CONFIG
        Answer newAnswer = new Answer("me", Theme.GEOGRAPHY);
        Answer otherAnswer = new Answer("mee", Theme.HISTORY);
        Question newQuestion = new Question("who i am", newAnswer, Theme.GEOGRAPHY);
        Question otherQuestionWithSameTheme = new Question("second question", otherAnswer, Theme.GEOGRAPHY);

        //ACTION
        Assertions.assertDoesNotThrow(() -> card.addQuestion(newQuestion));
        Assertions.assertThrows(CardException.class, () -> card.addQuestion(otherQuestionWithSameTheme));

        //VERIFY
        Assertions.assertTrue(card.getQuestions().contains(newQuestion));
        Assertions.assertTrue(card.getAnswers().contains(newAnswer));
        Assertions.assertFalse(card.getQuestions().contains(otherQuestionWithSameTheme));
        Assertions.assertFalse(card.getAnswers().contains(otherAnswer));
        Assertions.assertEquals(card, newQuestion.getQuestionCard());
        Assertions.assertEquals(1, card.getQuestions().size());
    }

    @Test
    @DisplayName("Test add question with an answer duplicate in list")
    void testAddQuestionDuplicatedAnswer(){
        //CONFIG
        Answer newAnswer = new Answer("me", Theme.GEOGRAPHY);
        Question newQuestion = new Question("who i am", newAnswer, Theme.GEOGRAPHY);
        Question otherQuestionWitExistingAnswer = new Question("who he is", newAnswer, Theme.HISTORY);

        //ACTION
        Assertions.assertDoesNotThrow(() -> card.addQuestion(newQuestion));
        Assertions.assertThrows(CardException.class, () -> card.addQuestion(otherQuestionWitExistingAnswer));

        //VERIFY
        Assertions.assertTrue(card.getQuestions().contains(newQuestion));
        Assertions.assertTrue(card.getAnswers().contains(newAnswer));
        Assertions.assertFalse(card.getQuestions().contains(otherQuestionWitExistingAnswer));
        Assertions.assertEquals(card, newQuestion.getQuestionCard());
        Assertions.assertEquals(1, card.getQuestions().size());
    }
}
