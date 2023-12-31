package fr.alma.trivial_pursuit_server.exception;

public class CaseException extends Exception{
    /**
     * Constructor of a CaseException.
     * @param message to be sent when exception appear
     */
    public CaseException(String message){
        super(message);
    }
}
