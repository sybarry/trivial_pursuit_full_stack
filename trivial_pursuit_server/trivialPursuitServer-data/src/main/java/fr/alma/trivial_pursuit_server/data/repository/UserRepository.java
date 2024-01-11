package fr.alma.trivial_pursuit_server.data.repository;

import fr.alma.trivial_pursuit_server.core.player.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

public interface UserRepository extends JpaRepository<User, Long> {

    /**
     * Find a user similar to the one passed
     * @param user user to be find in repository
     * @return the user find, null if none
     */
    @Query("SELECT u FROM User u WHERE u=?1")
    User find(User user);

    /**
     * Find a user by his username
     * @param username username to be find in repository
     * @return the user find, null if none
     */
    @Query("SELECT u FROM User u WHERE u.username=?1")
    User findByUserName(String username);
}
