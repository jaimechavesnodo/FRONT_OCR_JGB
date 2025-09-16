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
  clientPhone: string | null = null;
  invoiceCheckResult: string = '';



  constructor(
    private userService: UserService,
    private alertsService: AlertsService,
    private establishmentService: EstablishmentService,
    private invoiceService: InvoiceService
  ) { }
  ngOnInit(): void {
    this.loadForm();
    this.get();
    this.loadPendingInvoicesCount();
  }

get() {
  this.establishmentService.get().subscribe((response: any) => {
    this.establishments = response;
    this.getAgentShopping(); 
  });
}
  // Variables con las dimensiones originales de la imagen
  imageWidth = 500;  // ancho original en px, cambia según tu imagen
  imageHeight = 500; // alto original en px, cambia según tu imagen
  zoomLevel = 1;     // zoom inicial

// En el contenedor, en lugar de min-width y min-height, usa [style.min-width.px] y [style.min-height.px]:
  rotationAngle = 0;

  translateX = 0;
  translateY = 0;

  isDragging = false;
  startX = 0;
  startY = 0;
  

  startDrag(event: MouseEvent) {
    this.isDragging = true;
    this.startX = event.clientX - this.translateX;
    this.startY = event.clientY - this.translateY;
  }

  onDrag(event: MouseEvent) {
    if (!this.isDragging) return;
    this.translateX = event.clientX - this.startX;
    this.translateY = event.clientY - this.startY;
  }

  endDrag() {
    this.isDragging = false;
  }

naturalWidth = 0;
naturalHeight = 0;

onImageLoad(event: Event) {
  const img = event.target as HTMLImageElement;
  this.naturalWidth = img.naturalWidth;
  this.naturalHeight = img.naturalHeight;
  this.zoomLevel = 1; // Reset zoom on new image load
}

zoomIn() {
  this.zoomLevel = Math.min(this.zoomLevel + 0.2, 3);
}

zoomOut() {
  this.zoomLevel = Math.max(this.zoomLevel - 0.2, 0.2);
}

rotateLeft() {
  this.rotationAngle -= 90;
}

rotateRight() {
  this.rotationAngle += 90;
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
    products: new FormArray([
      new FormGroup({
        product: new FormControl('', Validators.required),
        price: new FormControl(0, Validators.required),
        quantity: new FormControl(1, Validators.required),
      })
    ]),
    value: new FormControl(0, Validators.required),
    invoiceNumber: new FormControl('', Validators.required),
  });

  // Suscribirse a cambios en cada producto para recalcular
  this.subscribeToProductChanges();

  this.calculateTotal();
}

subscribeToProductChanges() {
  this.products.controls.forEach((group: AbstractControl) => {
    group.get('price')?.valueChanges.subscribe(() => this.calculateTotal());
    group.get('quantity')?.valueChanges.subscribe(() => this.calculateTotal());
  });
}

total: number = 0;

calculateTotal() {
  this.total = this.products.controls.reduce((acc, group: AbstractControl) => {
    const price = group.get('price')?.value || 0;
    const quantity = group.get('quantity')?.value || 1;
    return acc + (price * quantity);
  }, 0);

  this.form.get('value')?.setValue(this.total, { emitEvent: false });
}

loadPendingInvoicesCount() {
  this.userService.getPendingInvoicesCount().subscribe({
    next: (res) => {
      this.pendingInvoicesCount = res?.count ?? 0;
    },
    error: () => {
      this.pendingInvoicesCount = 0;
    }
  });
}

getAgentShopping() {
this.userService.getAgentShopping(this.user?.id).subscribe((response: any) => {
  const parsedResponse = typeof response === 'string' ? JSON.parse(response) : response;
  //console.log('📦 Respuesta de getAgentShopping:', parsedResponse);
  this.currentClientData = parsedResponse;

  if (parsedResponse?.idClient) {
  this.userService.getClientPhone(parsedResponse.idClient).subscribe({
    next: (res) => {
      this.clientPhone = res.phone;
      //console.log('📞 Teléfono del cliente:', this.clientPhone);
    },
    error: (err) => {
      console.error('Error al obtener teléfono del cliente', err);
      this.clientPhone = null;
    }
  });
} else {
  this.clientPhone = null;
}

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

    const productsArray = new FormArray(
  (parsedResponse.products || []).map((p: any) => new FormGroup({
    product: new FormControl(p.product || '', Validators.required),
    price: new FormControl(p.price || 0, Validators.required),
    quantity: new FormControl(p.quantity || 1, Validators.required),
  }))
);
if (productsArray.length === 0) {
  productsArray.push(new FormGroup({
    product: new FormControl('', Validators.required),
    price: new FormControl(0, Validators.required),
    quantity: new FormControl(1, Validators.required),
  }));
}


this.form = new FormGroup({
  nit: new FormControl(parsedResponse?.nit, Validators.required),
  name: new FormControl(nombreComercio, Validators.required),
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
  if (!this.currentClientData || !this.currentClientData.id) {
    this.alertsService.error('Error', 'No hay una factura cargada para procesar.');
    return;
  }

  const payload = this.prepareData(type);
  const shoppingClientId = this.currentClientData.id;

  this.userService.updateAgentShopping(payload, shoppingClientId).subscribe({
    next: () => {
      const closeBtnModal = document.getElementById(type + 'Close');
      closeBtnModal?.click();

if (type === 'approve') {
  const shoppingClientId = this.currentClientData.id;

  this.userService.agentApproveInvoice(shoppingClientId).subscribe({
    next: (response) => {
      const closeBtnModal = document.getElementById(type + 'Close');
      closeBtnModal?.click();

      const missing = response?.missingInvoices ?? 0;

      if (missing === 0) {
        this.alertsService.success(
          '¡Factura Aprobada!',
          '¡Listo! Ya puedes escribir PREMIO para reclamar tu recompensa.'
        );
      } else {
        this.alertsService.success(
          'Factura Aprobada',
          `Te faltan ${missing} factura${missing > 1 ? 's' : ''} para poder reclamar el premio.`
        );
      }

      this.finalizeInvoiceProcess(type);
    },
    error: () => {
      this.alertsService.error('Error', 'No se ha podido aprobar la factura, inténtalo de nuevo.');
    }
  });
}



      if (type === 'reject') {
        this.userService.rejectInvoice({
          idClient: this.currentClientData.idClient,
          rejectionMessage: this.rejectOptions
        }).subscribe(() => {
          this.alertsService.success('Éxito', this.generateMessage(type));
          this.finalizeInvoiceProcess(type);
        });
      }

      if (type === 'nextOne') {
        this.alertsService.success('Éxito', this.generateMessage(type));
        this.finalizeInvoiceProcess(type);
      }
    },
    error: () => {
      this.alertsService.error('Error', 'No se ha podido actualizar la factura, inténtelo de nuevo.');
    }
  });
}

finalizeInvoiceProcess(type: 'approve' | 'reject' | 'nextOne') {
  this.getInvoices();
  this.getAgentShopping();
  this.clean();
  this.loadPendingInvoicesCount();
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

  pendingInvoicesCount: number | null = null;

  prepareData(type: 'approve' | 'reject' | 'nextOne'): any {
    
    const datas = {
      'approve': {
    "idClient": this.currentClientData?.idClient,
    "price": this.value?.value,
    "nit": this.nit?.value,
    "invoiceUrl": this.currentClientData?.invoiceUrl,
    "invoiceNumber": this.invoiceNumber?.value,
    "dateInvoice": this.currentClientData?.dateInvoice,
    "invoiceRead": 1,
    "idAgent": this.user?.id,
    "statusInvoice": 1,
    "commerce": this.name?.value,
    "products": this.products.value.map((p: any) => ({
      "name": p.product,
      "price": p.price,
      "quantity": p.quantity
    }))
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

  get products(): FormArray {
    return this.form.get('products') as FormArray;
  }


asFormControl(ctrl: AbstractControl | null): FormControl {
  if (!ctrl) throw new Error('Expected FormControl, got null');
  return ctrl as FormControl;
}

getProductControl(index: number): FormControl {
  return this.products.at(index).get('product') as FormControl;
}

getQuantityControl(index: number): FormControl {
  return this.products.at(index).get('quantity') as FormControl;
}

getPriceControl(index: number): FormControl {
  return this.products.at(index).get('price') as FormControl;
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
  get invoiceNumber(): FormControl {
  return this.form.get('invoiceNumber') as FormControl;
}


  // rotationAngle = 0;
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
  const newProduct = new FormGroup({
    product: new FormControl('', Validators.required),
    price: new FormControl(0, Validators.required),
    quantity: new FormControl(1, Validators.required)
  });

  this.products.push(newProduct);

  // Suscribir a cambios de nuevo producto
  newProduct.get('price')?.valueChanges.subscribe(() => this.calculateTotal());
  newProduct.get('quantity')?.valueChanges.subscribe(() => this.calculateTotal());
}

removeProduct(index: number) {
  this.products.removeAt(index);
  this.calculateTotal();
}

getSelectedProducts(): string {
  return this.products.controls.map(p => p.get('product')?.value).join(', ');
}

checkIfInvoiceExists() {
  const invoiceNumber = this.invoiceNumber?.value?.trim();

  if (!invoiceNumber) {
    this.invoiceCheckResult = '⚠️ Ingresa un número de factura.';
    return;
  }

  this.userService.checkInvoiceExists(invoiceNumber).subscribe({
    next: (res) => {
      this.invoiceCheckResult = res.exists
        ? '✅ Esta factura ya fue registrada en el sistema.'
        : '❌ Esta factura aún no ha sido registrada.';
    },
    error: () => {
      this.invoiceCheckResult = '❌ Ocurrió un error al verificar la factura.';
    }
  });
}


productList: { name: string }[] = [
  { name: 'Producto A' },
  { name: 'Producto B' },
  { name: 'Producto C' }
];

}