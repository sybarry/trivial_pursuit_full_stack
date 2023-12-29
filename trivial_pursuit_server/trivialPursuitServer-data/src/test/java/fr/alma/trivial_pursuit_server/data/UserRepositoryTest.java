package fr.alma.trivial_pursuit_server.data;

import fr.alma.trivial_pursuit_server.core.User;
import fr.alma.trivial_pursuit_server.data.configuration.DataTestConfiguration;
import jakarta.annotation.Resource;
import jakarta.transaction.Transactional;
import org.junit.jupiter.api.Assertions;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.springframework.test.context.ContextConfiguration;
import org.springframework.test.context.junit.jupiter.SpringExtension;
import org.springframework.test.context.support.AnnotationConfigContextLoader;

import java.util.Optional;

@ExtendWith(SpringExtension.class)
@ContextConfiguration(
        classes = {DataTestConfiguration.class},
        loader = AnnotationConfigContextLoader.class)
@Transactional
class UserRepositoryTest {

    @Resource
    private UserRepository userRepository;

    @Test
    @DisplayName("test add")
    void testInsertUser(){
        //CONFIG
        User u = new User();
        u.setName("bonjour");
        u.setPassword("toi");

        //ACTION
        userRepository.save(u);

        //VERIFY
        Assertions.assertTrue(userRepository.findAll().contains(u));
        Assertions.assertEquals("bonjour", userRepository.findAll().get(0).getName());
        Assertions.assertEquals("toi", userRepository.findAll().get(0).getPassword());
        Assertions.assertEquals(1,userRepository.count());

        Optional<User> user = userRepository.findAll()
                .stream()
                .filter(us-> us.getPassword().equals("toi") && us.getName().equals("bonjour"))
                .findFirst();

        Assertions.assertTrue(user.isPresent());
    }

    @Test
    @DisplayName("test delete")
    void testDeleteUser(){
        //CONFIG
        User u = new User();
        u.setName("bonjour");
        u.setPassword("toi");

        //ACTION
        userRepository.save(u);
        userRepository.delete(u);

        //VERIFY
        Assertions.assertFalse(userRepository.findAll().contains(u));
        Assertions.assertEquals(0,userRepository.count());
    }

    @Test
    @DisplayName("verify that the user save is the same as before")
    void testInsertUserInDB(){
        //CONFIG
        User user1 = new User();
        user1.setName("user");
//        useless
//        user1.setId(2L);
        user1.setPassword("pass");

        //ACTION
        userRepository.save(user1);
        userRepository.flush();

        //VERIFY
        Optional<User> opt = userRepository.findById(user1.getId());
        Assertions.assertTrue(opt.isPresent());
//        cannnot check equality because it's the database who instantiate the id parameter
//        Assertions.assertNotEquals(2,opt.get().getId());
        User userSave = userRepository.getReferenceById(user1.getId());
        Assertions.assertEquals(user1.getId(), userSave.getId());
        Assertions.assertEquals(user1.getName(), userSave.getName());
        Assertions.assertEquals(user1.getPassword(), userSave.getPassword());
    }
}

