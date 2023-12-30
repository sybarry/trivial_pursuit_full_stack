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
class ChatRepositoryTest {

    @Resource
    private ChatRepository chatRepository;

    private Party party;

    @BeforeEach
    void setUp() throws CaseException {
        party = new Party();
        SimpleCase simpleCase = new SimpleCase("case1", Color.BLUE, Theme.GEOGRAPHY);
        simpleCase.setNeighbors(Arrays.asList("case2","case3"));
        Player player = new Player(Color.GREEN, simpleCase, null);
        Player player2 = new Player(Color.GREEN, simpleCase, null);
        party.addPlayer(player);
        party.addPlayer(player2);
    }

    @Test
    @DisplayName("test add")
    void testInsertChat() {
        //CONFIG
        Chat chat = new Chat();
        chat.addMsg("cc");

        chat.setParty(party);

        //ACTION
        chatRepository.save(chat);

        //VERIFY
        Assertions.assertTrue(chatRepository.existsById(chat.getId()));
        Assertions.assertTrue(chatRepository.find(chat).getMessages().contains("cc"));
        Assertions.assertEquals(party, chatRepository.find(chat).getParty());
        Assertions.assertEquals(1, chatRepository.findAll().size());
        Assertions.assertEquals(1,chatRepository.count());


        Optional<Chat> chatt = chatRepository.findAll()
                .stream()
                .filter(cht-> cht.getMessages().contains("cc"))
                .findFirst();

        Assertions.assertTrue(chatt.isPresent());
    }
}
