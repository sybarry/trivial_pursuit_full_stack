package fr.alma.trivial_pursuit_server.core.game;

import fr.alma.trivial_pursuit_server.core.card.Card;
import fr.alma.trivial_pursuit_server.core.card.Question;
import fr.alma.trivial_pursuit_server.core.cases.Case;
import fr.alma.trivial_pursuit_server.core.cases.HeadQuarter;
import fr.alma.trivial_pursuit_server.core.cases.SimpleCase;
import fr.alma.trivial_pursuit_server.core.player.Player;
import fr.alma.trivial_pursuit_server.exception.BoardException;
import fr.alma.trivial_pursuit_server.util.Color;
import jakarta.persistence.ElementCollection;
import jakarta.persistence.Embeddable;
import jakarta.persistence.Transient;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.util.ArrayList;
import java.util.List;

@Embeddable
@NoArgsConstructor
@Getter
public class Board {

    @ElementCollection
    private List<Card> cards;
    @ElementCollection
    private List<Case> cases;
    private Case initialCase;
    @ElementCollection
    private List<Player> playerList;
    @Transient
    private int actualCardNotPicked;

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
        for(Player p : this.playerList){
            p.setActualCase(initialCase);
        }
        this.actualCardNotPicked = 0;
    }

    /**
     * Pick a card not picked yet from the list of cards.
     * If there is no card already picked then reset all the card and restart to pick a card from the deck.
     * @return a Card not yet picked
     */
    public Card getACard(){
        if(actualCardNotPicked == cards.size()){
            actualCardNotPicked = 0;
            for(Card c : cards){
                c.setIsPicked(false);
            }
        }
        cards.get(actualCardNotPicked).setIsPicked(true);
        return cards.get(actualCardNotPicked++);
    }

    /**
     * Remove a player from the board
     * @param player to be removed
     */
    public void removePlayer(Player player){
        playerList.remove(player);
    }

    /**
     * Verify that the list of cases are correctly build.
     * The list must have the correct number of each type of cases.
     * @param cases list of cases
     * @throws BoardException if the list is not correctly build
     */
    private void verifyCases(List<Case> cases) throws BoardException {
        int nbSimpleCase = 0;
        int nbHeadQuarter = 0;
        for(Case c : cases){
            if(c instanceof SimpleCase)
                nbSimpleCase++;
            else if(c instanceof HeadQuarter)
                nbHeadQuarter++;
        }
        if(nbHeadQuarter!=6 && nbSimpleCase!=66){
            throw new BoardException("list of cases got the wrong number of each subClasse of Case");
        }
    }

    /**
     * Verify that the list of cards is correctly build.
     * Each card must have 6 question link to 6 answer and reciprocally.
     * @param cards list of cards
     * @throws BoardException if the list is not correctly build
     */
    private void verifyCard(List<Card> cards) throws BoardException {
        for(Card c : cards){
            if(Boolean.TRUE.equals(c.getIsPicked()
                    || c.getAnswers().size() != 6
                    || c.getQuestions().size() != 6))
            {
                throw new BoardException("list of cards is incorrect");
            }
            for(Question q : c.getQuestions()){
                if(!c.getAnswers().contains(q.getAnswer())){
                    throw new BoardException("card c have incorrect question and answer because there are not correctly link");
                }
            }
        }
    }

    /**
     * Verify that the list of players is correctly build.
     * The players must have a different pawn color from each other.
     * Their nbTriangle must be 0.
     * Each player must have the same Party set.
     * The initialCase must be null.
     * @param players list of players
     * @throws BoardException if the list is not correctly build
     */
    private void verifyPlayers(List<Player> players) throws BoardException {
        Party p = players.get(0).getParty();
        List<Color> colorsPlayer = new ArrayList<>();
        for(Player pp : players){
            if(pp.getParty() != p){
                throw new BoardException("players party are not all equals");
            }
            if(pp.getNbTriangle() != 0){
                throw new BoardException("player nbTriangle is not zero");
            }
            if(colorsPlayer.contains(pp.getPawn())){
                throw new BoardException("player pawn color already exist");
            }
            if(pp.getActualCase() != null){
                throw new BoardException("player initialCase already set");
            }
            colorsPlayer.add(pp.getPawn());
        }
    }

}
