package fr.alma.trivial_pursuit_server.websockets;

import fr.alma.trivial_pursuit_server.core.game.BoardFactory;
import fr.alma.trivial_pursuit_server.core.game.Party;
import fr.alma.trivial_pursuit_server.core.player.Player;
import fr.alma.trivial_pursuit_server.core.player.User;
import fr.alma.trivial_pursuit_server.data.service.PartyService;
import fr.alma.trivial_pursuit_server.data.service.PlayerService;
import fr.alma.trivial_pursuit_server.data.service.UserService;
import fr.alma.trivial_pursuit_server.kind.IBoard;
import fr.alma.trivial_pursuit_server.kind.IParty;
import fr.alma.trivial_pursuit_server.lobby.ILobby;

import java.util.ArrayList;
import java.util.Collections;

import fr.alma.trivial_pursuit_server.util.Constant;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping(path = "/lobby")
public class LobbyController implements ILobby {

    @Autowired
    private UserService userService;

    @Autowired
    private PlayerService playerService;

    @Autowired
    private PartyService partyService;

    @Override
    public IBoard giveBoard() {
        return null;
    }

    @Override
    @GetMapping(path = "history/{username}", produces = MediaType.APPLICATION_JSON_VALUE)
    public List<IParty> partyHistory(@PathVariable("username") String username) {
        if(Boolean.TRUE.equals(userService.isInRepository(new User(username, null)))){
            User userFind = userService.findByUserName(username);
            List<Player> userPlayers = playerService.findAllPlayerByUser(userFind);
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
        if(nbPlayers > Constant.BOARD_AND_PARTY_PLAYER_LIST_MAX_SIZE){
            return null;
        }else{
            Party party = new Party(gameName, nbPlayers);
            return partyService.saveParty(party);
        }
    }

    @Override
    @GetMapping(path = "playersReady/{partyId}")
    public boolean checkPlayersReady(@PathVariable("partyId") String partyId) {
        return partyService.findById(partyId).checkPlayersReady();
    }

    @Override
    @RequestMapping(path = "joinGame/{username}/{partyId}")
    public boolean joinGame(@PathVariable("username") String user, @PathVariable("partyId") String partyId) {
        Party party = partyService.findById(partyId);
        User userFind = userService.findByUserName(user);

        if(party.playersCanJoin() && userFind.getUserPlayer() == null){
            Player playerCreated = party.buildAValidNewPlayer();
            userFind.setUserPlayer(playerCreated);

            playerCreated.setUser(userFind);
            playerService.savePlayer(playerCreated);

            partyService.flush();
            return true;
        }
        return false;
    }

    @Override
    @GetMapping(path = "startGame/{partyId}")
    public boolean startGame(@PathVariable("partyId") String partyId) {
        try {
            //TODO dont work cause of foreign key no parent
            Party party = partyService.findById(partyId);
            party.setBoard(BoardFactory.createBoard(party.getPlayerList()));
            partyService.flush();
            return true;
        }catch (Exception e){
            System.out.println(e.getMessage());
            return false;
        }
    }

    @Override
    @GetMapping(path = "ready/{username}")
    public void ready(@PathVariable("username") String user) {
        User userFind = userService.findByUserName(user);
        if(userFind.getUserPlayer() != null){
            userFind.getUserPlayer().setReady(!userFind.getUserPlayer().getReady());
            partyService.flush();
        }
    }

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
