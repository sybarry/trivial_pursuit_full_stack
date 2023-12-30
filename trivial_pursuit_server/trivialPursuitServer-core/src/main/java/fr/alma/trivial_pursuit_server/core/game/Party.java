package fr.alma.trivial_pursuit_server.core.game;

import fr.alma.trivial_pursuit_server.core.player.Player;
import fr.alma.trivial_pursuit_server.exception.PartyException;
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
public class Party {

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


    public Party(String name, List<Player> playerList, Chat chat, Board board) {
        this.playerList = playerList;
        this.name = name;
        this.chat = chat;
        this.board = board;
    }

    public Party(String name, int nbPlayer){
        this.playerList = new ArrayList<>(nbPlayer);
        this.maxCapacityPlayer = nbPlayer;
        this.name = name;
        this.chat = null;
        this.board = null;
    }

    public void setPlayerList(List<Player> playerList) throws PartyException {
        if(playerList != null && playerList.size()>=2 && playerList.size()<=maxCapacityPlayer){
            this.playerList = playerList;
        }else{
            throw new PartyException("playerList can't be set because it size doesn't match or it's null");
        }
    }
    public void addPlayer(Player player) throws PartyException {
        if(playerList.size()<maxCapacityPlayer){
            playerList.add(player);
        }else{
            throw new PartyException("player can't be added, there is no space left");
        }
    }

    public void removePlayer(Player player) throws PartyException {
        if(!playerList.isEmpty()){
            playerList.remove(player);
        }
        throw new PartyException("player can't be remove because the playerList is empty");
    }
    public Boolean checkPlayersReady(){
        for(Player p : playerList){
            if(Boolean.FALSE.equals(p.getReady())){
                return false;
            }
        }
        return true;
    }

}



