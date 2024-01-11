package fr.alma.trivial_pursuit_server.data.service;

import fr.alma.trivial_pursuit_server.core.player.User;
import fr.alma.trivial_pursuit_server.data.repository.UserRepository;
import fr.alma.trivial_pursuit_server.data.service.impl.UserServiceImpl;
import fr.alma.trivial_pursuit_server.util.Constant;
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
    private User userHash;

    @BeforeEach
    void setUp() {
        this.userRepository = mock(UserRepository.class);
        this.userService = new UserServiceImpl(userRepository);

        user = new User("username",  "password");
        userHash = new User("username",  Constant.getSHA512SecurePassword("password"));
    }
    @Test
    @DisplayName("test add and check")
    void testAddAndCheck() {
        //CONFIG
        User user2 = new User("username2", "password2");
        User user2Hash = new User("username2", Constant.getSHA512SecurePassword("password2"));
        User userSameUsernameNotPassword = new User("username2", Constant.getSHA512SecurePassword("password5"));
        user2.setId(888L);
        userSameUsernameNotPassword.setId(775L);

        when(userRepository.save(user)).thenReturn(user);
        when(userRepository.findAll()).thenReturn(Collections.singletonList(user));
        when(userRepository.findByUserName(user.getUsername())).thenReturn(null);
        when(userRepository.findByUserName(user2.getUsername())).thenReturn(user2Hash);

        //ACTION
        Boolean resultNotExist = userService.isInRepository(user);
        User resultSave = userService.saveUser(user);
        Boolean resultExist = userService.isInRepository(user2);
        Boolean notSamePasswordSoFalse = userService.isInRepository(userSameUsernameNotPassword);

        //VERIFY
        verify(userRepository, atLeastOnce()).save(user);
        Assertions.assertEquals(user, resultSave);
        Assertions.assertTrue(resultExist);
        Assertions.assertFalse(resultNotExist);
        Assertions.assertFalse(notSamePasswordSoFalse);
    }

    @Test
    @DisplayName("test add but already added and check")
    void testAddAlreadyAddedAndCheck() {
        //CONFIG
        User user2 = new User("username2", "password2");
        user2.setId(888L);

        when(userRepository.save(user)).thenReturn(null);
        when(userRepository.findByUserName(user.getUsername())).thenReturn(userHash);
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
        when(userRepository.findByUserName(user.getUsername())).thenReturn(userHash);
        when(userRepository.findAll()).thenReturn(Collections.singletonList(user));

        //ACTION
        Boolean result = userService.resetPassword(user.getUsername());
        Boolean resultFalse = userService.resetPassword("cc");

        //VERIFY
        verify(userRepository, atLeastOnce()).findByUserName(user.getUsername());
        Assertions.assertTrue(result);
        Assertions.assertFalse(resultFalse);
        Assertions.assertNull(userHash.getPassword());
        Assertions.assertNull(userRepository.findByUserName(user.getUsername()).getPassword());

        //ACTION
        resultFalse = userService.changePassword(user.getUsername(), "newPassword");
        result = userService.changePassword("userNotInBase", "password");
        user.setPassword("newPassword");

        //VERIFY
        Assertions.assertTrue(resultFalse);
        Assertions.assertFalse(result);
        Assertions.assertEquals(Constant.getSHA512SecurePassword("newPassword"), userHash.getPassword());
        Assertions.assertTrue(userService.isInRepository(user));
        Assertions.assertFalse(userService.isInRepository(new User("user","password")));
        Assertions.assertEquals(Constant.getSHA512SecurePassword("newPassword"), userRepository.findByUserName(user.getUsername()).getPassword());

    }
}
