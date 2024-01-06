package fr.alma.trivial_pursuit_server.gameplay;

import java.util.ArrayList;

public interface IBoardPlay extends GamePlay{
    //duplicate with giveBoard in ILobby
//    IBoard createBoard();
    boolean onlyOnePlayerIsPlaying();
    ArrayList<String> rollDiceAndGiveCaseToMove();
    boolean moveToCase(String player, String newCase);
    String pickCard();
    boolean analyseResponse(String cardId, String answer);
}
