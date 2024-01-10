import { CUSTOM_ELEMENTS_SCHEMA, Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthentificationService } from '../service/authentification.service';
// import { Player, User } from '../../../player';
import { CoreFacade } from '@trivial-pursuit-client/core';
import { Player, User } from '@trivial-pursuit-client/core/src/Player';


@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrl: './login.component.css',
  standalone: true,
  imports: [
    FormsModule,
  ],
  schemas: [
    CUSTOM_ELEMENTS_SCHEMA
  ], 
})
export class LoginComponent {
  
  constructor(private router: Router, private authService: AuthentificationService){}


  submitted = false;

  user: User = new User();

  msg = '';
  
  loginUserFromServe(){
    this.authService.loginUserFromServe(this.user).subscribe(
      data=>{
        console.log("response received")
        this.router.navigate(['/home'])
      },
      error=>{
        console.log(error)
      }
    )
  }


  onSubmit() { 
    this.submitted = true;
    console.log("value are here"); 
    this.authService.loginUserFromServe(this.user).subscribe(
      data=>{
        console.log(data)
        if(data){
          console.log("response received")
          console.log(data)
          this.authService.login();
          console.log(this.user);
          let name = ''+this.user.username;
          sessionStorage.clear();
          sessionStorage.setItem('user', name);
          console.log(sessionStorage.getItem('user'));
          this.router.navigate(['/home'])
        }else{
          this.msg = "Bad credential"
        }
        
      })
  }

  redirectToCreate() {
    this.router.navigate(['/create']);
  }

  redirectToResetPass() {
    this.router.navigate(['/resetPassword']);
  }

}
