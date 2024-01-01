package fr.alma.trivial_pursuit_server.exception;

public class BoardException extends Exception{
    /**
     * Constructor of a BoardException.
     * @param message to be sent when exception appear
     */
    public BoardException(String message){
        super(message);
    }
}
