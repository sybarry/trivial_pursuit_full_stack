package fr.alma.trivial_pursuit_server.core.cases;

import fr.alma.trivial_pursuit_server.util.Color;
import fr.alma.trivial_pursuit_server.util.Theme;
import org.junit.jupiter.api.Assertions;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.util.Arrays;

class HeadQuarterTest {

    private HeadQuarter headQuarter;

    @BeforeEach
    void setUp(){
        headQuarter = new HeadQuarter("headquarter", Color.PURPLE, Arrays.asList("case1", "case2"), Theme.ARTS_LITERATURE);
    }


    @Test
    @DisplayName("test parametrized constructor")
    void testParametrizedConstructor(){
        //CONFIG
        //ACTION
        //VERIFY
        Assertions.assertEquals(Color.PURPLE, headQuarter.getColor());
        Assertions.assertEquals("headquarter", headQuarter.getName());
        Assertions.assertEquals(Arrays.asList("case1", "case2"), headQuarter.getNeighbors());
        Assertions.assertEquals(Theme.ARTS_LITERATURE, headQuarter.getTheme());
    }

}
