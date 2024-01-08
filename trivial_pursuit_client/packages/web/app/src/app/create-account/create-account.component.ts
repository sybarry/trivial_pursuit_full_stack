import { Component } from '@angular/core';
import { AbstractControl, FormControl, FormGroup, FormsModule, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { User } from '@trivial-pursuit-client/core/src/Player';
import { AuthentificationService } from '../service/authentification.service';

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

  constructor(private route: Router, private authService: AuthentificationService){}

  user: User = new User();
  msg: string = '';

  submitted = false;

  public onSubmit(){
    this.submitted = true;
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
