import { CommonModule } from '@angular/common';
import { Component, type OnInit } from '@angular/core';
import { HeaderComponent } from '../../shared/components/header/header.component';
import { FormGroup, FormControl, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { LotteryService } from '../../shared/services/lottery.service';

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
  resultsArray1: any[] = [];
  resultsArray2: any[] = [];
  totalResults: number = 0;

  constructor(private lotteryService: LotteryService) { }

  ngOnInit(): void {
    this.loadForm();
  }

  loadForm(): void {
    this.form = new FormGroup({
      startDate: new FormControl('', Validators.required),
      endDate: new FormControl('', Validators.required),
      name: new FormControl('', Validators.required),
      quantity: new FormControl('', Validators.required),
    });
  }

  results() {
    this.lotteryService.getResults(this.form.value).subscribe((response: any) => {
      console.log(response);
      // Dividir la respuesta en dos arrays con la misma cantidad de resultados
      this.totalResults = response.totalCount;
      const halfLength = Math.ceil(this.totalResults / 2);
      
      this.resultsArray1 = response.data.slice(0, halfLength);
      this.resultsArray2 = response.data.slice(halfLength);

      console.log('Primera mitad:', this.resultsArray1);
      console.log('Segunda mitad:', this.resultsArray2);
    })
  }

  get startDate() { return this.form.get('startDate'); }
  get endDate() { return this.form.get('endDate'); }
  get name() { return this.form.get('name'); }
  get quantity() { return this.form.get('quantity'); }

}
