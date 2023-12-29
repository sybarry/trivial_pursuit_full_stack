package fr.alma.trivial_pursuit_server.core;

import jakarta.persistence.*;

import java.util.Objects;

@Entity
@Table(name = "USER")
public class User {
    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "EMP_SEQ")
    private long id;

    private String name;

    private String password;

    public User() {
    }

    public long getId() {
        return id;
    }

    public void setId(long id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }

    public boolean isThePlayer(String password, String name){
        return Objects.equals(password, this.password) && Objects.equals(name, this.name);
    }
}
