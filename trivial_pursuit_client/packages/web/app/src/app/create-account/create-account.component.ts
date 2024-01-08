import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { User } from '@trivial-pursuit-client/core/src/Player';

@Component({
  selector: 'app-create-account',
  templateUrl: './create-account.component.html',
  styleUrl: './create-account.component.css',
  standalone: true,
  imports: [
    FormsModule
  ]
})
export class CreateAccountComponent {

  user: User = new User()

  public onSubmit(){
    
  }

}
