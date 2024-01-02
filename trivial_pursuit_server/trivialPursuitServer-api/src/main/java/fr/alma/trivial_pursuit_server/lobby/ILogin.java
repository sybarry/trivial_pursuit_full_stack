package fr.alma.trivial_pursuit_server.lobby;

public interface ILogin extends Lobby{
    void newPassword(String user, String password);
    Boolean login(String user, String password);
    Boolean createAccount(String user, String password);
    Boolean resetPassword(String user);
    Boolean logout(String user);
}
