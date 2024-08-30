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

  getInvoices() {
    return this.http.get(`${environment.apiUrl}/client/shoppingClients/invoiceRead/count`);
  }

  updatePoints(data: any) {
    return this.http.put(`${environment.apiUrl}/client/pointsUpdate`, data);
  }

  rejectInvoice(data: any) {
    return this.http.post(`${environment.apiUrl}/client/rejectionInvoice`, data);
  }

}
