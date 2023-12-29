package fr.alma.trivial_pursuit_server.data.repository;

import fr.alma.trivial_pursuit_server.core.player.Player;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface PlayerRepository extends JpaRepository<Player, Long> {
}
