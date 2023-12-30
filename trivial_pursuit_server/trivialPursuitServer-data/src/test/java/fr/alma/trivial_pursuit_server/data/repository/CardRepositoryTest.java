package fr.alma.trivial_pursuit_server.data.repository;

import fr.alma.trivial_pursuit_server.core.card.Answer;
import fr.alma.trivial_pursuit_server.core.card.Card;
import fr.alma.trivial_pursuit_server.core.card.Question;
import fr.alma.trivial_pursuit_server.data.configuration.DataTestConfiguration;
import fr.alma.trivial_pursuit_server.data.repository.CardRepository;
import fr.alma.trivial_pursuit_server.exception.CardException;
import fr.alma.trivial_pursuit_server.util.Theme;
import jakarta.annotation.Resource;
import jakarta.transaction.Transactional;
import org.junit.jupiter.api.Assertions;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.springframework.test.context.ContextConfiguration;
import org.springframework.test.context.junit.jupiter.SpringExtension;
import org.springframework.test.context.support.AnnotationConfigContextLoader;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.Optional;


@ExtendWith(SpringExtension.class)
@ContextConfiguration(
        classes = {DataTestConfiguration.class},
        loader = AnnotationConfigContextLoader.class)
@Transactional
class CardRepositoryTest {

    @Resource
    private CardRepository cardRepository;

    private Card card;
    private Question q;
    private Answer a;

    @BeforeEach
    void setUp() throws CardException {
        card = new Card();
        q = new Question("who i am", null, Theme.GEOGRAPHY);
        Question qq = new Question("how old i am", null, Theme.GEOGRAPHY);
        Question qqq = new Question("who i am", null, Theme.GEOGRAPHY);
        Question qqqq = new Question("who i am", null, Theme.GEOGRAPHY);
        Question q5 = new Question("who i am", null, Theme.GEOGRAPHY);
        Question q6 = new Question("who i am", null, Theme.GEOGRAPHY);
        a = new Answer("hugo", q, Theme.GEOGRAPHY);
        Answer a2 = new Answer("hugo", q, Theme.GEOGRAPHY);
        Answer a3 = new Answer("hugo", q, Theme.GEOGRAPHY);
        Answer a4 = new Answer("hugo", q, Theme.GEOGRAPHY);
        Answer a5 = new Answer("hugo", q, Theme.GEOGRAPHY);
        Answer a6 = new Answer("hugo", q, Theme.GEOGRAPHY);

        q.setAnswer(a);
        qq.setAnswer(a2);
        qqq.setAnswer(a3);
        qqqq.setAnswer(a4);
        q5.setAnswer(a5);
        q6.setAnswer(a6);

        card.setQuestions(Arrays.asList(q,qq,qqq,qqqq,q5,q6));
        card.setAnswers(Arrays.asList(a,a2,a3,a4,a5,a6));
//        card.addQuestion(q);
//        card.addQuestion(qq);
//        card.addQuestion(qqq);
//        card.addQuestion(qqqq);
//        card.addQuestion(q5);
//        card.addQuestion(q6);
    }

    @Test
    @DisplayName("test add")
    void testInsertCard() throws CardException {
        //CONFIG

        //ACTION
        cardRepository.save(card);

        //VERIFY
        Assertions.assertTrue(cardRepository.existsById(card.getId()));
        Assertions.assertEquals(q, cardRepository.find(card).getQuestions().get(0));
        Assertions.assertEquals(a, cardRepository.find(card).getAnswers().get(0));
        Assertions.assertEquals(1, cardRepository.findAllCard().size());
        Assertions.assertEquals(1,cardRepository.count());


        Optional<Card> cardd = cardRepository.findAllCard()
                .stream()
                .filter(cd-> cd.getQuestions().get(0).equals(q) && cd.getAnswers().get(0).equals(a))
                .findFirst();

        Assertions.assertTrue(cardd.isPresent());
    }

}