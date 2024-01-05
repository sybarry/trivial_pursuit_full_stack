package fr.alma.trivial_pursuit_server.gameplay;

import fr.alma.trivial_pursuit_server.kind.IBoard;

import java.util.ArrayList;

public interface IBoardPlay extends GamePlay{
    IBoard createBoard();
    boolean onlyOnePlayerIsPlaying();
    ArrayList<String> rollDiceAndGiveCaseToMove();
    boolean moveToCase(String player, String newCase);
    String pickCard();
    boolean analyseResponse(String cardId, String answer);
}
