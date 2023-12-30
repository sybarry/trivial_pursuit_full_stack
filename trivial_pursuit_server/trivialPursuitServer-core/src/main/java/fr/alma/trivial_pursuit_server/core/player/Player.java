package fr.alma.trivial_pursuit_server.core.player;

import fr.alma.trivial_pursuit_server.core.cases.Case;
import fr.alma.trivial_pursuit_server.core.game.Party;
import fr.alma.trivial_pursuit_server.exception.PartyException;
import fr.alma.trivial_pursuit_server.exception.PlayerException;
import fr.alma.trivial_pursuit_server.util.Color;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "PLAYER")
@NoArgsConstructor
@Getter
@Setter
public class Player {

    @Id
    @GeneratedValue
    private Long id;
    private Color pawn;
    private int nbTriangle;
    @Embedded
    private Case actualCase = null;
    @ManyToOne
    private Party party;
    private Boolean ready = false;


    public Player(Color pawn){
        this.pawn = pawn;
        this.nbTriangle = 0;
        this.party = null;
    }
    public Player(Color pawn, Party party) {
        this.pawn = pawn;
        this.nbTriangle = 0;
        this.party = party;
    }


    /**
     * Set the party of the player and add the player to the party list
     * @param party to set for the player
     * @throws PlayerException if the party is null
     */
    public void setParty(Party party) throws PlayerException, PartyException {
        if(party != null) {
            this.party = party;
            party.addPlayer(this);
        }else{
            throw new PlayerException("party can't be set because it's null");
        }
    }
}
