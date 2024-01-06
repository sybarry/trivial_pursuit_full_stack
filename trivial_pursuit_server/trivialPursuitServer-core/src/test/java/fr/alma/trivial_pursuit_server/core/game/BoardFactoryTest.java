package fr.alma.trivial_pursuit_server.core.game;

import fr.alma.trivial_pursuit_server.core.card.Card;
import fr.alma.trivial_pursuit_server.core.cases.Case;
import fr.alma.trivial_pursuit_server.core.cases.HeadQuarter;
import fr.alma.trivial_pursuit_server.core.cases.SimpleCase;
import fr.alma.trivial_pursuit_server.core.player.Player;
import fr.alma.trivial_pursuit_server.exception.BoardException;
import fr.alma.trivial_pursuit_server.util.Color;
import fr.alma.trivial_pursuit_server.util.Constant;
import fr.alma.trivial_pursuit_server.util.Theme;
import org.junit.jupiter.api.Assertions;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Paths;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.stream.Stream;

class BoardFactoryTest {

    private int indice = 0;

    private List<Case> caseList;

    private Board board;

    @BeforeEach
    void setUp() throws IOException, BoardException {
        Party party = new Party();
        List<Player> playerList = new ArrayList<>(Arrays.asList(
                new Player(Color.GREEN, party),
                new Player(Color.YELLOW, party),
                new Player(Color.BLUE, party),
                new Player(Color.PINK, party),
                new Player(Color.ORANGE, party),
                new Player(Color.PURPLE, party)
        ));
        board = BoardFactory.createBoard(playerList);
        caseList = board.getCases();
    }

    @Test
    @DisplayName("test build cases, verify HeadQuarter cases")
    void testBuildCasesHeadquarter(){
        //CONFIG
        HeadQuarter firstHeadQuarter = (HeadQuarter) caseList.get(indice);
        HeadQuarter secondHeadQuarter = (HeadQuarter) caseList.get(indice+1);

        //ACTION
        //VERIFY
        Assertions.assertEquals(Arrays.asList("case5", "case66", "case31"),firstHeadQuarter.getNeighbors());
        Assertions.assertEquals("headquarter1", firstHeadQuarter.getName());
        Assertions.assertEquals(Color.BLUE, firstHeadQuarter.getColor());
        Assertions.assertEquals(Theme.GEOGRAPHY, firstHeadQuarter.getTheme());
        Assertions.assertTrue(caseList.get(indice) instanceof HeadQuarter);

        Assertions.assertEquals(Arrays.asList("case10", "case36", "case37"),secondHeadQuarter.getNeighbors());
        Assertions.assertEquals("headquarter2", secondHeadQuarter.getName());
        Assertions.assertEquals(Color.YELLOW, secondHeadQuarter.getColor());
        Assertions.assertEquals(Theme.HISTORY, secondHeadQuarter.getTheme());
        Assertions.assertTrue(caseList.get(indice) instanceof HeadQuarter);
    }

    @Test
    @DisplayName("test build cases, verify simpleCase cases in transversal branches")
    void testBuildCasesSimpleCaseTransversalBranches(){
        //CONFIG
        indice = 6;
        SimpleCase simpleCaseWithInitialCaseNeighbor = (SimpleCase) caseList.get(indice);
        SimpleCase simpleCaseWithHeadQuarterNeighbor = (SimpleCase) caseList.get(indice+4);
        SimpleCase simpleCaseWithJustSimpleCaseNeighbor = (SimpleCase) caseList.get(indice+1);

        //ACTION
        //VERIFY
        Assertions.assertEquals(Arrays.asList("initialCase", "case2"),simpleCaseWithInitialCaseNeighbor.getNeighbors());
        Assertions.assertEquals("case1", simpleCaseWithInitialCaseNeighbor.getName());
        Assertions.assertEquals(Color.ORANGE, simpleCaseWithInitialCaseNeighbor.getColor());
        Assertions.assertEquals(Theme.SPORTS_LEISURE, simpleCaseWithInitialCaseNeighbor.getTheme());
        Assertions.assertTrue(caseList.get(indice) instanceof SimpleCase);

        Assertions.assertEquals(Arrays.asList("headquarter1", "case4"),simpleCaseWithHeadQuarterNeighbor.getNeighbors());
        Assertions.assertEquals("case5", simpleCaseWithHeadQuarterNeighbor.getName());
        Assertions.assertEquals(Color.GREEN, simpleCaseWithHeadQuarterNeighbor.getColor());
        Assertions.assertEquals(Theme.SCIENCE_NATURE, simpleCaseWithHeadQuarterNeighbor.getTheme());
        Assertions.assertTrue(caseList.get(indice+4) instanceof SimpleCase);

        Assertions.assertEquals(Arrays.asList("case1", "case3"),simpleCaseWithJustSimpleCaseNeighbor.getNeighbors());
        Assertions.assertEquals("case2", simpleCaseWithJustSimpleCaseNeighbor.getName());
        Assertions.assertEquals(Color.BLUE, simpleCaseWithJustSimpleCaseNeighbor.getColor());
        Assertions.assertEquals(Theme.GEOGRAPHY, simpleCaseWithJustSimpleCaseNeighbor.getTheme());
        Assertions.assertTrue(caseList.get(indice+1) instanceof SimpleCase);
    }

    @Test
    @DisplayName("test build cases, verify simpleCase cases in exterior circle")
    void testBuildCasesSimpleCaseExteriorCircle(){
        //CONFIG
        indice = 36;
        SimpleCase simpleCaseWithBottomHeadQuarterCaseNeighbor = (SimpleCase) caseList.get(indice+6);
        SimpleCase simpleCaseWithTopHeadQuarterCaseNeighbor = (SimpleCase) caseList.get(indice+11);
        SimpleCase simpleCaseWithJustSimpleCaseNeighbor = (SimpleCase) caseList.get(indice+1);

        //ACTION
        //VERIFY
        Assertions.assertEquals(Arrays.asList("headquarter2", "case38"),simpleCaseWithBottomHeadQuarterCaseNeighbor.getNeighbors());
        Assertions.assertEquals("case37", simpleCaseWithBottomHeadQuarterCaseNeighbor.getName());
        Assertions.assertEquals(Color.PINK, simpleCaseWithBottomHeadQuarterCaseNeighbor.getColor());
        Assertions.assertEquals(Theme.ARTS_LITERATURE, simpleCaseWithBottomHeadQuarterCaseNeighbor.getTheme());
        Assertions.assertTrue(caseList.get(indice+6) instanceof SimpleCase);

        Assertions.assertEquals(Arrays.asList("headquarter3", "case41"),simpleCaseWithTopHeadQuarterCaseNeighbor.getNeighbors());
        Assertions.assertEquals("case42", simpleCaseWithTopHeadQuarterCaseNeighbor.getName());
        Assertions.assertEquals(Color.PURPLE, simpleCaseWithTopHeadQuarterCaseNeighbor.getColor());
        Assertions.assertEquals(Theme.ENTERTAINMENT, simpleCaseWithTopHeadQuarterCaseNeighbor.getTheme());
        Assertions.assertTrue(caseList.get(indice+11) instanceof SimpleCase);

        Assertions.assertEquals(Arrays.asList("case31", "case33"),simpleCaseWithJustSimpleCaseNeighbor.getNeighbors());
        Assertions.assertEquals("case32", simpleCaseWithJustSimpleCaseNeighbor.getName());
        Assertions.assertEquals(Color.YELLOW, simpleCaseWithJustSimpleCaseNeighbor.getColor());
        Assertions.assertEquals(Theme.HISTORY, simpleCaseWithJustSimpleCaseNeighbor.getTheme());
        Assertions.assertTrue(caseList.get(indice+1) instanceof SimpleCase);
    }

    @Test
    @DisplayName("test deserialization of json card file")
    void testGetCardsFromJson() {
        //CONFIG
        int noOfLines;

        try (Stream<String> fileStream = Files.lines(Paths.get("src/main/java/fr/alma/trivial_pursuit_server/util/cards.json"))) {
            //Lines count
            noOfLines = (int) fileStream.count();
        } catch (IOException e) {
            throw new RuntimeException(e);
        }

        //ACTION
        List<Card> cardListFromJson = board.getCards();

        //VERIFY
        Assertions.assertEquals(noOfLines/Constant.SIZE_JSON_CARD, cardListFromJson.size());
    }
}
