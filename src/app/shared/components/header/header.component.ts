import { Component, type OnInit } from '@angular/core';
import { Router, RouterModule } from '@angular/router';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [
    RouterModule,
  ],
  templateUrl: './header.component.html',
  styleUrl: './header.component.css',
})
export class HeaderComponent implements OnInit {

  user = JSON.parse(localStorage.getItem('user') || '');

  constructor(private router: Router) {}
  ngOnInit(): void { }

  logout(): void {
    localStorage.clear();
    this.router.navigate(['/login']);
  }

}
