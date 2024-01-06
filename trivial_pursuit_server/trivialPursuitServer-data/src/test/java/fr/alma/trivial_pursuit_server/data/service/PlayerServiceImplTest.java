package fr.alma.trivial_pursuit_server.data.service;

import fr.alma.trivial_pursuit_server.core.player.Player;
import fr.alma.trivial_pursuit_server.data.repository.PlayerRepository;
import fr.alma.trivial_pursuit_server.data.service.impl.PlayerServiceImpl;
import fr.alma.trivial_pursuit_server.util.Color;

import org.junit.jupiter.api.Assertions;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.util.Collections;
import java.util.List;

import static org.mockito.Mockito.*;


class PlayerServiceImplTest {

    private PlayerRepository playerRepository;
    private PlayerServiceImpl playerService;

    private Player player;

    @BeforeEach
    void setUp() {
        this.playerRepository = mock(PlayerRepository.class);
        this.playerService = new PlayerServiceImpl(playerRepository);

        player = new Player(Color.GREEN, null);
    }
    @Test
    @DisplayName("test add and check")
    void testAddAndCheck() {
        //CONFIG
        Player player2 = new Player(Color.BLUE, null);
        player2.setId(888L);

        when(playerRepository.save(player)).thenReturn(player);
        when(playerRepository.existsById(player.getId())).thenReturn(false);
        when(playerRepository.existsById(player2.getId())).thenReturn(true);
        playerRepository.flush();
        //ACTION
        Boolean resultNotExist = playerService.isInRepository(player);
        Player resultSave = playerService.savePlayer(player);
        Boolean resultExist = playerService.isInRepository(player2);

        //VERIFY
        verify(playerRepository, atLeastOnce()).save(player);
        Assertions.assertEquals(player, resultSave);
        Assertions.assertTrue(resultExist);
        Assertions.assertFalse(resultNotExist);
    }

    @Test
    @DisplayName("test find all")
    void testFindAll(){
        //CONFIG
        when(playerRepository.findAll()).thenReturn(Collections.singletonList(player));

        //ACTION
        List<Player> result = playerService.findAll();

        //VERIFY
        verify(playerRepository, atLeastOnce()).findAll();
        Assertions.assertEquals(Collections.singletonList(player), result);
    }
}
