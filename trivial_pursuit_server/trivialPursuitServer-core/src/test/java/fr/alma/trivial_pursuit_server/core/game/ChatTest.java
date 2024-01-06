package fr.alma.trivial_pursuit_server.core.game;

import org.junit.jupiter.api.Assertions;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.util.ArrayList;
import java.util.List;

class ChatTest {

    private Chat chat;

    @BeforeEach
    void setUp(){
        chat = new Chat();
    }

    @Test
    @DisplayName("test chat default constructor")
    void testDefaultConstructor(){
        //CONFIG
        //ACTION
        //VERIFY
        Assertions.assertNull(chat.getParty());
        Assertions.assertTrue(chat.getMessages().isEmpty());
        Assertions.assertNull(chat.getId());
    }

    @Test
    @DisplayName("test chat constructor with only Party parameter")
    void testConstructorPartyParameter(){
        //CONFIG
        Party party = new Party();
        chat = new Chat(party);

        //ACTION
        //VERIFY
        Assertions.assertEquals(party, chat.getParty());
        Assertions.assertTrue(chat.getMessages().isEmpty());
        Assertions.assertNull(chat.getId());
    }

    @Test
    @DisplayName("test setter on all chat field")
    void testSetter(){
        //CONFIG
        Party party = new Party();
        List<String> messages = new ArrayList<>();
        messages.add("bonjour");

        //ACTION
        chat.setId(1L);
        chat.setParty(party);
        chat.setMessages(messages);

        //VERIFY
        Assertions.assertEquals(party, chat.getParty());
        Assertions.assertEquals(messages, chat.getMessages());
        Assertions.assertEquals(1L, chat.getId());
        Assertions.assertTrue(chat.getMessages().contains("bonjour"));
    }

    @Test
    @DisplayName("test add message on chat")
    void testAddMessageOnChat(){
        //CONFIG
        //ACTION
        boolean result = chat.addMsg("coucou");

        //VERIFY
        Assertions.assertTrue(chat.getMessages().contains("coucou"));
        Assertions.assertTrue(result);
    }

    @Test
    @DisplayName("test remove message on chat")
    void testRemoveMessageOnChat(){
        //CONFIG
        //ACTION
        boolean resultAdd = chat.addMsg("coucou");
        boolean resultRemove = chat.removeMsg("coucou");

        //VERIFY
        Assertions.assertFalse(chat.getMessages().contains("coucou"));
        Assertions.assertTrue(resultAdd);
        Assertions.assertTrue(resultRemove);
    }

    @Test
    @DisplayName("test remove incorrect message on chat")
    void testRemoveIncorrectMessageOnChat(){
        //CONFIG
        //ACTION
        boolean resultAdd = chat.addMsg("coucou");
        boolean resultRemove = chat.removeMsg("cc");
        boolean resultRemoveNull = chat.removeMsg(null);

        //VERIFY
        Assertions.assertTrue(chat.getMessages().contains("coucou"));
        Assertions.assertTrue(resultAdd);
        Assertions.assertFalse(resultRemove);
        Assertions.assertFalse(resultRemoveNull);
    }
}
