package fr.alma.trivial_pursuit_server.data.service;

import fr.alma.trivial_pursuit_server.core.player.Player;
import fr.alma.trivial_pursuit_server.data.repository.PlayerRepository;
import org.springframework.beans.factory.annotation.Autowired;

public class PlayerServiceImpl implements PlayerService{

    @Autowired
    private PlayerRepository playerRepository;
    @Override
    public Boolean isInRepository(Player player) {
        return playerRepository.existsById(player.getId());
    }
}
