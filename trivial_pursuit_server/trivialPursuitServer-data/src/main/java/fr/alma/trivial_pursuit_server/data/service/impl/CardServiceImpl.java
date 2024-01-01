package fr.alma.trivial_pursuit_server.data.service.impl;

import fr.alma.trivial_pursuit_server.core.card.Card;
import fr.alma.trivial_pursuit_server.data.repository.CardRepository;
import fr.alma.trivial_pursuit_server.data.service.CardService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class CardServiceImpl implements CardService {
    @Autowired
    private CardRepository cardRepository;


    public CardServiceImpl(CardRepository cardRepository){
        this.cardRepository = cardRepository;
    }


    @Override
    public Boolean isInRepository(Card card) {
        return cardRepository.existsById(card.getId());
    }

    @Override
    public Card saveCard(Card card){
        return cardRepository.save(card);
    }

    @Override
    public List<Card> findAll() {
        return cardRepository.findAll();
    }
}
