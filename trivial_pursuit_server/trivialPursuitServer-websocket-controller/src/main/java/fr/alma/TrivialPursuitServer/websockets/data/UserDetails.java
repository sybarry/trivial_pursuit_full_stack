package fr.alma.TrivialPursuitServer.websockets.data;

import com.fasterxml.jackson.annotation.JsonInclude;

import java.io.Serializable;

@JsonInclude(JsonInclude.Include.NON_NULL)
public record UserDetails(Long id, String name, String password) implements Serializable {
}
