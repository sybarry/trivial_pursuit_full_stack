package fr.alma.trivial_pursuit_server.exception;

public class CardException extends Exception{
    /**
     * Constructor of a CardException.
     * @param message to be sent when exception appear
     */
    public CardException(String message){
        super(message);
    }
}
