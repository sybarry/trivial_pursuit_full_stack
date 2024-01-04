package fr.alma.trivial_pursuit_server.core.game;

import fr.alma.trivial_pursuit_server.core.cases.Case;
import fr.alma.trivial_pursuit_server.core.cases.HeadQuarter;
import fr.alma.trivial_pursuit_server.core.cases.SimpleCase;
import fr.alma.trivial_pursuit_server.util.Color;
import fr.alma.trivial_pursuit_server.util.Theme;
import org.junit.jupiter.api.Assertions;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.util.Arrays;
import java.util.List;

class BoardFactoryTest {

    private int indice = 0;

    private final List<Case> caseList = BoardFactory.buildCases();
    @Test
    @DisplayName("test build cases, verify HeadQuarter cases")
    void testBuildCasesHeadquarter(){
        //CONFIG
        HeadQuarter firstHeadQuarter = (HeadQuarter) caseList.get(indice);
        //ACTION
        //VERIFY
        Assertions.assertEquals(Arrays.asList("case5", "case66", "case31"),firstHeadQuarter.getNeighbors());
        Assertions.assertEquals("headquarter1", firstHeadQuarter.getName());
        Assertions.assertEquals(Color.BLUE, firstHeadQuarter.getColor());
        Assertions.assertEquals(Theme.GEOGRAPHY, firstHeadQuarter.getTheme());
        Assertions.assertTrue(caseList.get(indice) instanceof HeadQuarter);
    }

    @Test
    @DisplayName("test build cases, verify simpleCase cases in transversal branches")
    void testBuildCasesSimpleCase(){
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
        Assertions.assertTrue(caseList.get(indice+1) instanceof SimpleCase);

        Assertions.assertEquals(Arrays.asList("case1", "case3"),simpleCaseWithJustSimpleCaseNeighbor.getNeighbors());
        Assertions.assertEquals("case2", simpleCaseWithJustSimpleCaseNeighbor.getName());
        Assertions.assertEquals(Color.BLUE, simpleCaseWithJustSimpleCaseNeighbor.getColor());
        Assertions.assertEquals(Theme.GEOGRAPHY, simpleCaseWithJustSimpleCaseNeighbor.getTheme());
        Assertions.assertTrue(caseList.get(indice+4) instanceof SimpleCase);
    }
}
