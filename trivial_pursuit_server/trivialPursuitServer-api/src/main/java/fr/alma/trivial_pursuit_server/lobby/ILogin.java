package fr.alma.trivial_pursuit_server.lobby;

public interface ILogin extends Lobby{
    boolean newPassword(String user, String password);
    boolean login(String user, String password);
    boolean createAccount(String user, String password);
    boolean resetPassword(String user);
}
