package fr.alma.trivial_pursuit_server.websockets;

import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;



@RestController
@RequestMapping(path = "/player")
public class PlayerController {

//    @Autowired
//    private PlayerService playerService;

    @GetMapping(path = "save/{player}", produces = MediaType.APPLICATION_JSON_VALUE)
    public String savePlayer(@PathVariable("player") String player){
        return "bonjour";
    }

    @GetMapping(path = "findAll", produces = MediaType.APPLICATION_JSON_VALUE)
    public String findAllPlayer(){
        return "toi";
    }
}
