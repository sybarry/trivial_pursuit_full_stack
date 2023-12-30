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

    @OneToOne(mappedBy = "chat", cascade = CascadeType.ALL)
    private Party party;
    @Id
    @GeneratedValue
    private Long id;
    private List<String> messages = new ArrayList<>();

    public Chat(Party party){
        this.party = party;
    }

    public boolean addMsg(String msg){
        return messages.add(msg);
    }

    public boolean removeMsg(String msg){
        return messages.remove(msg);
    }
}
