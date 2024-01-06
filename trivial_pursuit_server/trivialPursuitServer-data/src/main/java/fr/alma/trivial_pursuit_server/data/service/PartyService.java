package fr.alma.trivial_pursuit_server.data.service;

import fr.alma.trivial_pursuit_server.core.game.Party;
import fr.alma.trivial_pursuit_server.core.player.Player;

import java.util.List;

public interface PartyService {

    Boolean isInRepository(Party party);

    Party saveParty(Party party);

    List<Party> findAll();

    List<Party> findAllByPlayer(List<Player> playerList);

    Party findById(String partyId);

    void flush();
}
