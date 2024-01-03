package fr.alma.trivial_pursuit_server.core.game;

import fr.alma.trivial_pursuit_server.core.card.Answer;
import fr.alma.trivial_pursuit_server.core.card.Card;
import fr.alma.trivial_pursuit_server.core.card.Question;
import fr.alma.trivial_pursuit_server.core.cases.Case;
import fr.alma.trivial_pursuit_server.core.cases.HeadQuarter;
import fr.alma.trivial_pursuit_server.core.cases.SimpleCase;
import fr.alma.trivial_pursuit_server.core.player.Player;
import fr.alma.trivial_pursuit_server.exception.BoardException;
import fr.alma.trivial_pursuit_server.exception.CardException;
import fr.alma.trivial_pursuit_server.util.Color;
import fr.alma.trivial_pursuit_server.util.Theme;
import org.junit.jupiter.api.Assertions;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.Collections;
import java.util.List;

class BoardTest {

    private Board board;
    private List<Card> cardList;
    private List<Case> caseList;
    private Case initialCase;
    private List<Player> playerList;
    private Card card;

    @BeforeEach
    void setUp() throws CardException {
        board = new Board();

        //PlayerList setup
        Party party = new Party();
        playerList = new ArrayList<>(Arrays.asList(
                new Player(Color.GREEN, party),
                new Player(Color.YELLOW, party),
                new Player(Color.BLUE, party),
                new Player(Color.PINK, party),
                new Player(Color.ORANGE, party),
                new Player(Color.PURPLE, party)
        ));

        //CardList setup
        card = new Card(
                Arrays.asList(
                    new Question("who i am", null, Theme.GEOGRAPHY),
                    new Question("how old i am", null, Theme.ENTERTAINMENT),
                    new Question("who has this idea", null, Theme.ARTS_LITERATURE),
                    new Question("is it fun", null, Theme.SCIENCE_NATURE),
                    new Question("will you appreciate it", null, Theme.SPORTS_LEISURE),
                    new Question("anyway bye", null, Theme.HISTORY)
                ),Arrays.asList(
                    new Answer("hugo", Theme.GEOGRAPHY),
                    new Answer("secret", Theme.ENTERTAINMENT),
                    new Answer("not me", Theme.ARTS_LITERATURE),
                    new Answer("yeah so much", Theme.SCIENCE_NATURE),
                    new Answer("i don't know", Theme.SPORTS_LEISURE),
                    new Answer("bye bye", Theme.HISTORY)
                )
        );
        cardList = new ArrayList<>();
        for(int i = 0; i<400;i++){
            cardList.add(card);
        }

        //initialCase setup
        initialCase = new Case("initialCase", null,  Arrays.asList("case1", "case6", "case11", "case16", "case21", "case26"));

        //CaseList setup
        caseList = BoardFactory.buildCases();
    }

    @Test
    @DisplayName("test default constructor")
    void testDefaultConstructor(){
        //CONFIG
        board = new Board();

        //ACTION
        //VERIFY
        Assertions.assertEquals(0, board.getActualCardNotPicked());
        Assertions.assertNull(board.getCards());
        Assertions.assertNull(board.getCases());
        Assertions.assertNull(board.getPlayerList());
        Assertions.assertNull(board.getInitialCase());
    }

    @Test
    @DisplayName("test parametrized constructor work correctly without exception for 6 and 2 players in list")
    void testParametrizedConstructor() {
        //CONFIG
        Party party = new Party();
        List<Player> playerListOf2Elm = Arrays.asList(
                new Player(Color.GREEN, party),
                new Player(Color.YELLOW, party)
        );

        //ACTION
        Assertions.assertDoesNotThrow(() ->  board = new Board(cardList, caseList, initialCase, playerListOf2Elm));
        Assertions.assertDoesNotThrow(() ->  board = new Board(cardList, caseList, initialCase, playerList));

        //VERIFY
        Assertions.assertEquals(0, board.getActualCardNotPicked());
        Assertions.assertEquals(cardList, board.getCards());
        Assertions.assertEquals(caseList, board.getCases());
        Assertions.assertEquals(playerList, board.getPlayerList());
        Assertions.assertEquals(initialCase, board.getInitialCase());
        for(Player p : playerList){
            Assertions.assertEquals(initialCase, p.getActualCase());
        }
    }

    @Test
    @DisplayName("test parametrized constructor for each case of if exception")
    void testParametrizedConstructorIfException() {
        //CONFIG
        List<Case> caseListWithInitialCaseIn = caseList;
        List<Card> cardListOfLessThan400Elm = cardList;
        List<Case> caseListOfLessThan72Elm = caseList;
        List<Player> playerListOfLessThan2Elm = Collections.singletonList(new Player());
        List<Player> playerListOfMoreThan6Elm = new ArrayList<>(playerList);
        Case initialCaseInstanceOfSimpleCase = new SimpleCase("initialSimpleCase", Color.PINK, Arrays.asList("case1", "case2"), Theme.GEOGRAPHY);
        Case initialCaseInstanceOfHeadquarter = new HeadQuarter("initialHeadquarter", Color.PINK, Arrays.asList("case1", "case2"), Theme.GEOGRAPHY);

        //ACTION
        caseListWithInitialCaseIn.remove(0);
        caseListWithInitialCaseIn.add(initialCase);

        cardListOfLessThan400Elm.remove(0);

        caseListOfLessThan72Elm.remove(0);

        playerListOfMoreThan6Elm.add(new Player());

        //VERIFY
        Assertions.assertThrows(BoardException.class, () ->  board = new Board(cardList, caseListWithInitialCaseIn, initialCase, playerList));
        Assertions.assertThrows(BoardException.class, () ->  board = new Board(cardListOfLessThan400Elm, caseList, initialCase, playerList));
        Assertions.assertThrows(BoardException.class, () ->  board = new Board(cardList, caseListOfLessThan72Elm, initialCase, playerList));
        Assertions.assertThrows(BoardException.class, () ->  board = new Board(cardList, caseList, initialCase, playerListOfLessThan2Elm));
        Assertions.assertThrows(BoardException.class, () ->  board = new Board(cardList, caseList, initialCase, playerListOfMoreThan6Elm));
        Assertions.assertThrows(BoardException.class, () ->  board = new Board(cardList, caseList, initialCaseInstanceOfHeadquarter, playerList));
        Assertions.assertThrows(BoardException.class, () ->  board = new Board(cardList, caseList, initialCaseInstanceOfSimpleCase, playerList));

    }

    @Test
    @DisplayName("test parametrized constructor with exception occurring in verifyCase")
    void testVerifyCases(){
        //CONFIG
        List<Case> caseListWith5HeadquarterAnd67SimpleCase = caseList;

        //ACTION
        caseListWith5HeadquarterAnd67SimpleCase.remove(0);
        caseListWith5HeadquarterAnd67SimpleCase.add(new SimpleCase("initialSimpleCase", Color.PINK, Arrays.asList("case1", "case2"), Theme.GEOGRAPHY));

        //VERIFY
        Assertions.assertThrows(BoardException.class, () ->  board = new Board(cardList, caseListWith5HeadquarterAnd67SimpleCase, initialCase, playerList));
    }

    @Test
    @DisplayName("test parametrized constructor with exception occurring in verifyCard")
    void testVerifyCards() throws CardException {
        //CONFIG
        List<Card> cardListWithOneCardAlreadyPicked = cardList;
        List<Card> cardListWithOneCardWithOnly1Question = cardList;
        List<Card> cardListWithOneCardWithOnly1Answer = cardList;
        List<Card> cardListWithOneCardWhereAnAnswerIsNotInQuestionList = cardList;

        //Represent the card with one question
        Card cardWithOneQuestionAnd6Answers = new Card();
        cardWithOneQuestionAnd6Answers.addQuestion(new Question("question", new Answer("answer", Theme.ARTS_LITERATURE), Theme.ARTS_LITERATURE));
        cardWithOneQuestionAnd6Answers.setAnswers(Arrays.asList(
                new Answer("hugo", Theme.GEOGRAPHY),
                new Answer("secret", Theme.ENTERTAINMENT),
                new Answer("not me", Theme.ARTS_LITERATURE),
                new Answer("yeah so much", Theme.SCIENCE_NATURE),
                new Answer("i don't know", Theme.SPORTS_LEISURE),
                new Answer("bye bye", Theme.HISTORY)
        ));

        //Represent the card with one answer
        Card cardWithOneAnswerAnd6Questions= new Card();
        cardWithOneAnswerAnd6Questions.addQuestion(new Question("question", new Answer("answer", Theme.ARTS_LITERATURE), Theme.ARTS_LITERATURE));
        cardWithOneAnswerAnd6Questions.setQuestions(Arrays.asList(
                new Question("who i am", null, Theme.GEOGRAPHY),
                new Question("how old i am", null, Theme.ENTERTAINMENT),
                new Question("who has this idea", null, Theme.ARTS_LITERATURE),
                new Question("is it fun", null, Theme.SCIENCE_NATURE),
                new Question("will you appreciate it", null, Theme.SPORTS_LEISURE),
                new Question("anyway bye", null, Theme.HISTORY)
        ));

        //Represent the card with incorrect link between a question and an answer
        card.setQuestions(Arrays.asList(
                new Question("who i am", new Answer("hugo", Theme.GEOGRAPHY), Theme.GEOGRAPHY),
                new Question("how old i am", new Answer("secret", Theme.ENTERTAINMENT), Theme.ENTERTAINMENT),
                new Question("who has this idea", new Answer("not me", Theme.ARTS_LITERATURE), Theme.ARTS_LITERATURE),
                new Question("is it fun", new Answer("wrong answer", Theme.SCIENCE_NATURE), Theme.SCIENCE_NATURE),
                new Question("will you appreciate it", new Answer("i don't know", Theme.SPORTS_LEISURE), Theme.SPORTS_LEISURE),
                new Question("anyway bye", new Answer("bye bye", Theme.HISTORY), Theme.HISTORY)
        ));

        //ACTION
        cardListWithOneCardAlreadyPicked.get(0).setIsPicked(true);

        cardListWithOneCardWithOnly1Question.remove(0);
        cardListWithOneCardWithOnly1Question.add(cardWithOneQuestionAnd6Answers);

        cardListWithOneCardWithOnly1Answer.remove(0);
        cardListWithOneCardWithOnly1Answer.add(cardWithOneAnswerAnd6Questions);

        cardListWithOneCardWhereAnAnswerIsNotInQuestionList.remove(0);
        cardListWithOneCardWhereAnAnswerIsNotInQuestionList.add(card);


        //VERIFY
        Assertions.assertThrows(BoardException.class, () ->  board = new Board(cardListWithOneCardAlreadyPicked, caseList, initialCase, playerList));
        Assertions.assertThrows(BoardException.class, () ->  board = new Board(cardListWithOneCardWithOnly1Question, caseList, initialCase, playerList));
        Assertions.assertThrows(BoardException.class, () ->  board = new Board(cardListWithOneCardWithOnly1Answer, caseList, initialCase, playerList));
        Assertions.assertThrows(BoardException.class, () ->  board = new Board(cardListWithOneCardWhereAnAnswerIsNotInQuestionList, caseList, initialCase, playerList));
    }

    @Test
    @DisplayName("test parametrized constructor with exception occurring in verifyPlayer")
    void testVerifyPlayer(){
        //CONFIG
        List<Player> playerListWithOnePLayerWhoDontHaveTheSameParty = playerList;
        List<Player> playerListWithOnePLayerWhoDontZeroNbTriangle = playerList;
        List<Player> playerListWithOnePLayerWhoHaveAColorPawnThatItsAlreadyPicked = playerList;
        List<Player> playerListWithOnePLayerWhoHaveAnActualCaseNull = playerList;

        Color playerRemoveColor = playerList.get(0).getPawn();
        Party partyOfAPlayer = playerList.get(0).getParty();

        Player newPlayerWithNbTriangleNotZeroAndIncorrectColor = new Player(playerList.get(1).getPawn(), partyOfAPlayer);
        newPlayerWithNbTriangleNotZeroAndIncorrectColor.setNbTriangle(2);

        Player newPlayerWithNUllActualCase = new Player(playerRemoveColor, partyOfAPlayer);
        newPlayerWithNUllActualCase.setActualCase(null);

        //ACTION
        playerListWithOnePLayerWhoDontHaveTheSameParty.remove(0);
        playerListWithOnePLayerWhoDontHaveTheSameParty.add(new Player(playerRemoveColor, new Party()));

        playerListWithOnePLayerWhoDontZeroNbTriangle.remove(0);
        playerListWithOnePLayerWhoDontZeroNbTriangle.add(newPlayerWithNbTriangleNotZeroAndIncorrectColor);

        playerListWithOnePLayerWhoHaveAColorPawnThatItsAlreadyPicked.remove(0);
        newPlayerWithNbTriangleNotZeroAndIncorrectColor.setNbTriangle(0);
        playerListWithOnePLayerWhoHaveAColorPawnThatItsAlreadyPicked.add(newPlayerWithNbTriangleNotZeroAndIncorrectColor);

        playerListWithOnePLayerWhoHaveAnActualCaseNull.remove(0);
        playerListWithOnePLayerWhoHaveAnActualCaseNull.add(newPlayerWithNUllActualCase);

        //VERIFY
        Assertions.assertThrows(BoardException.class, () ->  board = new Board(cardList, caseList, initialCase, playerListWithOnePLayerWhoDontHaveTheSameParty));
        Assertions.assertThrows(BoardException.class, () ->  board = new Board(cardList, caseList, initialCase, playerListWithOnePLayerWhoDontZeroNbTriangle));
        Assertions.assertThrows(BoardException.class, () ->  board = new Board(cardList, caseList, initialCase, playerListWithOnePLayerWhoHaveAColorPawnThatItsAlreadyPicked));
        Assertions.assertThrows(BoardException.class, () ->  board = new Board(cardList, caseList, initialCase, playerListWithOnePLayerWhoHaveAnActualCaseNull));
    }

    @Test
    @DisplayName("test getACard method first pick")
    void testGetCardMethodFirstPick() throws BoardException {
        //CONFIG
        board = new Board(cardList, caseList, initialCase, playerList);

        //ACTION
        Card cardPicked = board.getACard();

        //VERIFY
        Assertions.assertEquals(1, board.getActualCardNotPicked());
        Assertions.assertTrue(cardPicked.getIsPicked());
        Assertions.assertEquals(cardPicked, board.getCards().get(0));
        Assertions.assertTrue(board.getCards().get(0).getIsPicked());
    }

    @Test
    @DisplayName("test getACard method 401 pick")
    void testGetCardMethod401Pick() throws BoardException {
        //CONFIG
        board = new Board(cardList, caseList, initialCase, playerList);

        Card cardPicked;
        for(Card ignored : board.getCards()){
            board.getACard();
        }

        //ACTION
        cardPicked = board.getACard();

        //VERIFY
        Assertions.assertEquals(1, board.getActualCardNotPicked());
        Assertions.assertTrue(cardPicked.getIsPicked());
        Assertions.assertEquals(cardPicked, board.getCards().get(0));
        Assertions.assertTrue(board.getCards().get(0).getIsPicked());
    }

    @Test
    @DisplayName("test remove a player")
    void testRemovePlayer() throws BoardException {
        //CONFIG
        board = new Board(cardList, caseList, initialCase, playerList);
        Player playerToBeRemove = playerList.get(0);

        //ACTION
        board.removePlayer(playerToBeRemove);

        //VERIFY
        Assertions.assertEquals(5, board.getPlayerList().size());
        Assertions.assertFalse(board.getPlayerList().contains(playerToBeRemove));
    }
}
