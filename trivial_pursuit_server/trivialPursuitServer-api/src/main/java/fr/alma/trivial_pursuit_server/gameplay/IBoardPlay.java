package fr.alma.trivial_pursuit_server.gameplay;

public interface IBoardPlay extends GamePlay{
    boolean moveToCase(String player, String newCase);
    String pickCard(String partyId, String questionTheme);
    boolean analyseResponse(String cardId, String theme, String answer);
}
