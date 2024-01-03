package fr.alma.trivial_pursuit_server.core.game;

import jakarta.persistence.*;
import lombok.*;

import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "CHAT")
@NoArgsConstructor
@Getter
@Setter
public class Chat {

    @Id
    @GeneratedValue
    private Long id;
    @OneToOne(mappedBy = "chat", cascade = CascadeType.ALL)
    private Party party;
    private List<String> messages = new ArrayList<>();

    /**
     * Constructor for a Chat.
     * messages is initialized with an empty list.
     * @param party party field
     */
    public Chat(Party party){
        this.party = party;
    }

    /**
     * Method to add a message to the chat
     * @param msg message to be added
     * @return true if it has be added, false otherwise
     */
    public boolean addMsg(String msg){
        if(msg != null)
            return messages.add(msg);
        else{
            return false;
        }
    }

    /**
     * Method to remove a message from the chat
     * @param msg message to be removed
     * @return  true if it has be removed, false otherwise
     */
    public boolean removeMsg(String msg){
        return messages.remove(msg);
    }
}
