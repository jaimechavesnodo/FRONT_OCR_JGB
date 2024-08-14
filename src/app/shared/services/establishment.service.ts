import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class EstablishmentService {

  constructor(private http: HttpClient) { }

  get() {
    return this.http.get(`${environment.apiUrl}/store`);
  }
  create(data: any) {
    return this.http.post(`${environment.apiUrl}/store`, data);
  }
  delete(id: string) {
    return this.http.delete(`${environment.apiUrl}/store/${id}`);
  }

}
