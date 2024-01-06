import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthentificationService } from '../service/authentification.service';
import { Player } from '../../../player';


@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrl: './login.component.css',
  standalone: true,
  imports: [
    FormsModule
  ]
})
export class LoginComponent {
  
  constructor(private router: Router, private authService: AuthentificationService){}

  player = new Player("mohamed@gmail.com", "test");

  submitted = false;

  onSubmit() { 
    this.submitted = true;
    console.log("value are here"); 
  }
  
  newPlayer(){
    this.player = new Player('','');
  }

  connectPlayer(mail: string, password: string){
    console.log(mail, ' ', password);
    if(mail ==='mohamed@gmail.com' && password === 'test'){
      sessionStorage.setItem('mail', 'mohamed@gmail.com');
      this.authService.login();
      this.router.navigate(['/home']);
    }
  }
}
