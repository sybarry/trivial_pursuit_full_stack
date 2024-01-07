package fr.alma.trivial_pursuit_server.websockets;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
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
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.*;

import java.util.List;

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

    @Override
    @GetMapping(path = "leaveGame/{username}")
    public boolean leaveGame(@PathVariable("username") String user) {
        log.info("leaveGame for "+user);

        User userFound = userService.findByUserName(user);
        if(userFound.getUserPlayer()!=null && userFound.getUserPlayer().getParty() != null){
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

    //Front handling
//    @Override
//    public boolean onlyOnePlayerIsPlaying() {
//        return false;
//    }
//
//    @Override
//    public ArrayList<String> rollDiceAndGiveCaseToMove() {
//        return null;
//    }

    @Override
    @RequestMapping(path = "moveToCase/{user}/{newCase}")
    public boolean moveToCase(@PathVariable("user") String user, @PathVariable("newCase") String newCase) {
        log.info("moveToCase for "+user+" with a new case : "+newCase);
        ObjectMapper objectMapper = new ObjectMapper();
        try{
            Case newCaseDeserialize = objectMapper.readValue(newCase, new TypeReference<>(){});
            Player playerFound = userService.findByUserName(user).getUserPlayer();
            playerFound.setActualCase(newCaseDeserialize);
            playerService.flush();
        }catch (Exception e){
            log.warn(e.getMessage());
        }
        return false;
    }

    @Override
    @RequestMapping(path = "pickCard/{partyId}/{questionTheme}")
    public String pickCard(@PathVariable("partyId") String partyId,@PathVariable("questionTheme") String questionTheme) {
        log.info("pickCard for party : "+partyId+" and theme : "+questionTheme);

        Party partyFound = partyService.findById(partyId);
        if(partyFound != null && !partyFound.getBoard().getCards().isEmpty()){
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
        return null;
    }

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


    //Made for test in browser
    @GetMapping(path = "findAllCard", produces = MediaType.APPLICATION_JSON_VALUE)
    public List<Card> findAllCard(){
        log.info(cardService.findAll().size()+" taille");
        return cardService.findAll();
    }
}