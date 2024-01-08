package fr.alma.trivial_pursuit_server.data.repository;

import fr.alma.trivial_pursuit_server.core.game.Party;
import fr.alma.trivial_pursuit_server.core.player.Player;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PartyRepository extends JpaRepository<Party, Long> {
    @Query("SELECT p FROM Party p WHERE p=?1")
    Party find(Party party);

    @Query("SELECT p FROM Party p WHERE ?1 member of p.playerList")
    List<Party> findAllByPlayer(Player player);

    @Query("SELECT p FROM Party p WHERE p.id=?1")
    Party findByIdNotOptional(Long partyId);
}
