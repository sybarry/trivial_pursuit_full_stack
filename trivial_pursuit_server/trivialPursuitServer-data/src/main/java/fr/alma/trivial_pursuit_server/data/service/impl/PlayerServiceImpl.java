package fr.alma.trivial_pursuit_server.data.service.impl;

import fr.alma.trivial_pursuit_server.core.player.Player;
import fr.alma.trivial_pursuit_server.core.player.User;
import fr.alma.trivial_pursuit_server.data.repository.PlayerRepository;
import fr.alma.trivial_pursuit_server.data.service.PlayerService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class PlayerServiceImpl implements PlayerService {

    @Autowired
    private PlayerRepository playerRepository;

    /**
     * Constructor of a PlayerServiceImpl
     * @param playerRepository playerRepository field
     */
    public PlayerServiceImpl(PlayerRepository playerRepository){
        this.playerRepository = playerRepository;
    }

    /**
     * Check if a player is in the repository
     * @param player player to be checked
     * @return true if in, false otherwise
     */
    @Override
    public Boolean isInRepository(Player player) {
        return playerRepository.existsById(player.getId());
    }

    /**
     * Store a player in the repository
     * @param player player to be stored
     * @return the player stored
     */
    @Override
    public Player savePlayer(Player player){
        return playerRepository.save(player);
    }

    /**
     * Retrieve all the players in the repository
     * @return A list composed of the players of the repository
     */
    @Override
    public List<Player> findAll() {
        return playerRepository.findAll();
    }

    /**
     * Find all the player that match the given user
     * @param user user parameter
     * @return A list of player that match, null if none
     */
    @Override
    public List<Player> findAllPlayerByUser(User user) {
        return playerRepository.findAllPlayerByUser(user);
    }

    /**
     * Flush the repository
     */
    @Override
    public void flush(){
        playerRepository.flush();
    }

    /**
     * Remove a player from the repository
     * @param player player to be removed
     */
    @Override
    public void delete(Player player){
        playerRepository.delete(player);
    }
}
