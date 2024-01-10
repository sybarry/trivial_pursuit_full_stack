import { Component } from '@angular/core';
import { AuthentificationService } from './service/authentification.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'Bienvenu au jeu en ligne Trivial Pursuit';
  name = '';

  constructor(private authService: AuthentificationService){}

  isAuthenticated(): boolean {
    this.name = sessionStorage.getItem('user')+"";
    return this.authService.isAuthenticatedUser();
  }

  logout() {
    this.authService.logout();
  }

}
