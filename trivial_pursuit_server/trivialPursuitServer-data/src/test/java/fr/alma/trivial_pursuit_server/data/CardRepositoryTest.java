package fr.alma.trivial_pursuit_server.data;

import fr.alma.trivial_pursuit_server.core.card.Answer;
import fr.alma.trivial_pursuit_server.core.card.Card;
import fr.alma.trivial_pursuit_server.core.card.Question;
import fr.alma.trivial_pursuit_server.data.configuration.DataTestConfiguration;
import jakarta.annotation.Resource;
import jakarta.transaction.Transactional;
import org.junit.jupiter.api.Assertions;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.springframework.test.context.ContextConfiguration;
import org.springframework.test.context.junit.jupiter.SpringExtension;
import org.springframework.test.context.support.AnnotationConfigContextLoader;

import java.util.ArrayList;
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

    @Test
    @DisplayName("test add")
    void testInsertCard(){
        //CONFIG
        Card card = new Card();
        Question q = new Question("who i am", null);
        Answer a = new Answer("hugo", q);
        q.setAnswer(a);

        List<Question> qq = new ArrayList<>();
        qq.add(q);
        List<Answer> aa = new ArrayList<>();
        aa.add(a);

        card.setAnswers(aa);
        card.setQuestions(qq);

        //ACTION
        cardRepository.save(card);

        //VERIFY
        Assertions.assertTrue(cardRepository.findAll().contains(card));
        Assertions.assertEquals(q, cardRepository.findAll().get(0).getQuestions().get(0));
        Assertions.assertEquals(a, cardRepository.findAll().get(0).getAnswers().get(0));
        Assertions.assertEquals(1,cardRepository.count());

        Optional<Card> user = cardRepository.findAll()
                .stream()
                .filter(us-> us.getQuestions().get(0).equals(q) && us.getAnswers().get(0).equals(a))
                .findFirst();

        Assertions.assertTrue(user.isPresent());
    }

}