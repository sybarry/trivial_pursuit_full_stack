import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Party } from '../classFile';

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

}
