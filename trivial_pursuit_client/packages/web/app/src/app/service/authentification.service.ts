import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class AuthentificationService {

  private isAuth: boolean = false;

  constructor() { }

  login(){
    this.isAuth=true;
  }

  logout(){
    this.isAuth=false;
  }

  isAuthenticatedUser(): boolean {
    return this.isAuth;
  }
}
