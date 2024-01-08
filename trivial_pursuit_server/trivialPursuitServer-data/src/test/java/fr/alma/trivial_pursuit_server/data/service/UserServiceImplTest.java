package fr.alma.trivial_pursuit_server.data.service;

import fr.alma.trivial_pursuit_server.core.player.User;
import fr.alma.trivial_pursuit_server.data.repository.UserRepository;
import fr.alma.trivial_pursuit_server.data.service.impl.UserServiceImpl;
import org.junit.jupiter.api.Assertions;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.util.Collections;
import java.util.List;

import static org.mockito.Mockito.*;

class UserServiceImplTest {
    private UserRepository userRepository;
    private UserServiceImpl userService;

    private User user;

    @BeforeEach
    void setUp() {
        this.userRepository = mock(UserRepository.class);
        this.userService = new UserServiceImpl(userRepository);

        user = new User("username", "password");
    }
    @Test
    @DisplayName("test add and check")
    void testAddAndCheck() {
        //CONFIG
        User user2 = new User("username2", "password2");
        user2.setId(888L);

        when(userRepository.save(user)).thenReturn(user);
        when(userRepository.findAll()).thenReturn(Collections.singletonList(user));
        when(userRepository.findByUserName(user.getUsername())).thenReturn(null);
        when(userRepository.findByUserName(user2.getUsername())).thenReturn(user2);

        //ACTION
        Boolean resultNotExist = userService.isInRepository(user);
        User resultSave = userService.saveUser(user);
        Boolean resultExist = userService.isInRepository(user2);

        //VERIFY
        verify(userRepository, atLeastOnce()).save(user);
        Assertions.assertEquals(user, resultSave);
        Assertions.assertTrue(resultExist);
        Assertions.assertFalse(resultNotExist);
    }

    @Test
    @DisplayName("test add but already added and check")
    void testAddAlreadyAddedAndCheck() {
        //CONFIG
        User user2 = new User("username2", "password2");
        user2.setId(888L);

        when(userRepository.save(user)).thenReturn(null);
        when(userRepository.findByUserName(user.getUsername())).thenReturn(user);
        when(userRepository.findByUserName(user2.getUsername())).thenReturn(null);

        //ACTION
        Boolean resultExistAlready = userService.isInRepository(user);
        User resultSave = userService.saveUser(user);
        Boolean resultNotExist = userService.isInRepository(user2);

        //VERIFY
        verify(userRepository, never()).save(user);
        Assertions.assertNull(resultSave);
        Assertions.assertTrue(resultExistAlready);
        Assertions.assertFalse(resultNotExist);
    }

    @Test
    @DisplayName("test find all")
    void testFindAll(){
        //CONFIG
        when(userRepository.findAll()).thenReturn(Collections.singletonList(user));

        //ACTION
        List<User> result = userService.findAll();

        //VERIFY
        verify(userRepository, atLeastOnce()).findAll();
        Assertions.assertEquals(Collections.singletonList(user), result);
    }

    @Test
    @DisplayName("test reset and change password")
    void testResetAndChangePassword(){
        //CONFIG
        when(userRepository.findByUserName(user.getUsername())).thenReturn(user);
        when(userRepository.findAll()).thenReturn(Collections.singletonList(user));

        //ACTION
        Boolean result = userService.resetPassword(user.getUsername());
        Boolean resultFalse = userService.resetPassword("cc");

        //VERIFY
        verify(userRepository, atLeastOnce()).findByUserName(user.getUsername());
        Assertions.assertTrue(result);
        Assertions.assertFalse(resultFalse);
        Assertions.assertNull(user.getPassword());
        Assertions.assertNull(userRepository.findByUserName(user.getUsername()).getPassword());

        //ACTION
        resultFalse = userService.changePassword(user.getUsername(), "newPassword");
        result = userService.changePassword("userNotInBase", "password");

        //VERIFY
        Assertions.assertTrue(resultFalse);
        Assertions.assertFalse(result);
        Assertions.assertEquals("newPassword", user.getPassword());
        Assertions.assertTrue(userService.isInRepository(user));
        Assertions.assertFalse(userService.isInRepository(new User("user","password")));
        Assertions.assertEquals("newPassword", userRepository.findByUserName(user.getUsername()).getPassword());

    }
}
