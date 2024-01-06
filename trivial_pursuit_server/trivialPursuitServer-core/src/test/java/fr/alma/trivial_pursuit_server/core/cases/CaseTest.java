package fr.alma.trivial_pursuit_server.core.cases;

import fr.alma.trivial_pursuit_server.exception.CaseException;
import fr.alma.trivial_pursuit_server.util.Color;
import org.junit.jupiter.api.Assertions;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.util.Arrays;
import java.util.Collections;

class CaseTest {

    private Case aCase;

    @BeforeEach
    void setUp(){
        aCase = new Case();
    }

    @Test
    @DisplayName("test default constructor")
    void testDefaultConstructor(){
        //CONFIG
        //ACTION
        //VERIFY
        Assertions.assertNull(aCase.getColor());
        Assertions.assertNull(aCase.getName());
        Assertions.assertNull(aCase.getNeighbors());
    }

    @Test
    @DisplayName("test parametrized constructor")
    void testParametrizedConstructor(){
        //CONFIG
        aCase = new Case("name", Color.BLUE, Arrays.asList("case1", "case2"));

        //ACTION
        //VERIFY
        Assertions.assertEquals(Color.BLUE, aCase.getColor());
        Assertions.assertEquals("name", aCase.getName());
        Assertions.assertEquals(Arrays.asList("case1", "case2"), aCase.getNeighbors());
    }

    @Test
    @DisplayName("test set neighbors with a correct list")
    void testSetNeighborsCorrect(){
        //CONFIG
        //ACTION
        Assertions.assertDoesNotThrow(() -> aCase.setNeighbors(Arrays.asList("case1", "case2", "case3", "case4", "case5", "case6")));
        Assertions.assertDoesNotThrow(() -> aCase.setNeighbors(Arrays.asList("case1", "case2")));

        //VERIFY
        Assertions.assertEquals(Arrays.asList("case1", "case2"), aCase.getNeighbors());
    }

    @Test
    @DisplayName("test set neighbors with a incorrect list, size doesn't fit")
    void testSetNeighborsIncorrectListSize(){
        //CONFIG
        //ACTION
        Assertions.assertThrows(CaseException.class, () -> aCase.setNeighbors(Collections.singletonList("case1")));
        Assertions.assertThrows(CaseException.class, () -> aCase.setNeighbors(Arrays.asList("case1", "case2", "case3", "case4", "case5", "case6", "case7")));

        //VERIFY
        Assertions.assertNull(aCase.getNeighbors());
    }

    @Test
    @DisplayName("test set neighbors with a incorrect list, it's null")
    void testSetNeighborsIncorrectNull(){
        //CONFIG
        //ACTION
        Assertions.assertThrows(CaseException.class, () -> aCase.setNeighbors(null));

        //VERIFY
        Assertions.assertNull(aCase.getNeighbors());
    }
}
