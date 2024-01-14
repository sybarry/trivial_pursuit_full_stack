import { HttpClient, HttpHandler, HttpXhrBackend } from '@angular/common/http';
import {AuthentificationService} from './service/authentification.service';
import {describe, expect, test} from '@jest/globals';


const httpClient = new HttpClient(new HttpXhrBackend({ 
    build: () => new XMLHttpRequest() 
}));
const authen = new AuthentificationService(httpClient);

test('initial value', () => {
    expect(authen.baseUrl).toBe('http://localhost:8081');
    expect(authen.isAuth).toBeFalsy;
});

test('login', () => {
    authen.login();
    expect(authen.isAuth).toBeTruthy;
});

test('logout', () => {
    authen.logout();
    expect(authen.isAuth).toBeFalsy;
});
