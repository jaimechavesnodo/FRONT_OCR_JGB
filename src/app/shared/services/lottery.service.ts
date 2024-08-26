import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class LotteryService {

  constructor(private http: HttpClient) { }

  getResults(data: any) {
    return this.http.get(`${environment.apiUrl}/client/shoppingClientsByDateRange/${data.startDate}/${data.endDate}/${data.quantity}`);
  }

  downloadExcel(data: any) {
    return this.http.get(`${environment.apiUrl}/client/downloadShoppingClientsByDateRange/${data.startDate}/${data.endDate}/${data.quantity}`, {
      responseType: 'blob'
    });
  }

}