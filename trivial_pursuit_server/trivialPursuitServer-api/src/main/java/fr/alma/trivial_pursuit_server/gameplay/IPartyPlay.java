package fr.alma.trivial_pursuit_server.gameplay;

import fr.alma.trivial_pursuit_server.kind.IChat;
import fr.alma.trivial_pursuit_server.kind.IPlayer;

import java.util.List;

public interface IPartyPlay extends GamePlay{
    IChat createChat(List<IPlayer> playerList);
    //front handling
//    boolean isWinning(String user);
    void endGame();
}
