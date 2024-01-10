import { Component } from '@angular/core';
import { AuthentificationService } from './service/authentification.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'Bienvenu au jeu en ligne Trivial Pursuit';
  name = sessionStorage.getItem('user');

  constructor(private authService: AuthentificationService){}

  isAuthenticated(): boolean {
    return this.authService.isAuthenticatedUser();
  }

  logout() {
    sessionStorage.removeItem;
    this.authService.logout();
  }

}
