import { CommonModule } from '@angular/common';
import { Component, type OnInit } from '@angular/core';
import { HeaderComponent } from '../../shared/components/header/header.component';
import { FormGroup, FormControl, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-lottery',
  standalone: true,
  imports: [
    HeaderComponent,
    FormsModule,
    ReactiveFormsModule
  ],
  templateUrl: './lottery.component.html',
  styleUrl: './lottery.component.css',
})
export class LotteryComponent implements OnInit {
  form!: FormGroup;

  ngOnInit(): void {
    this.loadForm();
  }

  loadForm(): void {
    this.form = new FormGroup({
      startDate: new FormControl('', Validators.required),
      endDate: new FormControl('', Validators.required),
      name: new FormControl('', Validators.required),
      queantity: new FormControl('', Validators.required),
    });
  }

  get startDate() { return this.form.get('startDate'); }
  get endDate() { return this.form.get('endDate'); }
  get name() { return this.form.get('name'); }
  get queantity() { return this.form.get('queantity'); }

}
