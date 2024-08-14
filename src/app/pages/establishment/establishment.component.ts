import { Component, type OnInit } from '@angular/core';
import { HeaderComponent } from '../../shared/components/header/header.component';
import { FormGroup, FormControl, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgFor } from '@angular/common';
import { EstablishmentService } from '../../shared/services/establishment.service';
import { AlertsService } from '../../shared/services/alerts.service';

@Component({
  selector: 'app-establishment',
  standalone: true,
  imports: [
    NgFor,
    HeaderComponent,
    FormsModule,
    ReactiveFormsModule
  ],
  templateUrl: './establishment.component.html',
  styleUrl: './establishment.component.css',
})
export class EstablishmentComponent implements OnInit {

  form!: FormGroup;
  loading = {
    create: false
  };

  itemsTable: any = []

  constructor(
    private establishmentService: EstablishmentService,
    private alertsService: AlertsService
  ) { }
  ngOnInit(): void {
    this.loadForm();
    this.get();
  }

  loadForm(): void {
    this.form = new FormGroup({
      nit: new FormControl('', Validators.required),
      name: new FormControl('', Validators.required),
      city: new FormControl('', Validators.required)
    });
  }

  get() {
    this.establishmentService.get().subscribe((response: any) => {
      console.log(response)
      this.itemsTable = response;
    })
  }

  delete(id: any) {
    this.establishmentService.delete(id).subscribe((response: any) => {
      this.alertsService.success('Eliminacion de establemiento', 'Se ha eliminado de manera exitosa el establecimiento')
      this.get();
    })
  }

  sendForm() {
    if (this.form.valid) {
      this.loading.create = true;
      this.establishmentService.create(this.prepateData()).subscribe((response: any) => {
        console.log(response)
        this.alertsService.success('Creacion de establecimiento', 'El establecimiento se creo de manera exitosa')
        this.loading.create = false;
        this.form.reset();
        this.get();
      }, error => {
        this.alertsService.error('Error creando establecimiento', 'Hubo un error al crear el establecimiento')
        this.loading.create = false;
        console.error(error);
      })
    }
  }

  prepateData() {
    return {
      "nameStore": this.name?.value,
      "nit": this.nit?.value,
      "city": this.city?.value
    }
  }

  get nit() { return this.form.get('nit'); }
  get name() { return this.form.get('name'); }
  get city() { return this.form.get('city'); }

}
