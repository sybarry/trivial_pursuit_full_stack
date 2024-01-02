package fr.alma.trivial_pursuit_server.gameplay;

import java.util.ArrayList;

public interface IBoardPlay extends GamePlay{
//    impossible since there is no dependency between core module and api
//    Board createBoard();
    Boolean onlyOnePlayerIsPlaying();
    ArrayList<String> rollDiceAndGiveCaseToMove();
    Boolean moveToCase(String player, String newCase);
    String pickCard();
    Boolean analyseResponse(String cardId, String answer);
}
