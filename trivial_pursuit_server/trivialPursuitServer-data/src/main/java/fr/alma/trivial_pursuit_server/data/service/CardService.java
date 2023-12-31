package fr.alma.trivial_pursuit_server.data.service;

import fr.alma.trivial_pursuit_server.core.card.Card;

import java.util.List;

public interface CardService {
    Boolean isInRepository(Card card);

    Card saveCard(Card card);

    List<Card> findAll();
}
