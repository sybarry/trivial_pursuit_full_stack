package fr.alma.trivial_pursuit_server.data.service.impl;

import fr.alma.trivial_pursuit_server.core.card.Card;
import fr.alma.trivial_pursuit_server.core.game.BoardFactory;
import fr.alma.trivial_pursuit_server.data.repository.CardRepository;
import fr.alma.trivial_pursuit_server.data.service.CardService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@Slf4j
public class CardServiceImpl implements CardService {
    @Autowired
    private CardRepository cardRepository;


    public CardServiceImpl(CardRepository cardRepository){
        this.cardRepository = cardRepository;
        try{
            for(Card c : BoardFactory.getCardsFromJson()){
                cardRepository.save(c);
            }
        }catch (Exception e){
            log.warn(e.getMessage());
        }
    }


    @Override
    public Boolean isInRepository(Card card) {
        return cardRepository.existsById(card.getId());
    }

    @Override
    public Card saveCard(Card card){
        if(Boolean.TRUE.equals(isInRepository(card))){
            return null;
        }
        return cardRepository.save(card);
    }

    @Override
    public List<Card> findAll() {
        return cardRepository.findAll();
    }

    @Override
    public void flush() {
        cardRepository.flush();
    }

    @Override
    public Card findById(String cardId) {
        return cardRepository.findByIdNotOptional(Long.parseLong(cardId));
    }
}
