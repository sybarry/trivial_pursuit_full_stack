import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Party } from '../classFile';
import { User } from '@trivial-pursuit-client/core/src/Player';

@Injectable({
  providedIn: 'root'
})
export class LobbyService {

  baseUrl = 'http://localhost:8081/lobby';

  constructor(private _http: HttpClient) { }

  getAllParty(): Observable<any>{
    return this._http.get<any>(this.baseUrl+'/partyAll');
  }

  saveParty(party: Party): Observable<any>{
    return this._http.post<any>(this.baseUrl+'/createParty', party);
  }

  joinParty(id: number, user: User): Observable<any>{
    return this._http.put<any>(this.baseUrl+'/joinGame/'+id, user)
  }

}
