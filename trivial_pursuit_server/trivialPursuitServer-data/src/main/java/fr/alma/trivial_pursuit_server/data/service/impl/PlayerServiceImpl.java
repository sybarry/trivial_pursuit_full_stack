package fr.alma.trivial_pursuit_server.data.service.impl;

import fr.alma.trivial_pursuit_server.core.player.Player;
import fr.alma.trivial_pursuit_server.data.repository.PlayerRepository;
import fr.alma.trivial_pursuit_server.data.service.PlayerService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class PlayerServiceImpl implements PlayerService {

    @Autowired
    private PlayerRepository playerRepository;


    public PlayerServiceImpl(PlayerRepository playerRepository){
        this.playerRepository = playerRepository;
    }


    @Override
    public Boolean isInRepository(Player player) {
        return playerRepository.existsById(player.getId());
    }

    @Override
    public Player savePlayer(Player player){
        return playerRepository.save(player);
    }

    @Override
    public List<Player> findAll() {
        return playerRepository.findAll();
    }
}
