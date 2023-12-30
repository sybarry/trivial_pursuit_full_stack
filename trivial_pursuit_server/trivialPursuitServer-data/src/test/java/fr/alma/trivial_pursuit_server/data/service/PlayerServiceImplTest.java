package fr.alma.trivial_pursuit_server.data.service;

import fr.alma.trivial_pursuit_server.core.cases.SimpleCase;
import fr.alma.trivial_pursuit_server.core.player.Player;
import fr.alma.trivial_pursuit_server.data.repository.PlayerRepository;
import fr.alma.trivial_pursuit_server.data.service.impl.PlayerServiceImpl;
import fr.alma.trivial_pursuit_server.exception.CaseException;
import fr.alma.trivial_pursuit_server.util.Color;
import fr.alma.trivial_pursuit_server.util.Theme;

import org.junit.jupiter.api.Assertions;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.util.Arrays;

import static org.mockito.Mockito.*;


class PlayerServiceImplTest {

    private PlayerRepository playerRepository;
    private PlayerServiceImpl playerService;

    @BeforeEach
    void setUp(){
        this.playerRepository = mock(PlayerRepository.class);
        this.playerService = new PlayerServiceImpl(playerRepository);
    }
    @Test
    @DisplayName("test add and check")
    void testAddAndCheck() throws CaseException {
        //CONFIG
        SimpleCase simpleCase = new SimpleCase("case1", Color.BLUE, Theme.GEOGRAPHY);
        simpleCase.setNeighbors(Arrays.asList("case2","case3"));
        Player player = new Player(Color.GREEN, simpleCase, null);
        when(playerRepository.save(player)).thenReturn(player);
        when(playerRepository.existsById(player.getId())).thenReturn(true);

        //ACTION
        playerService.savePlayer(player);

        //VERIFY
        verify(playerRepository, atLeastOnce()).save(player);
        Assertions.assertTrue(playerService.isInRepository(player));


    }
}
