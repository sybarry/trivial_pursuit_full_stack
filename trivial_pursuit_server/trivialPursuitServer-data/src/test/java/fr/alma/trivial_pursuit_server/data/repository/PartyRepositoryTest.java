package fr.alma.trivial_pursuit_server.data.repository;

import fr.alma.trivial_pursuit_server.core.cases.SimpleCase;
import fr.alma.trivial_pursuit_server.core.game.Chat;
import fr.alma.trivial_pursuit_server.core.game.Party;
import fr.alma.trivial_pursuit_server.core.player.Player;
import fr.alma.trivial_pursuit_server.data.configuration.DataTestConfiguration;
import fr.alma.trivial_pursuit_server.exception.CaseException;
import fr.alma.trivial_pursuit_server.util.Color;
import fr.alma.trivial_pursuit_server.util.Theme;
import jakarta.annotation.Resource;
import jakarta.transaction.Transactional;
import org.junit.jupiter.api.Assertions;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.springframework.test.context.ContextConfiguration;
import org.springframework.test.context.junit.jupiter.SpringExtension;
import org.springframework.test.context.support.AnnotationConfigContextLoader;

import java.util.Arrays;
import java.util.Optional;

@ExtendWith(SpringExtension.class)
@ContextConfiguration(
        classes = {DataTestConfiguration.class},
        loader = AnnotationConfigContextLoader.class)
@Transactional
class PartyRepositoryTest {
    @Resource
    private PartyRepository partyRepository;

    private Party party;
    private Player player1;
    private Player player2;

    @BeforeEach
    void setUp() throws CaseException {
        party = new Party();

        SimpleCase simpleCase = new SimpleCase("case1", Color.BLUE, Theme.GEOGRAPHY);
        simpleCase.setNeighbors(Arrays.asList("case2","case3"));
        player1 = new Player(Color.GREEN, simpleCase, null);
        player2 = new Player(Color.GREEN, simpleCase, null);

        party.addPlayer(player1);
        party.addPlayer(player2);
    }
    @Test
    @DisplayName("test add")
    void testInsertParty() {
        //CONFIG

        //ACTION
        partyRepository.save(party);

        //VERIFY
        Assertions.assertTrue(partyRepository.existsById(party.getId()));
        Assertions.assertTrue(partyRepository.find(party).getPlayerList().contains(player1));
        Assertions.assertTrue(partyRepository.findById(party.getId()).get().getPlayerList().contains(player2));
        Assertions.assertEquals(1, partyRepository.findAll().size());
        Assertions.assertEquals(1,partyRepository.count());


        Optional<Party> partyy = partyRepository.findAll()
                .stream()
                .filter(pty-> pty.getPlayerList().contains(player1))
                .findFirst();

        Assertions.assertTrue(partyy.isPresent());
    }

    @Test
    @DisplayName("test add party with chat")
    void testInsertWithChat() {
        //CONFIG
        Chat chat = new Chat(party);
        party.setChat(chat);

        //ACTION
        partyRepository.save(party);

        //VERIFY
        Assertions.assertTrue(partyRepository.existsById(party.getId()));
        Assertions.assertEquals(chat, partyRepository.find(party).getChat());
    }
}
