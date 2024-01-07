package fr.alma.trivial_pursuit_server.data.service;

import fr.alma.trivial_pursuit_server.core.player.Player;
import fr.alma.trivial_pursuit_server.core.player.User;

import java.util.List;

public interface PlayerService {
    Boolean isInRepository(Player player);

    Player savePlayer(Player player);

    List<Player> findAll();

    List<Player> findAllPlayerByUser(User user);

    void flush();

    void delete(Player player);
}
