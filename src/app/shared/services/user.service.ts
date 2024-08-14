import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class UserService {

  constructor(private http: HttpClient) { }

  getAgentShopping(id: string) {
    return this.http.get(`${environment.apiUrl}/client/handleAgentShoppingClient/${id}`);
  }

  updateAgentShopping(data: any, id: string) {
    return this.http.put(`${environment.apiUrl}/client/shoppingClient/${id}`, data);
  }

}
