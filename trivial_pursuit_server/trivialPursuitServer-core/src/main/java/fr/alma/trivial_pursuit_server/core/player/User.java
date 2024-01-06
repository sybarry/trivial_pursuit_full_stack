package fr.alma.trivial_pursuit_server.core.player;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "USER")
@NoArgsConstructor
@Getter
@Setter
public class User {
    @Id
    @GeneratedValue
    private Long id;
    private String username;
    private String password;
    @OneToOne(mappedBy = "user")
    @Transient
    private Player userPlayer;

    public User(String username, String password){
        this.username = username;
        this.password = password;
    }
}
