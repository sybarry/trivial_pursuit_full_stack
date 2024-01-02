package fr.alma.trivial_pursuit_server.gameplay;

public interface IPartyPlay extends GamePlay{
//    impossible since there is no dependency between core module and api
//    Chat createChat(List<Player> playerList);

    Boolean isWinning(String user);
    void endGame();
}
