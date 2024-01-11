package fr.alma.trivial_pursuit_server.websockets;

import fr.alma.trivial_pursuit_server.core.card.Card;
import fr.alma.trivial_pursuit_server.core.card.Question;
import fr.alma.trivial_pursuit_server.core.cases.Case;
import fr.alma.trivial_pursuit_server.core.game.Chat;
import fr.alma.trivial_pursuit_server.core.game.Party;
import fr.alma.trivial_pursuit_server.core.player.Player;
import fr.alma.trivial_pursuit_server.core.player.User;
import fr.alma.trivial_pursuit_server.data.service.CardService;
import fr.alma.trivial_pursuit_server.data.service.PartyService;
import fr.alma.trivial_pursuit_server.data.service.PlayerService;
import fr.alma.trivial_pursuit_server.data.service.UserService;
import fr.alma.trivial_pursuit_server.gameplay.IBoardPlay;
import fr.alma.trivial_pursuit_server.gameplay.IPartyPlay;
import fr.alma.trivial_pursuit_server.kind.IChat;
import fr.alma.trivial_pursuit_server.util.Theme;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@CrossOrigin(origins = "http://localhost:4200")
@RestController
@RequestMapping(path = "/gameplay")
@Slf4j
public class GamePlayController implements IBoardPlay, IPartyPlay {

    @Autowired
    private UserService userService;

    @Autowired
    private PlayerService playerService;

    @Autowired
    private CardService cardService;

    @Autowired
    private PartyService partyService;

    /**
     * Leave the game for a certain user
     * @param user user to leave the game
     * @return true if the user have leave the game, false otherwise
     */
    @PostMapping(path = "/leaveGame")
    public boolean leaveGameDetached(@RequestBody User user){
        log.info("leaveGame for "+user);
        return leaveGame(user.getUsername());
    }

    /**
     * @see GamePlayController#leaveGameDetached(User) leaveGameDetached
     */
    @Override
    public boolean leaveGame(String user) {
        User userFound = userService.findByUserName(user);
        if(userFound != null && userFound.getUserPlayer()!=null && userFound.getUserPlayer().getParty() != null){
            Player playerOfUser = userFound.getUserPlayer();
            Party partyFound = partyService.findById(String.valueOf(playerOfUser.getParty().getId()));
            try{
                partyFound.removePlayer(playerOfUser);
                userFound.setUserPlayer(null);
                playerOfUser.setUser(null);
                playerService.delete(playerOfUser);
                playerService.flush();
                return true;
            }catch (Exception e){
                log.warn(e.getMessage() + " occur in leaveGame");
            }
        }else{
            log.warn("userFound have no player or his party is not set");
        }
        return false;
    }

    /**
     * Move a player to a new Case
     * @param user user's player to be moved
     * @param caseName newCase for the user's player
     * @return true if the change is made, false otherwise
     */
    @PostMapping(path = "/moveToCase/{caseName}")
    public boolean moveToCaseDetached(@RequestBody User user, @PathVariable("caseName") String caseName){
        log.info("moveToCase for "+user+" with a new case : "+caseName);
        return moveToCase(user.getUsername(),caseName);
    }

    /**
     * @see GamePlayController#moveToCaseDetached(User, String) moveToCaseDetached
     */
    @Override
    public boolean moveToCase(@PathVariable("user") String user, @PathVariable("newCase") String newCase) {
        log.info("moveToCase for "+user+" with a new case : "+newCase);
        try{
            Player playerFound = userService.findByUserName(user).getUserPlayer();
            Case newCaseFound = null;
            for(Case c : playerFound.getParty().getBoard().getCases()){
                if(c.getName().equals(newCase))
                    newCaseFound = c;
            }
            if(newCaseFound != null) {
                playerFound.setActualCase(newCaseFound);
                playerService.flush();
                return true;
            }
        }catch (Exception e){
            log.warn(e.getMessage());
        }
        return false;
    }

    /**
     * Pick a question text in a card of the deck stored in party's board randomly for a certain theme
     * @param questionTheme theme of the question
     * @param partyId id of the party
     * @return the question text
     */
    @PostMapping(path = "/pickCard/{partyId}")
    public String pickCardDetached(@RequestBody Theme questionTheme, @PathVariable("partyId") String partyId){
        log.info("pickCard for party : "+partyId+" and theme : "+questionTheme);
        return pickCard(partyId, questionTheme.toString());
    }

    /**
     * @see GamePlayController#pickCardDetached(Theme, String) pickCardDetached
     */
    @Override
    public String pickCard(String partyId, String questionTheme) {
        Party partyFound = partyService.findById(partyId);
        if(partyFound != null && partyFound.getBoard() != null && !partyFound.getBoard().getCards().isEmpty()){
            Card card = partyFound.getBoard().getACard();
            partyService.flush();
            cardService.flush();
            try{
                return card.getQuestionText(Theme.valueOf(questionTheme));
            }catch(Exception e){
                log.warn(e.getMessage());
            }
        }else{
            log.warn("party is null or not started");
        }
        return "";
    }

    /**
     * Analyse the response for a certain question
     * @param cardId id of the card who have the question
     * @param theme question theme
     * @param answer answer provided
     * @return true the answer provided is correct, false otherwise
     */
    @Override
    @RequestMapping(path = "analyseResponse/{cardId}/{questionNb}/{answer}")
    public boolean analyseResponse(@PathVariable("cardId") String cardId, @PathVariable("questionNb") String theme, @PathVariable("answer") String answer) {
        log.info("analyseResponse for card : "+cardId+" with theme : "+theme+" the answer provide is : "+answer);

        Card card = cardService.findById(cardId);
        if(card != null){
            try{
                Question question = null;
                for(Question q : card.getQuestions()){
                    if(q.getTheme()==Theme.valueOf(theme)){
                        question = q;
                    }
                }
                if(question!=null){
                    return question.analyseAnswer(answer);
                }else{
                    log.warn("there is no question for the theme given");
                }
            }catch (Exception e){
                log.warn("Theme given invalid value | "+e.getMessage());
            }
        }else{
            log.warn("no card find for the cardId : "+cardId);
        }
        return false;
    }

    /**
     * Create a chat for a party and assign it
     * @param partyId id of the party
     * @return chat created
     */
    @Override
    @GetMapping(path = "createChat/{partyId}")
    @ResponseStatus(HttpStatus.CREATED)
    public IChat createChat(@PathVariable("partyId") String partyId) {
        log.info("createChat for party : "+partyId);

        Party partyFound = partyService.findById(partyId);
        if(partyFound != null){
            Chat chat = new Chat(partyFound);
            partyFound.setChat(chat);
            partyService.flush();
            return chat;
        }else{
            log.warn("party is null for partyId : "+partyId);
            return null;
        }
    }

    /**
     * Remove a party from the partyService and all it cascades association
     * @param partyId id of the party to be removed
     */
    @Override
    @GetMapping(path = "endGame/{partyId}")
    public void endGame(@PathVariable("partyId") String partyId) {
        log.info("endGame for party : "+partyId);

        Party partyFound = partyService.findById(partyId);
        if(partyFound!=null){
            for(Player p : partyFound.getPlayerList()){
                p.getUser().setUserPlayer(null);
                p.setUser(null);
                userService.flush();
            }
            partyService.delete(partyFound);
            partyService.flush();
        }
    }


//    Made for test in browser
//    You can uncomment it and check serialized card in browser
//    /**
//     * Return all the card in cardService
//     * @return all the card stored
//     */
//    @GetMapping(path = "findAllCard")
//    public List<Card> findAllCard(){
//        log.info(cardService.findAll().size()+" taille");
//        return cardService.findAll();
//    }
}
