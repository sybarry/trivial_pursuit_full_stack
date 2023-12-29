package fr.alma.trivial_pursuit_server.core.player;

import fr.alma.trivial_pursuit_server.core.cases.Case;
import fr.alma.trivial_pursuit_server.core.game.Party;
import fr.alma.trivial_pursuit_server.util.Color;
import jakarta.persistence.*;

@Entity
@Table(name = "PLAYER")
public class Player {

    private Long id;
    private Color pawn;
    private int nbTriangle;
    @Embedded
    private Case actualCase;

    @Embedded
//    @ManyToOne
    private Party party;

    public Player(){}

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
    @Id
    @GeneratedValue()
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Color getPawn() {
        return pawn;
    }

    public void setPawn(Color pawn) {
        this.pawn = pawn;
    }

    public int getNbTriangle() {
        return nbTriangle;
    }

    public void setNbTriangle(int nbTriangle) {
        this.nbTriangle = nbTriangle;
    }

    public Case getActualCase() {
        return actualCase;
    }

    public void setActualCase(Case actualCase) {
        this.actualCase = actualCase;
    }

    public Party getParty() {
        return party;
    }

    public void setParty(Party party) {
        this.party = party;
    }
}
