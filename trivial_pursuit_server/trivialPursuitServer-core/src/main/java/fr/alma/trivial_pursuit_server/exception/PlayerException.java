package fr.alma.trivial_pursuit_server.exception;

public class PlayerException extends Exception{
    /**
     * Constructor of a PlayerException.
     * @param message to be sent when exception appear
     */
    public PlayerException(String message){
        super(message);
    }
}
