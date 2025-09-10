import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class UserService {

  constructor(private http: HttpClient) { }

  getAgentShopping(id: number) {
    return this.http.get(`${environment.apiUrl}/client/handleAgentShoppingClient/${id}`, {
    responseType: 'text' as 'json' 
    });
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

  getPendingInvoicesCount(): Observable<any> {
    return this.http.get<any>(`${environment.apiUrl}/invoices/pending-count`);
  }

  awardPrizeByInvoice(id: number) {
  return this.http.post(`${environment.apiUrl}/client/award-prize-by-invoice/${id}`, {});
}

rewardSelection(data: { clientId: number; rewardType: number }) {
  return this.http.post(`${environment.apiUrl}/client/reward-selection`, data);
}

getClientPhone(idClient: number): Observable<{ phone: string | null }> {
  return this.http.get<{ phone: string | null }>(`${environment.apiUrl}/client/phone/${idClient}`);
}

agentApproveInvoice(shoppingClientId: number): Observable<{ missingInvoices: number }> {
  return this.http.post<{ missingInvoices: number }>(
    `${environment.apiUrl}/client/agent-approve-invoice/${shoppingClientId}`, {}
  );
}

}
