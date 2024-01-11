import { Component } from '@angular/core';
import { AbstractControl, FormControl, FormGroup, FormsModule, ReactiveFormsModule, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { User } from '@trivial-pursuit-client/core/src/Player';
import { AuthentificationService } from '../service/authentification.service';
import { NgIf } from '@angular/common';

@Component({
  selector: 'app-create-account',
  templateUrl: './create-account.component.html',
  styleUrl: './create-account.component.css',
  standalone: true,
  imports: [
    FormsModule, 
    RouterLink,
    NgIf,
    ReactiveFormsModule
  ]
})
export class CreateAccountComponent {

  constructor(private route: Router, private authService: AuthentificationService){}

  user: User = new User();
  msg: string = '';
  
  mdpConfirmation: string = '';
  submitted = false;

  public onSubmit(){
    console.log(this.profileForm.value.confirmPassword)
      this.submitted = true;
      this.user.password = ''+this.profileForm.value.password;
      this.user.username = ''+this.profileForm.value.username;
      console.log(this.user);
      this.authService.registrationAccountUser(this.user).subscribe(
        data=>{
          console.log(data)
          if(data){
            this.route.navigate(['/login'])
            this.user = new User()
          }else{
            this.msg="Cet utilisateur existe dejà"
          }
        })
    
  }


  static MatchValidator(source: string, target: string): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const sourceCtrl = control.get(source);
      const targetCtrl = control.get(target);

      return sourceCtrl && targetCtrl && sourceCtrl.value !== targetCtrl.value
        ? { mismatch: true }
        : null;
    };
  }

  profileForm = new FormGroup(
    {
      password: new FormControl('', [Validators.required]),
      confirmPassword: new FormControl('', [Validators.required]),
      username: new FormControl('', [Validators.required])
    },
    [CreateAccountComponent.MatchValidator('password', 'confirmPassword')]
  );

  get passwordMatchError() {
    return (
      this.profileForm.getError('mismatch') &&
      this.profileForm.get('confirmPassword')?.touched
    );
  }

  

}
