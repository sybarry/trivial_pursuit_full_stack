import { Component, OnInit } from '@angular/core';
import { LobbyService } from '../service/lobby.service';
import { Party } from '../classFile';
import { FormsModule } from '@angular/forms';
import { NgFor } from '@angular/common';
// import { Party } from '@trivial-pursuit-client/core/src/Player';

@Component({
  selector: 'app-party',
  templateUrl: './party.component.html',
  styleUrl: './party.component.css',
  standalone: true,
  imports: [
    FormsModule, NgFor
  ]
})
export class PartyComponent implements OnInit {

  constructor(private lobbyService: LobbyService){}
  
  party: Party = new Party();
  
  listParty: Party[] = [];

  submitted = false;

  ngOnInit(): void {
    this.lobbyService.getAllParty().subscribe(
      data => {
        console.log(data)
        this.listParty = data;
      }
    )
  }

  onSubmit() {
    this.submitted = true;
    console.log(this.party);
    this.lobbyService.saveParty(this.party).subscribe(
      data=>{
        this.listParty=data
        console.log(data);
      }
    )
  }


}
