import { Component, type OnInit } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { UserService } from '../../services/user.service';
import { NgClass } from '@angular/common';
import { InvoiceService } from '../../services/invoice.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [
    RouterModule,
    NgClass
  ],
  templateUrl: './header.component.html',
  styleUrl: './header.component.css',
})
export class HeaderComponent implements OnInit {

  invoices = 0;
  user = JSON.parse(localStorage.getItem('user') || '');

  constructor(private router: Router, private userService: UserService, private invoiceService: InvoiceService) {
    this.getInvoices();
  }
  ngOnInit(): void { }

  logout(): void {
    localStorage.clear();
    this.router.navigate(['/login']);
  }

  getInvoices(): void {
    this.userService.getInvoices().subscribe((response: any) => {
      this.invoiceService.updateInvoiceValue(response?.count);
      this.invoiceService.invoiceValue$.subscribe((res) => {
        //console.log(res);
        this.invoices = res;
      })
    });
  }

}
