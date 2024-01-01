package fr.alma.trivial_pursuit_server.exception;

public class PartyException extends Exception{
    /**
     * Constructor of a PartyException.
     * @param message to be sent when exception appear
     */
    public PartyException(String message){
        super(message);
    }
}
