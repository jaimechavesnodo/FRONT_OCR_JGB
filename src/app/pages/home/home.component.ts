import { Component, type OnInit } from '@angular/core';
import { HeaderComponent } from '../../shared/components/header/header.component';
import { PinchZoomModule } from '@meddv/ngx-pinch-zoom';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { UserService } from '../../shared/services/user.service';
import { CurrencyPipe, DatePipe, formatDate } from '@angular/common';
import { AlertsService } from '../../shared/services/alerts.service';
import { NgSelectModule } from '@ng-select/ng-select';
import { EstablishmentService } from '../../shared/services/establishment.service';
import { InvoiceService } from '../../shared/services/invoice.service';
import { CommonModule } from '@angular/common';
import { FormArray } from '@angular/forms';
import { AbstractControl } from '@angular/forms';


@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    HeaderComponent,
    PinchZoomModule,
    CurrencyPipe,
    NgSelectModule,
    DatePipe
  ],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css',
})
export class HomeComponent implements OnInit {

  form!: FormGroup;
  user = JSON.parse(localStorage.getItem('user') || '');
  rejectOptions!: string;
  establishments: any[] = [];
  loading = {
    reject: false,
    approve: false
  };
  currentClientData: any;

  constructor(
    private userService: UserService,
    private alertsService: AlertsService,
    private establishmentService: EstablishmentService,
    private invoiceService: InvoiceService
  ) { }
  ngOnInit(): void {
    this.loadForm();
    this.get();
  }

get() {
  this.establishmentService.get().subscribe((response: any) => {
    this.establishments = response;
    this.getAgentShopping(); // 👈 Ahora se llama aquí, cuando ya hay data
  });
}

  // Limpiar el formulario y los datos actuales
  clean() {
    this.currentClientData = null;
    this.form.reset();
  }

loadForm(): void {
  this.form = new FormGroup({
    nit: new FormControl('', Validators.required),
    name: new FormControl('', Validators.required),
    date: new FormControl('', Validators.required),
    products: new FormArray([new FormControl('', Validators.required)]),
    value: new FormControl('', Validators.required),
    invoiceNumber: new FormControl('', Validators.required),
  });
}

getAgentShopping() {
  this.userService.getAgentShopping(this.user?.id).subscribe((response: any) => {
    const parsedResponse = typeof response === 'string' ? JSON.parse(response) : response;
    //console.log('📦 Respuesta de getAgentShopping:', parsedResponse);
    this.currentClientData = parsedResponse;

    const nitLimpio = this.clearNit(parsedResponse?.nit);

    const cleanName = (name: string) => name?.replace(/\n/g, ' ').replace(/\s+/g, ' ').trim().toLowerCase();

    let comercio = this.establishments.find((est: any) => est.nit === nitLimpio);

    if (!comercio) {
      comercio = this.establishments.find((est: any) =>
        cleanName(est.nameStore) === cleanName(parsedResponse?.commerce)
      );
    }

    const nombreComercio = comercio?.nameStore || parsedResponse?.commerce;
    //console.log('🧩 Comercio final asignado:', nombreComercio);

    const productsArray = new FormArray([
      new FormControl('', Validators.required)
    ]);

    this.form = new FormGroup({
      nit: new FormControl(parsedResponse?.nit, Validators.required),
      name: new FormControl(nombreComercio, Validators.required), // 👈 Aquí aseguramos coincidencia con ng-option
      date: new FormControl(this.parseDate(parsedResponse?.dateInvoice), Validators.required),
      products: productsArray,
      value: new FormControl(parsedResponse?.price, Validators.required),
      invoiceNumber: new FormControl(parsedResponse?.invoiceNumber, Validators.required),
    });

    this.onNitInput(parsedResponse?.nit);
  });
}

  setNameStore(nit: string) {
    const commerce = this.establishments.filter((establishment: any) => establishment.nit === nit) || [];
    if (commerce.length > 0) {
      this.form.get('name')?.setValue(commerce[0].nameStore);
    }
  }

  clearNit(nit: string) {
    const response = nit.split('-')[0].replace(/\./g, '');
    return response
  }

  parseDate(dateString: string): string {
    const parts = dateString.split('/');
    if (parts.length === 3) {
      const [day, month, year] = parts;
      return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
    }
    return dateString;
  }

  updateData(type: 'approve' | 'reject' | 'nextOne') {
    const payload = this.prepareData(type);
    //console.log('🔍 Payload enviado a backend:', payload);
    //console.log('ID del cliente real:', this.currentClientData.idClient);

    this.userService.updateAgentShopping(this.prepareData(type), this.currentClientData.id).subscribe({
      next: (response: any) => {
        //console.log(response);
        const closeBtnModal = document.getElementById(type + 'Close');
        closeBtnModal?.click();
        if (type === 'approve') {
          this.userService.updatePoints({ idClient: this.currentClientData.idClient, purchaseValue: this.value?.value }).subscribe((response: any) => {
            //console.log(response);
          })
        }

        if (type === 'reject') {
          this.userService.rejectInvoice({ idClient: this.currentClientData.idClient, rejectionMessage: this.rejectOptions }).subscribe((response: any) => {
            //console.log(response);
          })
        }
        this.getInvoices();
        this.alertsService.success('Éxito', this.generateMessage(type));
        this.getAgentShopping();
        this.clean();
      },
      error: (err) => {
        this.alertsService.error('Error', 'No se ha podido actualizar la factura, intentelo de nuevo.');
      }
    });
  }

  getInvoices(): void {
    this.userService.getInvoices().subscribe((response: any) => {
      this.invoiceService.updateInvoiceValue(response?.count);
    });
  }

  generateMessage(type: 'approve' | 'reject' | 'nextOne'): string {
    const messages = {
      'approve': 'Se ha aprobado la factura con exito.',
      'reject': 'Se ha rechazado la factura con exito.',
      'nextOne': 'Se ha saltado la factura con exito.'
    }
    return messages[type];
  }

  prepareData(type: 'approve' | 'reject' | 'nextOne'): any {
    
    const datas = {
      'approve': {
  "idClient": this.currentClientData?.idClient,
  "price": this.value?.value,
  "nit": this.nit?.value,
  "invoiceUrl": this.currentClientData?.invoiceUrl,
  "typeProduct": this.products.value.join(', '),
  "invoiceNumber": this.invoiceNumber?.value,
  "dateInvoice": this.currentClientData?.dateInvoice,
  "invoiceRead": 1,
  "idAgent": this.user?.id,
  "statusInvoice": 1,
  "commerce": this.name?.value
      },
      'reject': {
        'idAgent': this.user?.id,
        'statusInvoice': 1,
        'reasonReject': this.rejectOptions,
        'invoiceRead': 1
      },
      'nextOne': {
        'idAgent': null,
        'date': this.getLastWeek()
      }
    }
    return datas[type];
  }

  get products() {
    return this.form.get('products') as FormArray;
  }

  asFormControl(ctrl: AbstractControl): FormControl {
    return ctrl as FormControl;
  }


  getLastWeek() {
    const date = new Date();
    date.setDate(date.getDate() - 7);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day} ${date.getHours()}:${date.getMinutes()}:${date.getSeconds()}`;
  }

  get nit() { return this.form.get('nit'); }
  get name() { return this.form.get('name'); }
  get date() { return this.form.get('date'); }
  get product() { return this.form.get('product'); }
  get value() { return this.form.get('value'); }
  get invoiceNumber() { return this.form.get('invoiceNumber'); }

  rotationAngle = 0;
  rotateImage() {
  this.rotationAngle = (this.rotationAngle + 90) % 360; // rota 90° en cada clic
}

filteredNits: any[] = [];
showSuggestions = false;

onNitInput(value: string) {
  this.filteredNits = this.establishments.filter(est =>
    est.nit.toLowerCase().includes(value.toLowerCase())
  );
  this.showSuggestions = true;
  if (this.filteredNits.length === 1 && this.filteredNits[0].nit === value) {
    this.setNameStore(value);
  }
}

selectNit(nit: string) {
  this.form.get('nit')?.setValue(nit);
  this.setNameStore(nit);
  this.showSuggestions = false;
}

hideSuggestionsWithDelay() {
  setTimeout(() => {
    this.showSuggestions = false;
  }, 200);
}
handleNitInput(event: Event) {
  const inputElement = event.target as HTMLInputElement;
  const value = inputElement?.value || '';
  this.onNitInput(value);
}

addProduct() {
  this.products.push(new FormControl('', Validators.required));
}

removeProduct(index: number) {
  if (this.products.length > 1) {
    this.products.removeAt(index);
  }
}

getSelectedProducts(): string {
  return this.products.controls.map(p => p.value).join(', ');
}


}