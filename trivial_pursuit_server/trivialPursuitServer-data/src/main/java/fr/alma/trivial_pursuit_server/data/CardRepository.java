package fr.alma.trivial_pursuit_server.data;


import fr.alma.trivial_pursuit_server.core.card.Card;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface CardRepository extends JpaRepository<Card, Long> {
}
