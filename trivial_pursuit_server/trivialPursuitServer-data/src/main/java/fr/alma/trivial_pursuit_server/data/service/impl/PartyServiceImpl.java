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

    public PartyServiceImpl(PartyRepository partyRepository){
        this.partyRepository = partyRepository;
        partyRepository.save(new Party("game1",5));
    }

    @Override
    public Boolean isInRepository(Party party) {
        Party partyFind = partyRepository.findByIdNotOptional(party.getId());
        return partyFind != null;
    }

    @Override
    public Party saveParty(Party party) {
        return partyRepository.save(party);
    }

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

    @Override
    public Party findById(String partyId) {
        return partyRepository.findByIdNotOptional(Long.parseLong(partyId));
    }

    @Override
    public void flush(){
        partyRepository.flush();
    }

    @Override
    public void delete(Party party){
        partyRepository.delete(party);
    }
}
