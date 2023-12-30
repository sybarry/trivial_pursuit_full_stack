package fr.alma.trivial_pursuit_server.data.repository;


import fr.alma.trivial_pursuit_server.core.card.Card;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CardRepository extends JpaRepository<Card, Long> {

//    useless but just for a test and keep it for future methode adding
    @Query("SELECT c FROM Card c")
    List<Card> findAllCard();

    @Query("SELECT c FROM Card c WHERE c=?1")
    Card find(Card card);
}
