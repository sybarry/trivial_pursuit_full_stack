package fr.alma.trivial_pursuit_server.data.repository;

import fr.alma.trivial_pursuit_server.core.game.Party;
import fr.alma.trivial_pursuit_server.core.player.Player;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PartyRepository extends JpaRepository<Party, Long> {

    /**
     * Find a party similar to the one passed
     * @param party party to be find in repository
     * @return the party find, null if none
     */
    @Query("SELECT p FROM Party p WHERE p=?1")
    Party find(Party party);


    /**
     * Find the matching party where the player is in the party's playerList
     * @param player player to be in the party of the repository
     * @return A list of party, null if none
     */
    @Query("SELECT p FROM Party p WHERE ?1 member of p.playerList")
    List<Party> findAllByPlayer(Player player);

    /**
     * Find a party by id where the return is not optional type
     * @param partyId partyId to be find in repository
     * @return the party find, null if none
     */
    @Query("SELECT p FROM Party p WHERE p.id=?1")
    Party findByIdNotOptional(Long partyId);
}
