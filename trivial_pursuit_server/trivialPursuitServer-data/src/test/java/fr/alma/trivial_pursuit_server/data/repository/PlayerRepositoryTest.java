package fr.alma.trivial_pursuit_server.data.repository;

import fr.alma.trivial_pursuit_server.core.player.Player;
import fr.alma.trivial_pursuit_server.data.configuration.DataTestConfiguration;
import fr.alma.trivial_pursuit_server.util.Color;
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
class PlayerRepositoryTest {

    @Resource
    private PlayerRepository playerRepository;

    private Player player;

    @BeforeEach
    void setUp() {
        player = new Player(Color.GREEN, null);
    }

    @Test
    @DisplayName("test add")
    void testInsertPlayer() {
        //CONFIG
        //ACTION
        playerRepository.save(player);

        //VERIFY
        Assertions.assertTrue(playerRepository.existsById(player.getId()));
        Assertions.assertEquals(1, playerRepository.findAll().size());
        Assertions.assertEquals(1,playerRepository.count());


        Optional<Player> playerr = playerRepository.findAll()
                .stream()
                .filter(ply-> ply.getPawn().equals(Color.GREEN))
                .findFirst();

        Assertions.assertTrue(playerr.isPresent());
    }

    @Test
    @DisplayName("test remove player")
    void testDeletePlayer(){
        //CONFIG
        //ACTION
        playerRepository.save(player);
        playerRepository.delete(player);

        //VERIFY
        Assertions.assertFalse(playerRepository.existsById(player.getId()));
    }

}
