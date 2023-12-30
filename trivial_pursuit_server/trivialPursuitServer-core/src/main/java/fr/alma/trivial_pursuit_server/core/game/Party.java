package fr.alma.trivial_pursuit_server.core.game;

import fr.alma.trivial_pursuit_server.core.player.Player;
import fr.alma.trivial_pursuit_server.exception.PartyException;
import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "PARTY")
@NoArgsConstructor
@Data
public class Party {

    @Id
    @GeneratedValue
    private Long id;
    @OneToMany(mappedBy = "party", cascade = CascadeType.PERSIST)
    private List<Player> playerList = new ArrayList<>();
    private String name;
    @Embedded
    private Lobby lobby;
    @OneToOne(cascade = CascadeType.ALL)
    @JoinColumn(name = "chat_id", referencedColumnName = "id")
    private Chat chat;
    @Embedded
    private Board board;


    public Party(List<Player> playerList, String name, Lobby lobby, Chat chat, Board board) {
        this.playerList = playerList;
        this.name = name;
        this.lobby = lobby;
        this.chat = chat;
        this.board = board;
    }

    public void setPlayerList(List<Player> playerList) throws PartyException {
        if(playerList != null && playerList.size()>=2 && playerList.size()<=6){
            this.playerList = playerList;
        }else{
            throw new PartyException();
        }
    }
    public void addPlayer(Player player){
        if(playerList.size()<6){
            playerList.add(player);
        }
    }

}



