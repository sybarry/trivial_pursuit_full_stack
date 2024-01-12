package fr.alma.trivial_pursuit_server.websockets;

import fr.alma.trivial_pursuit_server.core.game.BoardFactory;
import fr.alma.trivial_pursuit_server.core.game.Party;
import fr.alma.trivial_pursuit_server.core.player.Player;
import fr.alma.trivial_pursuit_server.core.player.User;
import fr.alma.trivial_pursuit_server.data.service.PartyService;
import fr.alma.trivial_pursuit_server.data.service.PlayerService;
import fr.alma.trivial_pursuit_server.data.service.UserService;
import fr.alma.trivial_pursuit_server.kind.IParty;
import fr.alma.trivial_pursuit_server.lobby.ILobby;

import java.util.ArrayList;
import java.util.Collections;

import fr.alma.trivial_pursuit_server.util.Constant;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@CrossOrigin(origins = "http://localhost:4200")
@RestController
@Slf4j
@RequestMapping(path = "/lobby")
public class LobbyController implements ILobby {

    @Autowired
    private UserService userService;

    @Autowired
    private PlayerService playerService;

    @Autowired
    private PartyService partyService;

    @Override
    public List<IParty> partyHistory(String username) {
        User userFound = userService.findByUserName(username);
        if(userFound != null){
            List<Player> userPlayers = playerService.findAllPlayerByUser(userFound);
            List<IParty> result = new ArrayList<>();

            for(Party p : partyService.findAllByPlayer(userPlayers)){
                if(p.getBoard() != null){
                    p.setBoard(null);
                }
                result.add(p);
            }
            return result;
        }
        return Collections.emptyList();
    }

    @PostMapping(path = "/history")
    public List<IParty> partyHistoryDetached(@RequestBody User user){
        log.info("game history for user : "+user);
        return partyHistory(user.getUsername());
    }

    @Override
    @RequestMapping(path = "/createGame/{gameName}/{nbPlayers}")
    @ResponseStatus(HttpStatus.CREATED)
    public IParty createGame(@PathVariable("gameName") String gameName, @PathVariable("nbPlayers") int nbPlayers) {
        log.info("createGame with gameName : "+gameName+" and nbPlayers : "+nbPlayers);

        if(nbPlayers > Constant.BOARD_AND_PARTY_PLAYER_LIST_MAX_SIZE){
            log.warn("cannot create a game of "+nbPlayers+" players");
            return null;
        }else{
            Party party = new Party(gameName, nbPlayers);
            return partyService.saveParty(party);
        }
    }

    @PostMapping(path = "/createParty")
    public Party createParty(@RequestBody Party party) {
        log.info("createGame with gameName : "+party.getName()+" and nbPlayers : "+party.getMaxCapacityPlayer());

        if(party.getMaxCapacityPlayer() > Constant.BOARD_AND_PARTY_PLAYER_LIST_MAX_SIZE){
            log.warn("cannot create a game of "+party.getMaxCapacityPlayer()+" players");
            return null;
        }else{
            Party partyToSave = new Party(party.getName(), party.getMaxCapacityPlayer());
            log.info(" Get Partys "+partyService.findAll());
            return partyService.saveParty(partyToSave);
        }
    }
    @Override
    @GetMapping(path = "/playersReady/{partyId}")
    public boolean checkPlayersReady(@PathVariable("partyId") String partyId) {
        log.info("checkPlayersReady for party : "+partyId);
        Party partyFound = partyService.findById(partyId);
        if(partyFound!=null){
            return partyFound.checkPlayersReady();
        }else{
            log.warn("partyFound is null, invalid partyId : "+partyId);
            return false;
        }
    }

    @Override
    public boolean joinGame(String user, String partyId) {
        Party party = partyService.findById(partyId);
        User userFound = userService.findByUserName(user);

        if(userFound!= null && party != null && party.playersCanJoin() && userFound.getUserPlayer() == null){
            Player playerCreated = party.buildAValidNewPlayer();
            userFound.setUserPlayer(playerCreated);

            playerCreated.setUser(userFound);
            playerService.savePlayer(playerCreated);

            partyService.flush();
            return true;
        }else{
            log.warn("party : "+partyId+" is null or no player can join or user has already a player set or userFound is null");
            return false;
        }
    }

    @PutMapping(path = "/joinGame/{id}")
    public boolean joinGameDetached(@PathVariable("id") String partyId, @RequestBody User user){
        log.info("joinGame for party : "+partyId+" and user : "+user.getUsername());
        return joinGame(user.getUsername(), partyId);
    }

    @Override
    @GetMapping(path = "/startGame/{partyId}")
    public boolean startGame(@PathVariable("partyId") String partyId) {
        log.info("startGame for party : "+partyId);
        try {
            //TODO
            //party and card are link via board who is embeddable so it doesn't work
            //must be a table where party_id and card_id are linked.
            Party party = partyService.findById(partyId);
            party.setBoard(BoardFactory.createBoard(party.getPlayerList()));
            partyService.flush();
            return true;
        }catch (Exception e){
            log.warn(e.getMessage());
            return false;
        }
    }

    @Override
    public void ready(String user) {
        User userFound = userService.findByUserName(user);
        if(userFound != null && userFound.getUserPlayer() != null){
            userFound.getUserPlayer().setReady(!userFound.getUserPlayer().getReady());
            partyService.flush();
        }else{
            log.warn("user isn't in a party");
        }
    }

    @PostMapping(path = "/ready")
    public void readyDetached(@RequestBody User user){
        log.info("ready for user : "+user);
        ready(user.getUsername());
    }

    @GetMapping(path = "/getParty/{partyId}")
    public Party partyRefresh(@PathVariable("partyId") String id){
        return partyService.findById(id);
    }



    //Made for test in browser
//    @GetMapping(path = "findAll", produces = MediaType.APPLICATION_JSON_VALUE)
//    public List<User> findAllUser(){
//        return userService.findAll();
//    }
//
    @GetMapping(path = "/partyAll")
    public List<Party> allParty() {
        for(Party p : partyService.findAll()){
            if(p.getBoard().getCards().isEmpty()){
                p.setBoard(null);
            }
        }
        return partyService.findAll();
    }
//
//    @GetMapping(path = "findAllPl", produces = MediaType.APPLICATION_JSON_VALUE)
//    public List<Player> findAllPlayer(){
//        return playerService.findAll();
//    }

}
