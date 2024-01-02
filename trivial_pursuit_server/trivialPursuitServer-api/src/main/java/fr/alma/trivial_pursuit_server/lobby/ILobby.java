package fr.alma.trivial_pursuit_server.lobby;

public interface ILobby extends Lobby {
//    impossible since there is no dependency between core module and api
//    Board giveBoard();
//    List<Party> partyHistory(String user);
//    Party createGame(String gameName, int nbPlayers);
    Boolean checkPlayersReady(String partyId);
    Boolean joinGame(String user, String party);
    Boolean startGame(String gameName);
    void ready(String user);
}
