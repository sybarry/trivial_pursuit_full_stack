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
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.*;

import java.util.List;

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

//    @Override
//    public IBoard giveBoard() {
//        return null;
//    }

    @Override
    @GetMapping(path = "history/{username}", produces = MediaType.APPLICATION_JSON_VALUE)
    public List<IParty> partyHistory(@PathVariable("username") String username) {
        log.info("game history for user : "+username);

        if(Boolean.TRUE.equals(userService.isInRepository(new User(username, null)))){
            User userFound = userService.findByUserName(username);
            List<Player> userPlayers = playerService.findAllPlayerByUser(userFound);
            List<IParty> result = new ArrayList<>();

            for(Party p : partyService.findAllByPlayer(userPlayers)){
                if(p.getBoard().getCards().isEmpty()){
                    p.setBoard(null);
                }
                result.add(p);
            }
            return result;
        }
        return Collections.emptyList();
    }

    @Override
    @RequestMapping(path = "createGame/{gameName}/{nbPlayers}")
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

    @Override
    @GetMapping(path = "playersReady/{partyId}")
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
    @RequestMapping(path = "joinGame/{username}/{partyId}")
    public boolean joinGame(@PathVariable("username") String user, @PathVariable("partyId") String partyId) {
        log.info("joinGame for party : "+partyId+" and user : "+user);

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

    @Override
    @GetMapping(path = "startGame/{partyId}")
    public boolean startGame(@PathVariable("partyId") String partyId) {
        log.info("startGame for party : "+partyId);

        try {
            //TODO dont work cause of foreign key no parent
            //party and card are link via board who is embeddable so it doesn't work
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
    @GetMapping(path = "ready/{username}")
    public void ready(@PathVariable("username") String user) {
        log.info("ready for user : "+user);

        User userFound = userService.findByUserName(user);
        if(userFound.getUserPlayer() != null){
            userFound.getUserPlayer().setReady(!userFound.getUserPlayer().getReady());
            partyService.flush();
        }
    }




    //Made for test in browser
    @GetMapping(path = "findAll", produces = MediaType.APPLICATION_JSON_VALUE)
    public List<User> findAllUser(){
        return userService.findAll();
    }

    @GetMapping(path = "partyAll")
    public List<Party> allParty() {
        for(Party p : partyService.findAll()){
            if(p.getBoard().getCards().isEmpty()){
                p.setBoard(null);
            }
        }
        return partyService.findAll();
    }

    @GetMapping(path = "findAllPl", produces = MediaType.APPLICATION_JSON_VALUE)
    public List<Player> findAllPlayer(){
        return playerService.findAll();
    }

}