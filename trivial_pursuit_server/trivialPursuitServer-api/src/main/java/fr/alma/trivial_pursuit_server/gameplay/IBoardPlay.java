package fr.alma.trivial_pursuit_server.gameplay;

import fr.alma.trivial_pursuit_server.kind.IBoard;

import java.util.ArrayList;

public interface IBoardPlay extends GamePlay{
    IBoard createBoard();
    Boolean onlyOnePlayerIsPlaying();
    ArrayList<String> rollDiceAndGiveCaseToMove();
    Boolean moveToCase(String player, String newCase);
    String pickCard();
    Boolean analyseResponse(String cardId, String answer);
}
