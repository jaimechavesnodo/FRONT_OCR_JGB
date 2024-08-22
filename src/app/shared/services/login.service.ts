import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { of } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class LoginService {

  constructor(private http: HttpClient) { }

  login(data: { username: string; password: string}) {
    return this.http.post(`${environment.apiUrl}/agent/login`, { email: data.username, password: data.password });
  }

  forgotPassword(email: string) {
    return this.http.post(`${environment.apiUrl}/agent/resetPassword`, { email });
  }

}
