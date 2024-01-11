package fr.alma.trivial_pursuit_server.core.player;

import com.fasterxml.jackson.annotation.JsonBackReference;
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
    @Column(unique = true)
    private String username;
    private String password;
    @OneToOne(mappedBy = "user", cascade = CascadeType.ALL)
    @JsonBackReference
    private Player userPlayer;

    /**
     * Constructor of a User with two field.
     * userPlayer field is set to null.
     * @param username username field
     * @param password password field
     */
    public User(String username, String password){
        this.username = username;
        this.password = password;
    }
}
