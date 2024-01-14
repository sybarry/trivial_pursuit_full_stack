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

    private CardRepository cardRepository;


    /**
     * Constructor of a CardServiceImpl.
     * Initialize the service repository by providing card in the file card.json.
     * @param cardRepository cardRepository field
     */
    @Autowired
    public CardServiceImpl(CardRepository cardRepository){
        this.cardRepository = cardRepository;
        try{
            for(Card c : BoardFactory.getCardsFromJson("trivialPursuitServer-core/src/main/java/fr/alma/trivial_pursuit_server/util/cards.json")){
                cardRepository.save(c);
            }
        }catch (Exception e){
            log.warn(e.getMessage());
        }
    }


    /**
     * Check if a card is in the repository
     * @param card card to be checked
     * @return true if in, false otherwise
     */
    @Override
    public Boolean isInRepository(Card card) {
        return cardRepository.existsById(card.getId());
    }

    /**
     * Store a card in the repository
     * @param card card to be stored
     * @return the card stored
     */
    @Override
    public Card saveCard(Card card){
        if(Boolean.TRUE.equals(isInRepository(card))){
            return null;
        }
        return cardRepository.save(card);
    }

    /**
     * Retrieve all the card in the repository
     * @return A list composed of the cards of the repository
     */
    @Override
    public List<Card> findAll() {
        return cardRepository.findAll();
    }

    /**
     * Flush the repository
     */
    @Override
    public void flush() {
        cardRepository.flush();
    }

    /**
     * Find a card by his id
     * @param cardId cardId to be found
     * @return The card found
     */
    @Override
    public Card findById(String cardId) {
        return cardRepository.findByIdNotOptional(Long.parseLong(cardId));
    }
}
