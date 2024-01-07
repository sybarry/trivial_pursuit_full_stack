package fr.alma.trivial_pursuit_server.data.service;

import fr.alma.trivial_pursuit_server.core.card.Answer;
import fr.alma.trivial_pursuit_server.core.card.Card;
import fr.alma.trivial_pursuit_server.core.card.Question;
import fr.alma.trivial_pursuit_server.data.repository.CardRepository;
import fr.alma.trivial_pursuit_server.data.service.impl.CardServiceImpl;
import fr.alma.trivial_pursuit_server.exception.CardException;
import fr.alma.trivial_pursuit_server.util.Theme;

import org.junit.jupiter.api.Assertions;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.util.Arrays;
import java.util.Collections;
import java.util.List;

import static org.mockito.Mockito.*;


class CardServiceImplTest {
    private CardRepository cardRepository;
    private CardServiceImpl cardService;

    private Card card;


    @BeforeEach
    void setUp() throws CardException {
        this.cardRepository = mock(CardRepository.class);
        this.cardService = new CardServiceImpl(cardRepository);

        card = new Card();
        Question q = new Question("who i am", null, Theme.GEOGRAPHY);
        Question q2 = new Question("how old i am", null, Theme.ENTERTAINMENT);
        Question q3 = new Question("who i am", null, Theme.ARTS_LITERATURE);
        Question q4 = new Question("who i am", null, Theme.SCIENCE_NATURE);
        Question q5 = new Question("who i am", null, Theme.SPORTS_LEISURE);
        Question q6 = new Question("who i am", null, Theme.HISTORY);
        Answer a = new Answer("hugo", Theme.GEOGRAPHY);
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
    }
    @Test
    @DisplayName("test add and check")
    void testAddAndCheck() {
        //CONFIG
        Card card2 = new Card();
        card2.setId(2L);

        when(cardRepository.save(card)).thenReturn(card);
        when(cardRepository.existsById(card.getId())).thenReturn(false);
        when(cardRepository.existsById(card2.getId())).thenReturn(true);

        //ACTION
        Boolean resultNotExist = cardService.isInRepository(card);
        Card resultSave = cardService.saveCard(card);
        Boolean resultExist = cardService.isInRepository(card2);

        //VERIFY
        verify(cardRepository, atLeastOnce()).save(card);
        Assertions.assertEquals(card, resultSave);
        Assertions.assertTrue(resultExist);
        Assertions.assertFalse(resultNotExist);
    }

    @Test
    @DisplayName("test add but already added and check")
    void testAddAlreadyAddedAndCheck() {
        //CONFIG
        Card card2 = new Card();
        card2.setId(2L);

        when(cardRepository.save(card)).thenReturn(null);
        when(cardRepository.existsById(card.getId())).thenReturn(true);
        when(cardRepository.existsById(card2.getId())).thenReturn(false);

        //ACTION
        Boolean resultExistAlready = cardService.isInRepository(card);
        Card resultSave = cardService.saveCard(card);
        Boolean resultNotExist = cardService.isInRepository(card2);

        //VERIFY
        verify(cardRepository, never()).save(card);
        Assertions.assertNull(resultSave);
        Assertions.assertTrue(resultExistAlready);
        Assertions.assertFalse(resultNotExist);
    }

    @Test
    @DisplayName("test find all and find by id")
    void testFindAll(){
        //CONFIG
        card.setId(1L);
        when(cardRepository.findAll()).thenReturn(Collections.singletonList(card));
        when(cardRepository.findByIdNotOptional(card.getId())).thenReturn(card);

        //ACTION
        List<Card> result = cardService.findAll();
        Card cardFound = cardService.findById(card.getId()+"");

        //VERIFY
        verify(cardRepository, atLeastOnce()).findAll();
        verify(cardRepository, atLeastOnce()).findByIdNotOptional(card.getId());
        Assertions.assertEquals(Collections.singletonList(card), result);
        Assertions.assertEquals(card, cardFound);

    }
}
