package fr.alma.trivial_pursuit_server.lobby;

import fr.alma.trivial_pursuit_server.kind.IBoard;
import fr.alma.trivial_pursuit_server.kind.IParty;

import java.util.List;

public interface ILobby extends Lobby {
    IBoard giveBoard();
    List<IParty> partyHistory(String user);
    IParty createGame(String gameName, int nbPlayers);
    Boolean checkPlayersReady(String partyId);
    Boolean joinGame(String user, String party);
    Boolean startGame(String gameName);
    void ready(String user);
}
