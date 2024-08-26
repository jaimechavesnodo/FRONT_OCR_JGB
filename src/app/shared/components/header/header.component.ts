import { Component, type OnInit } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { UserService } from '../../services/user.service';
import { NgClass } from '@angular/common';

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

  constructor(private router: Router, private userService: UserService) {
    this.getInvoices();
  }
  ngOnInit(): void { }

  logout(): void {
    localStorage.clear();
    this.router.navigate(['/login']);
  }

  getInvoices(): void {
    this.userService.getInvoices().subscribe((response: any) => {
      this.invoices = response?.count;
    });
  }

}
