package fr.alma.trivial_pursuit_server.data.service;

import fr.alma.trivial_pursuit_server.core.player.Player;

import java.util.List;

public interface PlayerService {
    Boolean isInRepository(Player player);

    Player savePlayer(Player player);

    List<Player> findAll();
}
