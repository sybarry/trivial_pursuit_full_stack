import { CUSTOM_ELEMENTS_SCHEMA, Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthentificationService } from '../service/authentification.service';
import { User } from '@trivial-pursuit-client/core/src/User';


@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrl: './login.component.css',
  standalone: true,
  imports: [
    FormsModule,
    RouterLink
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


  onSubmit() {
    this.submitted = true;
    this.authService.loginUserFromServe(this.user).subscribe(
      data=>{
        if(data){
          console.log("response received")
          this.authService.login();
          let username = this.user.username;
          console.log(username);
          sessionStorage.setItem('user', ''+username);
          this.router.navigate(['/home'])
        }else{
          this.msg = "Bad credential"
        }
      })
  }
}
