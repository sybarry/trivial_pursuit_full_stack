import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Party } from '@trivial-pursuit-client/core/src/Party';
import { User } from '@trivial-pursuit-client/core/src/User';

@Injectable({
  providedIn: 'root'
})
export class LobbyService {

  baseUrl = 'http://localhost:8081';

  constructor(private _http: HttpClient) { }

  getAllParty(): Observable<any>{
    return this._http.get<any>(this.baseUrl+'/lobby/partyAll');
  }

  saveParty(party: Party): Observable<any>{
    return this._http.post<any>(this.baseUrl+'/lobby/createParty', party);
  }

  joinParty(id: number, user: User): Observable<any>{
    return this._http.put<any>(this.baseUrl+'/lobby/joinGame/'+id, user)
  }

  leaveParty(user: User): Observable<any>{
    return this._http.post<any>(this.baseUrl+'/gameplay/leaveGame', user)
  }

}
