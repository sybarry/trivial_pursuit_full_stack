package fr.alma.trivial_pursuit_server.data.repository;

import fr.alma.trivial_pursuit_server.core.player.Player;
import fr.alma.trivial_pursuit_server.core.player.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PlayerRepository extends JpaRepository<Player, Long> {

    /**
     * Find a player similar to the one passed
     * @param player player to be find in repository
     * @return the player find, null if none
     */
    @Query("SELECT p FROM Player p WHERE p=?1")
    Player find(Player player);

    /**
     * Find a list of player who have the user passed
     * @param user user's player to be find in repository
     * @return A list of player, null if none
     */
    @Query("SELECT p FROM Player p WHERE p.user=?1")
    List<Player> findAllPlayerByUser(User user);
}
