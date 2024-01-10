import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthentificationService } from '../service/authentification.service';
import { FormsModule, NgModel } from '@angular/forms';
import { User } from '@trivial-pursuit-client/core/src/Player';

@Component({
  selector: 'app-reset-password',
  templateUrl: './reset-password.component.html',
  styleUrl: './reset-password.component.css',
  standalone: true,
  imports: [
    FormsModule,
  ]
})
export class ResetPasswordComponent {

  submitted = false;
  username ='';
  msg = '';
  user : User = new User();

  constructor(private router: Router, private authService: AuthentificationService){}

  onSubmit(){
    if(this.submitted){
      console.log("value are here"); 
      this.authService.resetUserPassword(this.user).subscribe(
      data=>{
        console.log("response received")
        console.log(data)
        console.log(this.user);
        this.router.navigate(['/login'])
      })
    }
  }

  researchUser(username: string){
    this.authService.getUser(username).subscribe(
      data => {
        console.log(data)
        if(data !== null){
          this.submitted = true;
          this.user.username = username;
          this.msg=''
        }
        else{
          this.msg = 'Veuillez vérifier le nom d\'utilisateur saisi cet utilisateur n\'exite pas'
        }
      }
    )
  }

}
