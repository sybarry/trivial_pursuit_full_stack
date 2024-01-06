package fr.alma.trivial_pursuit_server.data.service;

import fr.alma.trivial_pursuit_server.core.game.Party;
import fr.alma.trivial_pursuit_server.data.repository.PartyRepository;
import fr.alma.trivial_pursuit_server.data.service.impl.PartyServiceImpl;
import org.junit.jupiter.api.Assertions;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.util.Collections;
import java.util.List;

import static org.mockito.Mockito.*;
import static org.mockito.Mockito.atLeastOnce;

class PartyServiceImplTest {

    private PartyRepository partyRepository;
    private PartyServiceImpl partyService;

    private Party party;

    @BeforeEach
    void setUp(){
        this.partyRepository = mock(PartyRepository.class);
        this.partyService = new PartyServiceImpl(partyRepository);

        party = new Party("party", 4);
    }

    @Test
    @DisplayName("test add and check")
    void testAddAndCheck() {
        //CONFIG
        Party party2 = new Party("party2", 4);
        party2.setId(888L);

        when(partyRepository.save(party)).thenReturn(party);
        when(partyRepository.findByIdNotOptional(party.getId())).thenReturn(null);
        when(partyRepository.findByIdNotOptional(party2.getId())).thenReturn(party2);

        //ACTION
        Boolean resultNotExist = partyService.isInRepository(party);
        Party resultSave = partyService.saveParty(party);
        Boolean resultExist = partyService.isInRepository(party2);

        //VERIFY
        verify(partyRepository, atLeastOnce()).save(party);
        Assertions.assertEquals(party, resultSave);
        Assertions.assertTrue(resultExist);
        Assertions.assertFalse(resultNotExist);
    }

    @Test
    @DisplayName("test find all")
    void testFindAll(){
        //CONFIG
        when(partyRepository.findAll()).thenReturn(Collections.singletonList(party));

        //ACTION
        List<Party> result = partyService.findAll();

        //VERIFY
        verify(partyRepository, atLeastOnce()).findAll();
        Assertions.assertEquals(Collections.singletonList(party), result);
    }
}
