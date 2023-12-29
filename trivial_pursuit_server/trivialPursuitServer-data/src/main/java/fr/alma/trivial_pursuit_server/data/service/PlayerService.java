package fr.alma.trivial_pursuit_server.data.service;

import fr.alma.trivial_pursuit_server.core.player.Player;

public interface PlayerService {
    Boolean isInRepository(Player player);
}
