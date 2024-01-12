import { Component, OnInit } from '@angular/core';
import { LobbyService } from '../service/lobby.service';
import { Party } from '../classFile';
import { AbstractControl, FormControl, FormGroup, FormsModule, ReactiveFormsModule, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { NgFor, NgIf } from '@angular/common';
import { RouterLink } from '@angular/router';
// import { Party } from '@trivial-pursuit-client/core/src/Player';

@Component({
  selector: 'app-party',
  templateUrl: './party.component.html',
  styleUrl: './party.component.css',
  standalone: true,
  imports: [
    FormsModule, NgFor, NgIf, ReactiveFormsModule, RouterLink
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
        this.ngOnInit();
        console.log(data);
        this.party = new Party();
      }
    )
  }

  partyForm = new FormGroup(
    {
      gamename: new FormControl('', [Validators.required]),
      maxCapacity: new FormControl('', [Validators.required, Validators.max(6), Validators.min(2)])
    },
  );

  


}
