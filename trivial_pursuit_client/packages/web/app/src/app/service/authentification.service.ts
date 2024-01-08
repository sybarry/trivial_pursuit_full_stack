import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { User } from '@trivial-pursuit-client/core/src/Player';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class AuthentificationService {

  baseUrl = 'http://localhost:8081';

  private isAuth: boolean = false;

  constructor(private _http: HttpClient) { }

  login(){
    this.isAuth=true;
  }

  logout(){
    this.isAuth=false;
  }

  isAuthenticatedUser(): boolean {
    return this.isAuth;
  }

  loginFromServer(player: User): Observable<any>{
    return this._http.post<any>(this.baseUrl, player);
  }

  loginUserFromServe(user: User): Observable<any>{
    return this._http.post<any>(this.baseUrl+'/api/login', user);
  }

  registrationAccount(player: User): Observable<any>{
    return this._http.post<any>(this.baseUrl, player);
  }

  registrationAccountUser(user: User): Observable<any>{
    return this._http.post<any>(this.baseUrl+'/api/createAccount', user);
  }

}
