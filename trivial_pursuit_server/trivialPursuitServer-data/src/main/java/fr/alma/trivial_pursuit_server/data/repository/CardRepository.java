package fr.alma.trivial_pursuit_server.data.repository;

import fr.alma.trivial_pursuit_server.core.card.Card;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

@Repository
public interface CardRepository extends JpaRepository<Card, Long> {

    /**
     * Find a card similar to the one passed
     * @param card card to be find in repository
     * @return the card find, null if none
     */
    @Query("SELECT c FROM Card c WHERE c=?1")
    Card find(Card card);

    /**
     * Find a card by id where the return is not optional type
     * @param cardId cardId to be find in repository
     * @return the card find, null if none
     */
    @Query("SELECT c FROM Card c WHERE c.id=?1")
    Card findByIdNotOptional(long cardId);
}
