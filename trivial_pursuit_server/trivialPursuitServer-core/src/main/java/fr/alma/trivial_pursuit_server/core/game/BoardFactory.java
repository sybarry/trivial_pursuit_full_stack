package fr.alma.trivial_pursuit_server.core.game;

import fr.alma.trivial_pursuit_server.core.card.Card;
import fr.alma.trivial_pursuit_server.core.cases.Case;
import fr.alma.trivial_pursuit_server.core.player.Player;
import fr.alma.trivial_pursuit_server.exception.BoardException;
import lombok.AccessLevel;
import lombok.NoArgsConstructor;

import java.util.Arrays;
import java.util.List;

@NoArgsConstructor(access = AccessLevel.PRIVATE)
public class BoardFactory {

    /**
     * Static method for auto create a correct Board.
     * It creates all the board cases, the initialCase and get the cards from a repository.
     * @param playerList playerList field of Board
     * @return a Board correctly set. Ready to be use for a game
     * @throws BoardException if the board is not correctly design within the method.
     */
    public static Board createBoard(List<Player> playerList) throws BoardException {
        //TODO
        List<Case> casesList = Arrays.asList(new Case[72]);
        List<Card> cardsList = Arrays.asList(new Card[400]);


        Case initialCase = new Case("initialCase", null, Arrays.asList("case1", "case2", "case3", "case4", "case5", "case6"));
        return new Board(cardsList, casesList, initialCase, playerList);
    }
}

