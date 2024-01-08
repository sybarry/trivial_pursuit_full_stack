package fr.alma.trivial_pursuit_server.gameplay;

import fr.alma.trivial_pursuit_server.kind.IChat;

public interface IPartyPlay extends GamePlay{
    IChat createChat(String partyId);
    //front handling
//    boolean isWinning(String user);
    void endGame(String partyId);
}
