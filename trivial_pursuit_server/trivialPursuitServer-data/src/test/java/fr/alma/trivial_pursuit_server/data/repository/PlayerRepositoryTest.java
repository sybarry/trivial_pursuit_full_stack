package fr.alma.trivial_pursuit_server.data.repository;

import fr.alma.trivial_pursuit_server.core.card.Answer;
import fr.alma.trivial_pursuit_server.core.card.Card;
import fr.alma.trivial_pursuit_server.core.card.Question;
import fr.alma.trivial_pursuit_server.core.cases.Case;
import fr.alma.trivial_pursuit_server.core.cases.SimpleCase;
import fr.alma.trivial_pursuit_server.core.player.Player;
import fr.alma.trivial_pursuit_server.data.configuration.DataTestConfiguration;
import fr.alma.trivial_pursuit_server.data.repository.CardRepository;
import fr.alma.trivial_pursuit_server.data.repository.PlayerRepository;
import fr.alma.trivial_pursuit_server.exception.CardException;
import fr.alma.trivial_pursuit_server.exception.CaseException;
import fr.alma.trivial_pursuit_server.util.Color;
import fr.alma.trivial_pursuit_server.util.Theme;
import jakarta.annotation.Resource;
import jakarta.transaction.Transactional;
import org.junit.jupiter.api.Assertions;
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
class PlayerRepositoryTest {

    @Resource
    private PlayerRepository playerRepository;

    @Test
    @DisplayName("test add")
    void testInsertPlayer() throws CaseException {
        //CONFIG
        SimpleCase simpleCase = new SimpleCase("case1", Color.BLUE, Theme.GEOGRAPHY);
        simpleCase.setNeighbors(Arrays.asList("case2","case3"));
        Player player = new Player(Color.GREEN, simpleCase, null);
        //ACTION
        playerRepository.save(player);

        //VERIFY
        Assertions.assertTrue(playerRepository.existsById(player.getId()));
        Assertions.assertEquals(simpleCase, playerRepository.findById(player.getId()).get().getActualCase());
        Assertions.assertEquals(1, playerRepository.findAll().size());
        Assertions.assertEquals(1,playerRepository.count());


        Optional<Player> playerr = playerRepository.findAll()
                .stream()
                .filter(ply-> ply.getActualCase().equals(simpleCase) && ply.getPawn().equals(Color.GREEN))
                .findFirst();

        Assertions.assertTrue(playerr.isPresent());
    }
}
