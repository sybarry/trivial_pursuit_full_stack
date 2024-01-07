package fr.alma.trivial_pursuit_server.gameplay;

public interface IBoardPlay extends GamePlay{
    //duplicate with giveBoard in ILobby
//    IBoard createBoard();
    //front handling
//    boolean onlyOnePlayerIsPlaying();
//    ArrayList<String> rollDiceAndGiveCaseToMove();
    boolean moveToCase(String player, String newCase);
    String pickCard(String partyId, String questionTheme);
    boolean analyseResponse(String cardId, String theme, String answer);
}
