package fr.alma.trivial_pursuit_server.core.player;

import fr.alma.trivial_pursuit_server.core.cases.Case;
import fr.alma.trivial_pursuit_server.core.game.Party;
import fr.alma.trivial_pursuit_server.exception.PlayerException;
import fr.alma.trivial_pursuit_server.util.Color;
import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "PLAYER")
@NoArgsConstructor
@Data
public class Player {

    @Id
    @GeneratedValue
    private Long id;
    private Color pawn;
    private int nbTriangle;
    @Embedded
    private Case actualCase;
    @ManyToOne
    private Party party;


    public Player(Color pawn){
        this.pawn = pawn;
        this.nbTriangle = 0;
        this.actualCase = null;
        this.party = null;
    }
    public Player(Color pawn, Case actualCase, Party party) {
        this.pawn = pawn;
        this.nbTriangle = 0;
        this.actualCase = actualCase;
        this.party = party;
    }


    /**
     * Set the party of the player and add the player to the party list
     * @param party to set for the player
     * @throws PlayerException if the party is null
     */
    public void setParty(Party party) throws PlayerException {
        if(party != null) {
            this.party = party;
            party.addPlayer(this);
        }else{
            throw new PlayerException();
        }
    }
}
