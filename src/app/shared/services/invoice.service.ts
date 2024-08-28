import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class InvoiceService {
  private invoiceValueSource = new BehaviorSubject<number>(0);
  invoiceValue$ = this.invoiceValueSource.asObservable();

  constructor() { }

  updateInvoiceValue(value: number) {
    this.invoiceValueSource.next(value);
  }

  getInvoiceValue() {
    return this.invoiceValue$;
  }
}
