import { Component, OnInit } from '@angular/core';
import { Party } from '@trivial-pursuit-client/core/src/Party';
import { ActivatedRoute,Router } from '@angular/router';
import { AuthentificationService } from '../service/authentification.service';
import { User } from '@trivial-pursuit-client/core/src/User';
import { LobbyService } from '../service/lobby.service';

@Component({
  selector: 'app-join-game',
  templateUrl: './join-game.component.html',
  styleUrl: './join-game.component.css'
})
export class JoinGameComponent implements OnInit {
 party: Party = new Party();

 user: User = new User();

 constructor(private _route: ActivatedRoute, private router: Router, private lobbyServ: LobbyService){}
  
 
 ngOnInit(): void {
    this.joinParty();
  }


 joinParty(){
  let username = ''+sessionStorage.getItem('user');
  this.user.username = username;
  const id = Number(this._route.snapshot.paramMap.get('id'));
  console.log('user in joinParty ',this.user);
  this.lobbyServ.joinParty(id, this.user).subscribe(
    data => console.log(data)
  )
 }

 leaveGame(){
  this.lobbyServ.leaveParty(this.user).subscribe(
    data => {
      console.log(data)
      this.router.navigate(['/party']);
    }
  )

 }

}

