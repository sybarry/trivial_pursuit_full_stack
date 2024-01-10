package fr.alma.trivial_pursuit_server.lobby;

import fr.alma.trivial_pursuit_server.kind.IParty;

import java.util.List;

public interface ILobby extends Lobby {
    List<IParty> partyHistory(String user);
    IParty createGame(String gameName, int nbPlayers);
    boolean checkPlayersReady(String partyId);
    boolean joinGame(String user, String party);
    boolean startGame(String gameName);
    void ready(String user);
}
