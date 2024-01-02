package fr.alma.trivial_pursuit_server.data.repository;

import fr.alma.trivial_pursuit_server.core.card.Answer;
import fr.alma.trivial_pursuit_server.core.card.Card;
import fr.alma.trivial_pursuit_server.core.card.Question;
import fr.alma.trivial_pursuit_server.data.configuration.DataTestConfiguration;
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

import java.util.*;


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
        Question q2 = new Question("how old i am", null, Theme.ENTERTAINMENT);
        Question q3 = new Question("who i am", null, Theme.ARTS_LITERATURE);
        Question q4 = new Question("who i am", null, Theme.SCIENCE_NATURE);
        Question q5 = new Question("who i am", null, Theme.SPORTS_LEISURE);
        Question q6 = new Question("who i am", null, Theme.HISTORY);
        a = new Answer("hugo", Theme.GEOGRAPHY);
        Answer a2 = new Answer("hugo", Theme.ENTERTAINMENT);
        Answer a3 = new Answer("hugo", Theme.ARTS_LITERATURE);
        Answer a4 = new Answer("hugo", Theme.SCIENCE_NATURE);
        Answer a5 = new Answer("hugo", Theme.SPORTS_LEISURE);
        Answer a6 = new Answer("hugo", Theme.HISTORY);

        q.setAnswer(a);
        q2.setAnswer(a2);
        q3.setAnswer(a3);
        q4.setAnswer(a4);
        q5.setAnswer(a5);
        q6.setAnswer(a6);

        card.setQuestions(Arrays.asList(q,q2,q3,q4,q5,q6));
        card.setAnswers(Arrays.asList(a,a2,a3,a4,a5,a6));

//        JSON TEST
//        ObjectWriter ow = new ObjectMapper().writer().withDefaultPrettyPrinter();
//        String actual = ow.writeValueAsString(Collections.singletonList(card));
//        System.out.println(actual);

//        ObjectMapper objectMapper = new ObjectMapper();
//        List<Card> jacksonList = objectMapper.readValue(new File("src/main/java/fr/alma/trivial_pursuit_server/data/util/cards.json"), new TypeReference<List<Card>>(){});
//        String after = ow.writeValueAsString(jacksonList);
//        System.out.println(after);
    }

    @Test
    @DisplayName("test add")
    void testInsertCard() {
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