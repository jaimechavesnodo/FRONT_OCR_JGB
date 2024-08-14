import { Component, type OnInit } from '@angular/core';
import { HeaderComponent } from '../../shared/components/header/header.component';
import { PinchZoomModule } from '@meddv/ngx-pinch-zoom';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { UserService } from '../../shared/services/user.service';
import { CurrencyPipe } from '@angular/common';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    FormsModule,
    ReactiveFormsModule,
    HeaderComponent,
    PinchZoomModule,
    CurrencyPipe
  ],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css',
})
export class HomeComponent implements OnInit {

  form!: FormGroup;
  user = JSON.parse(localStorage.getItem('user') || '');
  rejectOptions!: string;
  loading = {
    reject: false,
    approve: false
  };
  currentClientData: any;

  constructor(private userService: UserService) { }
  ngOnInit(): void {
    this.loadForm();
    this.getAgentShopping()
  }

  loadForm(): void {
    this.form = new FormGroup({
      nit: new FormControl('', Validators.required),
      name: new FormControl('', Validators.required),
      date: new FormControl('', Validators.required),
      product: new FormControl('', Validators.required),
      value: new FormControl('', Validators.required),
    });
  }

  getAgentShopping() {
    this.userService.getAgentShopping(this.user?.id).subscribe((response: any) => {
      console.log(response);
      this.currentClientData = response;
      this.form = new FormGroup({
        nit: new FormControl(response?.nit, Validators.required),
        name: new FormControl(response?.commerce, Validators.required),
        date: new FormControl(response?.dateInvoice, Validators.required),
        product: new FormControl(response?.typeProduct, Validators.required),
        value: new FormControl(response?.price, Validators.required),
      });
    })
  }

  updateData(type: 'approve' | 'reject' | 'nextOne') {
    console.log(this.prepareData(type));
    this.userService.updateAgentShopping(this.prepareData(type), this.currentClientData.id).subscribe((response: any) => {
      console.log(response);
      this.getAgentShopping();
    });
  }


prepareData(type: 'approve' | 'reject' | 'nextOne'): any {
  const datas = {
    'approve': {
      "idClient": this.currentClientData?.id,
      "price": this.value?.value,
      "nit": this.nit?.value,
      "invoiceUrl": this.currentClientData?.invoiceUrl,
      "typeProduct": this.product?.value,
      "invoiceNumber": this.currentClientData?.invoiceNumber,
      "dateInvoice": this.currentClientData?.dateInvoice,
      "invoiceRead": 1,
      "idAgent": this.user?.id,
      "statusInvoice": 1,
      "commerce": this.name?.value
    },
    'reject': {
      'idAgent': this.user?.id,
      'statusInvoice': 2
    },
    'nextOne': {
      'idAgent': null,
      'date': this.getLastWeek()
    }
  }
  return datas[type];
}

  getLastWeek() {
    const date = new Date();
          date.setDate(date.getDate() - 7);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  get nit() { return this.form.get('nit'); }
  get name() { return this.form.get('name'); }
  get date() { return this.form.get('date'); }
  get product() { return this.form.get('product'); }
  get value() { return this.form.get('value'); }

}
