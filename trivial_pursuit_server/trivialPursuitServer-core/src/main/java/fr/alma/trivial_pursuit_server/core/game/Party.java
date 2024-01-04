package fr.alma.trivial_pursuit_server.core.game;

import fr.alma.trivial_pursuit_server.core.player.Player;
import fr.alma.trivial_pursuit_server.exception.PartyException;
import fr.alma.trivial_pursuit_server.exception.PlayerException;
import fr.alma.trivial_pursuit_server.kind.IParty;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "PARTY")
@NoArgsConstructor
@Getter
@Setter
public class Party implements IParty {

    @Id
    @GeneratedValue
    private Long id;
    @OneToMany(mappedBy = "party", cascade = CascadeType.PERSIST)
    private List<Player> playerList = new ArrayList<>();
    @Column(name = "party_name")
    private String name;
    @OneToOne(cascade = CascadeType.ALL)
    @JoinColumn(name = "chat_id", referencedColumnName = "id")
    private Chat chat;
    @Embedded
    private Board board;
    private int maxCapacityPlayer = 6;

    /**
     * Constructor of a Party.
     * maxCapacityPlayer is set to 6.
     * @param name name field
     * @param playerList playerList field
     * @param chat chat field
     * @param board board field
     * @throws PartyException if all the player in the list cannot be added
     * @throws PlayerException if the party cannot be set to a player
     */
    public Party(String name, List<Player> playerList, Chat chat, Board board) throws PartyException, PlayerException {
        for(Player p : playerList){
            this.addPlayer(p);
        }
        this.name = name;
        this.chat = chat;
        this.board = board;
    }

    /**
     * Constructor of a Party.
     * maxCapacityPlayer is set to nbPlayer.
     * chat is set to null as for board.
     * playerList is initialized with an initial capacity of nbPlayer.
     * @param name name field
     * @param nbPlayer maxCapacityPlayer field
     */
    public Party(String name, int nbPlayer){
        this.playerList = new ArrayList<>(nbPlayer);
        this.maxCapacityPlayer = nbPlayer;
        this.name = name;
        this.chat = null;
        this.board = null;
    }

    /**
     * Setter on the field playerList
     * @param playerList parameter to be set to playerList field
     * @throws PartyException if the size of playerList is incorrect or playerList is null
     */
    public void setPlayerList(List<Player> playerList) throws PartyException {
        if(playerList != null
                && playerList.size()>=2
                && playerList.size()<=maxCapacityPlayer){
            this.playerList = playerList;
        }else{
            throw new PartyException("playerList can't be set because it size doesn't match or it's null");
        }
    }

    /**
     * Add a player to the list
     * @param player new player to add
     * @throws PartyException if there are no space left to add player
     * @throws PlayerException if the party cannot be set to te new player
     */
    public void addPlayer(Player player) throws PartyException, PlayerException {
        if(playerList.size()<maxCapacityPlayer){
            playerList.add(player);
            player.setParty(this);
        }else{
            throw new PartyException("player can't be added, there is no space left");
        }
    }

    /**
     * Remove a player from the list
     * @param player player to be removed
     * @throws PartyException if the list is empty
     */
    public void removePlayer(Player player) throws PartyException {
        if(!playerList.isEmpty()){
            playerList.remove(player);
        }else{
            throw new PartyException("player can't be remove because the playerList is empty");
        }
    }

    /**
     * Verify if all the player are ready in the party
     * @return true if that's the case, false otherwise
     */
    public Boolean checkPlayersReady(){
        for(Player p : playerList){
            if(Boolean.FALSE.equals(p.getReady())){
                return false;
            }
        }
        return true;
    }

}



