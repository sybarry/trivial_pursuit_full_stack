package fr.alma.trivial_pursuit_server.core.game;

import fr.alma.trivial_pursuit_server.core.card.Card;
import fr.alma.trivial_pursuit_server.core.cases.Case;
import fr.alma.trivial_pursuit_server.core.cases.HeadQuarter;
import fr.alma.trivial_pursuit_server.core.cases.SimpleCase;
import fr.alma.trivial_pursuit_server.core.player.Player;
import fr.alma.trivial_pursuit_server.exception.BoardException;
import jakarta.persistence.ElementCollection;
import jakarta.persistence.Embeddable;
import jakarta.persistence.Transient;
import lombok.NoArgsConstructor;

import java.util.Arrays;
import java.util.List;

@Embeddable
@NoArgsConstructor
public class Board {

    @ElementCollection
    private List<Card> cards = Arrays.asList(new Card[400]);
    @ElementCollection
    private List<Case> cases = Arrays.asList(new Case[72]);
    private Case initialCase;
    @ElementCollection
    private List<Player> playerList;

    @Transient
    private int actualCardNotPicked = 0;

    /**
     * Constructor with all the needed parameters already initialize and fill correctly
     * @param cards of the board
     * @param cases of the board
     * @param initialCase of the board where all players start
     * @param playerList of the board
     * @throws BoardException if the needed parameters are incorrect
     */
    public Board(List<Card> cards, List<Case> cases, Case initialCase, List<Player> playerList) throws BoardException {
        if(cases.contains(initialCase) || cards.size() != 400 || cases.size() != 72 || playerList.size()<2 || playerList.size()>6 || initialCase instanceof SimpleCase || initialCase instanceof HeadQuarter){
            throw new BoardException("constructor parameters doesn't match to the specification");
        }
        verifyCases(cases);
        verifyCard(cards);
        verifyPlayers(playerList);
        this.cards = cards;
        this.cases = cases;
        this.initialCase = initialCase;
        this.playerList = playerList;
    }

    public Card getACard(){
        cards.get(actualCardNotPicked).setIsPicked(true);
        return cards.get(actualCardNotPicked++);
    }

    public void removePlayer(Player player){
        playerList.remove(player);
    }

    private void verifyCases(List<Case> cases) throws BoardException {
        int nbSimpleCase = 0;
        int nbHeadQuarter = 0;
        for(Case c : cases){
            if(c instanceof SimpleCase)
                nbSimpleCase++;
            else if(c instanceof HeadQuarter)
                nbHeadQuarter++;
        }
        if(nbSimpleCase+nbHeadQuarter!=72 && nbHeadQuarter!=6 && nbSimpleCase!=66){
            throw new BoardException("list of cases got the wrong number of each subClasse of Case");
        }
    }
    private void verifyCard(List<Card> cards){
        //TODO
    }
    private void verifyPlayers(List<Player> players){
        //TODO
    }

}
