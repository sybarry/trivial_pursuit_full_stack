package fr.alma.trivial_pursuit_server.data.service.impl;

import fr.alma.trivial_pursuit_server.core.game.Party;
import fr.alma.trivial_pursuit_server.core.player.Player;
import fr.alma.trivial_pursuit_server.data.repository.PartyRepository;
import fr.alma.trivial_pursuit_server.data.service.PartyService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

@Service
public class PartyServiceImpl implements PartyService {
    @Autowired
    private PartyRepository partyRepository;

    /**
     * Constructor of a PartyServiceImpl
     * @param partyRepository partyRepository field
     */
    public PartyServiceImpl(PartyRepository partyRepository){
        this.partyRepository = partyRepository;
        partyRepository.save(new Party("game1",5));
    }

    /**
     * Check if a party is in the repository
     * @param party party to be checked
     * @return true if in, false otherwise
     */
    @Override
    public Boolean isInRepository(Party party) {
        Party partyFind = partyRepository.findByIdNotOptional(party.getId());
        return partyFind != null;
    }

    /**
     * Store a party in the repository
     * @param party party to be stored
     * @return the party stored
     */
    @Override
    public Party saveParty(Party party) {
        return partyRepository.save(party);
    }

    /**
     * Retrieve all the party in the repository
     * @return A list composed of the party of the repository
     */
    @Override
    public List<Party> findAll() {
        return partyRepository.findAll();
    }

    @Override
    public List<Party> findAllByPlayer(List<Player> playerList) {
        List<Party> partyList = new ArrayList<>();
        for(Player p : playerList){
            List<Party> partiesFind = partyRepository.findAllByPlayer(p);
            partyList.addAll(partiesFind);
        }
        return partyList;
    }

    /**
     * Find a party by his id
     * @param partyId partyID to be found
     * @return The party found
     */
    @Override
    public Party findById(String partyId) {
        return partyRepository.findByIdNotOptional(Long.parseLong(partyId));
    }

    /**
     * Flush the repository
     */
    @Override
    public void flush(){
        partyRepository.flush();
    }

    /**
     * Remove a party from the repository
     * @param party party to be removed
     */
    @Override
    public void delete(Party party){
        partyRepository.delete(party);
    }
}
