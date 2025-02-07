package fr.alma.trivial_pursuit_server.data.repository;

import fr.alma.trivial_pursuit_server.core.game.Chat;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

@Repository
public interface ChatRepository extends JpaRepository<Chat, Long> {

    /**
     * Find a chat similar to the one passed
     * @param chat chat to be find in repository
     * @return the chat find, null if none
     */
    @Query("SELECT c FROM Chat c WHERE c=?1")
    Chat find(Chat chat);
}
